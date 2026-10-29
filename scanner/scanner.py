#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Cyber-SentinelBaran | scanner.py
================================================================
سكربت الفحص الأمني الشامل - يجمع Semgrep + Nuclei + Nmap
يتم تشغيله داخل GitHub Actions runner (Ubuntu Linux) ويُنتج:
  - تقرير JSON خام
  - سجل تمشيط مفصل
  - حالة الفحص في قاعدة البيانات (Supabase)

الاستخدام:
  python scanner.py --target=github.com/user/repo --scan-type=full
  python scanner.py --target=https://api.example.com --scan-type=nuclei
================================================================
"""

import argparse
import json
import os
import subprocess
import sys
import time
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any

# ============================================================
# مُسجّل ملوّن للطرفية
# ============================================================
class Logger:
    INFO = "\033[94m[INFO]\033[0m"
    OK = "\033[92m[OK]\033[0m"
    WARN = "\033[93m[WARN]\033[0m"
    ERR = "\033[91m[ERR]\033[0m"
    AI = "\033[95m[AI]\033[0m"

    @classmethod
    def info(cls, msg: str) -> None:
        print(f"{cls.INFO} {msg}", flush=True)

    @classmethod
    def ok(cls, msg: str) -> None:
        print(f"{cls.OK} {msg}", flush=True)

    @classmethod
    def warn(cls, msg: str) -> None:
        print(f"{cls.WARN} {msg}", flush=True)

    @classmethod
    def err(cls, msg: str) -> None:
        print(f"{cls.ERR} {msg}", flush=True)

    @classmethod
    def ai(cls, msg: str) -> None:
        print(f"{cls.AI} {msg}", flush=True)


# ============================================================
# تشغيل Semgrep (SAST) - فحص الكود المصدر
# ============================================================
def run_semgrep(target_path: str) -> List[Dict[str, Any]]:
    """
    يفحص الكود المصدري بحثاً عن ثغرات OWASP Top 10 وحقن SQL وXSS...
    يستخدم قواعد p/default وp/owasp-top-ten وp/security-audit
    """
    Logger.info(f"تشغيل Semgrep على: {target_path}")
    findings: List[Dict[str, Any]] = []

    try:
        cmd = [
            "semgrep",
            "scan",
            "--config=auto",
            "--config=p/owasp-top-ten",
            "--config=p/security-audit",
            "--config=p/secrets",
            "--json",
            "--no-rewrite-rule-ids",
            target_path,
        ]
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=900,
            check=False,
        )
        if result.returncode == 0 or result.stdout:
            try:
                report = json.loads(result.stdout)
                for r in report.get("results", []):
                    severity_map = {"ERROR": "critical", "WARNING": "high", "INFO": "low"}
                    sev = severity_map.get(r.get("extra", {}).get("severity", ""), "medium")
                    findings.append({
                        "tool": "semgrep",
                        "rule_id": r.get("check_id", ""),
                        "title": r.get("check_id", "").split(".")[-1] or "SAST finding",
                        "severity": sev,
                        "category": "OWASP SAST",
                        "cve_id": None,
                        "file_path": r.get("path", ""),
                        "line_number": r.get("start", {}).get("line"),
                        "code_snippet": r.get("extra", {}).get("lines", ""),
                        "description": r.get("extra", {}).get("message", "ثغرة في الكود المصدري"),
                    })
                Logger.ok(f"Semgrep: تم رصد {len(findings)} ثغرة")
            except json.JSONDecodeError:
                Logger.warn("Semgrep: فشل تحليل JSON")
        else:
            Logger.warn(f"Semgrep فشل: {result.stderr[:200]}")
    except FileNotFoundError:
        Logger.warn("Semgrep غير مثبت. تجاهل.")
    except subprocess.TimeoutExpired:
        Logger.warn("Semgrep انتهى الوقت (15 دقيقة)")

    return findings


# ============================================================
# تشغيل Nuclei (DAST) - فحص الويب
# ============================================================
def run_nuclei(target_url: str) -> List[Dict[str, Any]]:
    """
    يفحص عنوان URL بحثاً عن ثغرات معروفة باستخدام قوالب nuclei.
    يستخدم templates رسمية: cves, exposures, misconfigurations, vulnerabilities
    """
    Logger.info(f"تشغيل Nuclei على: {target_url}")
    findings: List[Dict[str, Any]] = []

    if not target_url.startswith(("http://", "https://")):
        Logger.warn("Nuclei يتطلب URL. تجاهل.")
        return findings

    try:
        cmd = [
            "nuclei",
            "-u", target_url,
            "-jsonl",
            "-severity", "low,medium,high,critical",
            "-silent",
            "-rate-limit", "30",
        ]
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=1200,
            check=False,
        )
        for line in result.stdout.strip().splitlines():
            if not line.strip():
                continue
            try:
                r = json.loads(line)
                sev = r.get("info", {}).get("severity", "info").lower()
                findings.append({
                    "tool": "nuclei",
                    "rule_id": r.get("template-id", ""),
                    "title": r.get("info", {}).get("name", "DAST finding"),
                    "severity": sev,
                    "category": "OWASP DAST",
                    "cve_id": r.get("matcher-name"),
                    "file_path": r.get("matched-at", target_url),
                    "line_number": None,
                    "code_snippet": None,
                    "description": r.get("info", {}).get("description", "ثغرة في الويب"),
                })
            except json.JSONDecodeError:
                continue
        Logger.ok(f"Nuclei: تم رصد {len(findings)} ثغرة")
    except FileNotFoundError:
        Logger.warn("Nuclei غير مثبت. تجاهل.")
    except subprocess.TimeoutExpired:
        Logger.warn("Nuclei انتهى الوقت (20 دقيقة)")

    return findings


# ============================================================
# تشغيل Nmap - فحص المنافذ
# ============================================================
def run_nmap(target_host: str) -> List[Dict[str, Any]]:
    """
    يفحص المنافذ المفتوحة والخدمات وتحدد الثغرات المعروفة عبر --script vuln
    """
    Logger.info(f"تشغيل Nmap على: {target_host}")
    findings: List[Dict[str, Any]] = []

    # استخراج hostname من URL
    if target_host.startswith(("http://", "https://")):
        from urllib.parse import urlparse
        target_host = urlparse(target_host).hostname or target_host

    try:
        cmd = [
            "nmap",
            "-sV",
            "-p", "1-1000,3306,5432,6379,8080,8443,9200,27017",
            "--script", "vuln",
            "-T4",
            "-Pn",
            target_host,
        ]
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600,
            check=False,
        )
        output = result.stdout or ""
        # استخراج ثغرات من خرج Nmap
        for line in output.splitlines():
            if "VULNERABLE" in line.upper() or "CVE-" in line:
                findings.append({
                    "tool": "nmap",
                    "rule_id": "nmap-vuln",
                    "title": line.strip(),
                    "severity": "medium",
                    "category": "Network Service Vulnerability",
                    "cve_id": None,
                    "file_path": target_host,
                    "line_number": None,
                    "code_snippet": None,
                    "description": f"خدمة في {target_host} بها ثغرة: {line.strip()}",
                })
        Logger.ok(f"Nmap: تم رصد {len(findings)} ثغرة شبكية")
    except FileNotFoundError:
        Logger.warn("Nmap غير مثبت. تجاهل.")
    except subprocess.TimeoutExpired:
        Logger.warn("Nmap انتهى الوقت (10 دقائق)")

    return findings


# ============================================================
# تقييم الخطورة المُوحَّد
# ============================================================
def score_severity(f: Dict[str, Any]) -> int:
    """يحوّل الخطورة النصية إلى رقم 0-100"""
    s = str(f.get("severity", "")).lower()
    return {
        "critical": 95,
        "high": 75,
        "medium": 50,
        "low": 25,
        "info": 10,
    }.get(s, 30)


# ============================================================
# الواجهة الرئيسية
# ============================================================
def main():
    parser = argparse.ArgumentParser(description="Cyber-SentinelBaran Scanner")
    parser.add_argument("--target", required=True, help="الهدف (مستودع أو URL)")
    parser.add_argument(
        "--scan-type",
        default="full",
        choices=["full", "semgrep", "nuclei", "nmap"],
        help="نوع الفحص",
    )
    parser.add_argument("--output", default="./scan-results.json", help="ملف النتائج")
    parser.add_argument("--commit-sha", default=None, help="SHA الكوميت (للربط)")
    parser.add_argument("--triggered-by", default="cron", help="منطلق الفحص")
    args = parser.parse_args()

    Logger.info("=" * 60)
    Logger.info("Cyber-SentinelBaran Scanner - بدء فحص أمني جديد")
    Logger.info(f"  الهدف: {args.target}")
    Logger.info(f"  النوع: {args.scan_type}")
    Logger.info(f"  المُطلق: {args.triggered_by}")
    Logger.info(f"  التوقيت: {datetime.now(timezone.utc).isoformat()}")
    Logger.info("=" * 60)

    started_at = datetime.now(timezone.utc)
    all_findings: List[Dict[str, Any]] = []

    # تنفيذ الفحوصات حسب النوع
    if args.scan_type in ("full", "semgrep"):
        all_findings.extend(run_semgrep(args.target))
    if args.scan_type in ("full", "nuclei"):
        all_findings.extend(run_nuclei(args.target))
    if args.scan_type in ("full", "nmap"):
        all_findings.extend(run_nmap(args.target))

    # إثراء كل ثغرة
    for f in all_findings:
        f["risk_score"] = score_severity(f)
        f["detected_at"] = datetime.now(timezone.utc).isoformat()

    # إحصاءات
    sev_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    for f in all_findings:
        sev = f.get("severity", "info").lower()
        if sev in sev_counts:
            sev_counts[sev] += 1

    finished_at = datetime.now(timezone.utc)
    duration = (finished_at - started_at).total_seconds()

    report = {
        "scan_metadata": {
            "target": args.target,
            "scan_type": args.scan_type,
            "triggered_by": args.triggered_by,
            "commit_sha": args.commit_sha,
            "started_at": started_at.isoformat(),
            "finished_at": finished_at.isoformat(),
            "duration_seconds": duration,
        },
        "summary": {
            "total_findings": len(all_findings),
            "by_severity": sev_counts,
            "avg_risk_score": (
                sum(f["risk_score"] for f in all_findings) / len(all_findings)
                if all_findings
                else 0
            ),
        },
        "findings": all_findings,
    }

    # حفظ النتائج
    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    Logger.ok(f"تم حفظ التقرير في: {out_path}")

    # طباعة ملخص
    Logger.info("=" * 60)
    Logger.info("ملخص الفحص:")
    Logger.info(f"  إجمالي الثغرات: {len(all_findings)}")
    Logger.info(f"  حرجة: {sev_counts['critical']}")
    Logger.info(f"  عالية: {sev_counts['high']}")
    Logger.info(f"  متوسطة: {sev_counts['medium']}")
    Logger.info(f"  منخفضة: {sev_counts['low']}")
    Logger.info(f"  المدة: {duration:.1f} ثانية")
    Logger.info("=" * 60)

    # إشارة للأدوات التالية في pipeline
    print(f"::set-output name=findings::{len(all_findings)}")
    print(f"::set-output name=critical::{sev_counts['critical']}")
    print(f"::set-output name=report_path::{out_path}")

    # إنهاء برمز خطأ إذا ثغرات حرجة
    if sev_counts["critical"] > 0:
        Logger.err(f"تم رصد {sev_counts['critical']} ثغرة حرجة — راجع التقرير")
        sys.exit(1)


if __name__ == "__main__":
    main()
