#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Cyber-SentinelBaran | supabase_client.py
================================================================
طبقة الأرشيف - تخزين نتائج الفحص وتاريخ الثغرات في Supabase.
يوفر:
  - upsert_scan: إنشاء/تحديث سجل فحص
  - upsert_vulnerability: تخزين ثغرة
  - get_scan_history: جلب سجل الفحوصات التاريخية
  - get_open_vulnerabilities: جلب الثغرات المفتوحة

الاستخدام:
  python supabase_client.py --action=save-scan --report=ai-report.json
================================================================
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional

sys.path.insert(0, str(Path(__file__).parent))
from scanner import Logger


class SupabaseClient:
    """عميل مبسّط لـ Supabase PostgREST API"""

    def __init__(self, url: str, anon_key: str):
        self.url = url.rstrip("/")
        self.anon_key = anon_key
        self.headers = {
            "apikey": anon_key,
            "Authorization": f"Bearer {anon_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    def _request(self, method: str, table: str, body: Optional[Dict] = None, params: str = "") -> Dict[str, Any]:
        url = f"{self.url}/rest/v1/{table}"
        if params:
            url += f"?{params}"
        data = json.dumps(body).encode("utf-8") if body else None
        req = urllib.request.Request(url, data=data, headers=self.headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status == 204:
                    return {}
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            err = e.read().decode("utf-8")
            Logger.err(f"Supabase {method} {table}: HTTP {e.code} - {err[:200]}")
            raise

    def save_scan(self, scan: Dict[str, Any]) -> Dict[str, Any]:
        """حفظ سجل فحص جديد"""
        return self._request("POST", "scans", body=scan)

    def save_vulnerabilities(self, vulns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """حفظ دفعة ثغرات"""
        return self._request("POST", "vulnerabilities", body=vulns)

    def get_scans(self, target: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """جلب آخر الفحوصات"""
        params = f"order=started_at.desc&limit={limit}"
        if target:
            params += f"&target=eq.{target}"
        return self._request("GET", "scans", params=params)

    def get_open_vulns(self, scan_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """جلب الثغرات المفتوحة"""
        params = "status=eq.open&order=detected_at.desc"
        if scan_id:
            params += f"&scan_id=eq.{scan_id}"
        return self._request("GET", "vulnerabilities", params=params)

    def update_vuln_status(self, vuln_id: str, status: str) -> Dict[str, Any]:
        """تحديث حالة ثغرة"""
        return self._request(
            "PATCH",
            "vulnerabilities",
            body={"status": status, "fixed_at": datetime.now(timezone.utc).isoformat() if status == "fixed" else None},
            params=f"id=eq.{vuln_id}",
        )


# ============================================================
# SQL مطلوب إنشاؤه في Supabase Dashboard
# ============================================================
SUPABASE_SQL = """
-- Cyber-SentinelBaran | Supabase Schema
-- نفّذ هذا في SQL Editor في Supabase Dashboard

CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target TEXT NOT NULL,
  scan_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  total_files INTEGER DEFAULT 0,
  total_findings INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  triggered_by TEXT DEFAULT 'cron',
  commit_sha TEXT
);

CREATE TABLE IF NOT EXISTS vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  severity TEXT NOT NULL,
  category TEXT,
  cve_id TEXT,
  file_path TEXT,
  line_number INTEGER,
  code_snippet TEXT,
  description TEXT,
  remediation TEXT,
  ai_suggestion TEXT,
  status TEXT DEFAULT 'open',
  detected_at TIMESTAMPTZ DEFAULT now(),
  fixed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_vulns_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_vulns_status ON vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_scans_target ON scans(target);

-- Row Level Security (RLS)
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;

-- سياسة السماح للـ service_role key بالكامل
CREATE POLICY "service_all_scans" ON scans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_vulns" ON vulnerabilities FOR ALL USING (true) WITH CHECK (true);
"""


def save_report_to_supabase(report: Dict[str, Any], target: str, scan_type: str, triggered_by: str = "cron"):
    """يحفظ التقرير الكامل في Supabase"""
    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_key = os.environ.get("SUPABASE_ANON_KEY", "")
    if not supabase_url or not supabase_key:
        Logger.warn("Supabase غير مُكوّن. تجاهل الحفظ.")
        return None

    client = SupabaseClient(supabase_url, supabase_key)
    meta = report.get("scan_metadata", {})
    summary = report.get("summary", {})
    sev = summary.get("by_severity", {})

    scan_record = {
        "target": target,
        "scan_type": scan_type,
        "status": "completed",
        "started_at": meta.get("started_at"),
        "finished_at": meta.get("finished_at"),
        "total_findings": summary.get("total_findings", 0),
        "critical_count": sev.get("critical", 0),
        "high_count": sev.get("high", 0),
        "medium_count": sev.get("medium", 0),
        "low_count": sev.get("low", 0),
        "triggered_by": triggered_by,
        "commit_sha": meta.get("commit_sha"),
    }

    try:
        saved_scan = client.save_scan(scan_record)
        Logger.ok(f"تم حفظ الفحص في Supabase: {saved_scan.get('id', '?')}")
        scan_id = saved_scan.get("id")

        # حفظ الثغرات
        vulns = report.get("findings", [])
        if scan_id and vulns:
            vuln_records = []
            for v in vulns:
                ai = v.get("ai_analysis", {})
                vuln_records.append({
                    "scan_id": scan_id,
                    "title": v.get("title", ""),
                    "severity": v.get("severity", "info"),
                    "category": v.get("category", ""),
                    "cve_id": v.get("cve_id"),
                    "file_path": v.get("file_path"),
                    "line_number": v.get("line_number"),
                    "code_snippet": v.get("code_snippet"),
                    "description": v.get("description", ""),
                    "ai_suggestion": ai.get("fix_code") if isinstance(ai, dict) else None,
                })
            client.save_vulnerabilities(vuln_records)
            Logger.ok(f"تم حفظ {len(vuln_records)} ثغرة في Supabase")

        return saved_scan
    except Exception as e:
        Logger.err(f"فشل الحفظ في Supabase: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Cyber-SentinelBaran Supabase Client")
    parser.add_argument("--action", required=True, choices=["save-scan", "get-history", "get-open", "print-sql"])
    parser.add_argument("--report", help="ملف التقرير (لـ save-scan)")
    parser.add_argument("--target", help="الهدف (لـ get-history)")
    parser.add_argument("--scan-type", default="full")
    parser.add_argument("--triggered-by", default="cron")
    args = parser.parse_args()

    if args.action == "print-sql":
        print(SUPABASE_SQL)
        return

    if args.action == "save-scan":
        if not args.report:
            Logger.err("--report مطلوب")
            sys.exit(1)
        report = json.loads(Path(args.report).read_text(encoding="utf-8"))
        save_report_to_supabase(report, args.target or "unknown", args.scan_type, args.triggered_by)
        return

    # get-history, get-open
    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_key = os.environ.get("SUPABASE_ANON_KEY", "")
    if not supabase_url or not supabase_key:
        Logger.err("Supabase غير مُكوّن")
        sys.exit(1)
    client = SupabaseClient(supabase_url, supabase_key)
    if args.action == "get-history":
        result = client.get_scans(args.target, limit=20)
    else:
        result = client.get_open_vulns()
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
