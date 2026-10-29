#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Cyber-SentinelBaran | ai_analyzer.py
================================================================
العقل الذكي - يأخذ تقرير الفحص الخام، يحلله، ويُولّد كود الإصلاح.

يدعم مزودين:
  - Google Gemini API (Free Tier): 15 طلب/دقيقة، نموذج gemini-1.5-flash
  - Groq API (Free Tier): نموذج llama-3.1-8b-instruct (سريع جداً)

الاستخدام:
  python ai_analyzer.py --scan-results=scan-results.json
  python ai_analyzer.py --scan-results=scan-results.json --provider=gemini
================================================================
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Any, Optional

# استيراد مُسجّل scanner
sys.path.insert(0, str(Path(__file__).parent))
from scanner import Logger


# ============================================================
# استدعاء Google Gemini API
# ============================================================
def call_gemini(prompt: str, system_prompt: str = "") -> str:
    """
    يستدعي Gemini 1.5 Flash عبر REST API مباشرة (بدون SDK).
    يتطلب GEMINI_API_KEY في متغيرات البيئة.
    """
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY غير مُعرّف")

    import urllib.request
    import urllib.error

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": prompt}]}
        ],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 1500,
        },
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8")
        raise RuntimeError(f"Gemini HTTP {e.code}: {err[:200]}")
    except Exception as e:
        raise RuntimeError(f"Gemini error: {e}")


# ============================================================
# استدعاء Groq API (البديل السريع)
# ============================================================
def call_groq(prompt: str, system_prompt: str = "") -> str:
    """
    يستدعي Groq llama-3.1-8b-instruct. أسرع بكثير من Gemini.
    يتطلب GROQ_API_KEY في متغيرات البيئة.
    """
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY غير مُعرّف")

    import urllib.request
    import urllib.error

    url = "https://api.groq.com/openai/v1/chat/completions"
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 1500,
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8")
        raise RuntimeError(f"Groq HTTP {e.code}: {err[:200]}")
    except Exception as e:
        raise RuntimeError(f"Groq error: {e}")


# ============================================================
# تحليل ثغرة واحدة
# ============================================================
def analyze_finding(finding: Dict[str, Any], provider: str = "gemini") -> Dict[str, Any]:
    """
    يأخذ ثغرة، يحللها، ويرجع JSON:
      {
        "risk_score": int (0-100),
        "explanation": str,
        "fix_code": str,
        "recommendations": str
      }
    """
    system_prompt = """أنت خبير أمن سيبراني متخصص في تحليل ثغرات الكود واقتراح إصلاحات آمنة.
مهامك:
1) تقييم درجة الخطورة من 0 إلى 100
2) شرح موجز للثغرة بالعربية
3) كتابة كود الإصلاح المقترح بشكل آمن ومباشر
أعطِ الرد بتنسيق JSON صارم فقط:
{
  "risk_score": <number>,
  "explanation": "<string>",
  "fix_code": "<string>",
  "recommendations": "<string>"
}
بدون أي تعليق إضافي قبل أو بعد الـ JSON."""

    user_prompt = f"""ثغرة: {finding.get('title', '')}
الخطورة المبدئية: {finding.get('severity', '')}
الفئة: {finding.get('category', '')}
الوصف: {finding.get('description', '')}
الكود المصاب:
```
{finding.get('code_snippet') or '(لا يوجد كود متاح)'}
```
الملف: {finding.get('file_path', '')}:{finding.get('line_number', '')}

حلل وأعطِ الرد بصيغة JSON فقط."""

    try:
        if provider == "gemini":
            raw = call_gemini(user_prompt, system_prompt)
        else:
            raw = call_groq(user_prompt, system_prompt)

        # استخراج JSON
        import re
        match = re.search(r"\{[\s\S]*\}", raw)
        if match:
            return json.loads(match.group(0))
        return {"explanation": raw, "risk_score": 50, "fix_code": "", "recommendations": ""}
    except Exception as e:
        Logger.err(f"فشل تحليل الثغرة: {e}")
        return {"explanation": f"خطأ: {e}", "risk_score": 0, "fix_code": "", "recommendations": ""}


# ============================================================
# تحليل تقرير كامل
# ============================================================
def analyze_report(report: Dict[str, Any], provider: str = "gemini") -> Dict[str, Any]:
    """
    يأخذ تقرير كامل، يحلل الثغرات الحرجة والعالية فقط (لتوفير الوقت والـ quota).
    """
    findings = report.get("findings", [])
    Logger.info(f"تحليل {len(findings)} ثغرة باستخدام {provider}")

    # رتّب الثغرات حسب الخطورة
    sev_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
    findings.sort(key=lambda f: sev_order.get(f.get("severity", "info").lower(), 5))

    # حلّل أهم 10 ثغرات (حرجة + عالية)
    top_findings = [f for f in findings if f.get("severity", "").lower() in ("critical", "high")][:10]
    Logger.info(f"سيتم تحليل {len(top_findings)} ثغرة (حرجة + عالية)")

    enriched = []
    for i, f in enumerate(top_findings):
        Logger.ai(f"تحليل ثغرة {i+1}/{len(top_findings)}: {f.get('title', '')[:60]}")
        analysis = analyze_finding(f, provider)
        time.sleep(0.5)  # احترام rate limit
        enriched.append({**f, "ai_analysis": analysis})

    # تقرير عام للنظام كله
    Logger.ai("توليد التقرير العام للمخاطر...")
    overall_prompt = f"""تحليل أمني عام. أعطِ JSON:
{{
  "overall_risk_score": <number 0-100>,
  "summary": "<arabic text>",
  "top_recommendations": "<arabic text, separated by \\n>"
}}

الإحصائيات:
- إجمالي الثغرات: {len(findings)}
- حرجة: {sum(1 for f in findings if f.get('severity')=='critical')}
- عالية: {sum(1 for f in findings if f.get('severity')=='high')}
- متوسطة: {sum(1 for f in findings if f.get('severity')=='medium')}
- منخفضة: {sum(1 for f in findings if f.get('severity')=='low')}

الثغرات الحرجة:
{chr(10).join(f"- {f.get('title','')}: {f.get('description','')[:200]}" for f in top_findings[:5])}"""

    try:
        if provider == "gemini":
            raw = call_gemini(overall_prompt, "أنت خبير أمن سيبراني. أعطِ رد JSON فقط.")
        else:
            raw = call_groq(overall_prompt, "أنت خبير أمن سيبراني. أعطِ رد JSON فقط.")
        import re
        match = re.search(r"\{[\s\S]*\}", raw)
        overall = json.loads(match.group(0)) if match else {}
    except Exception as e:
        Logger.warn(f"فشل التقرير العام: {e}")
        overall = {"overall_risk_score": 50, "summary": "تعذّر توليد التقرير العام", "top_recommendations": ""}

    return {
        "scan_metadata": report.get("scan_metadata", {}),
        "overall_assessment": overall,
        "findings": report.get("findings", []),
        "enriched_findings": enriched,
    }


# ============================================================
# الواجهة الرئيسية
# ============================================================
def main():
    parser = argparse.ArgumentParser(description="Cyber-SentinelBaran AI Analyzer")
    parser.add_argument("--scan-results", required=True, help="ملف نتائج scanner.py")
    parser.add_argument(
        "--provider",
        default="gemini",
        choices=["gemini", "groq"],
        help="مزود الذكاء الاصطناعي",
    )
    parser.add_argument("--output", default="./ai-report.json", help="ملف تقرير AI")
    args = parser.parse_args()

    Logger.info("=" * 60)
    Logger.info("Cyber-SentinelBaran AI Analyzer")
    Logger.info(f"  المدخلات: {args.scan_results}")
    Logger.info(f"  المزود: {args.provider}")
    Logger.info("=" * 60)

    report = json.loads(Path(args.scan_results).read_text(encoding="utf-8"))
    ai_report = analyze_report(report, args.provider)

    out_path = Path(args.output)
    out_path.write_text(json.dumps(ai_report, ensure_ascii=False, indent=2), encoding="utf-8")
    Logger.ok(f"تم حفظ تقرير AI في: {out_path}")

    # ملخص
    overall = ai_report.get("overall_assessment", {})
    Logger.info(f"  درجة المخاطر الإجمالية: {overall.get('overall_risk_score', '?')}/100")
    Logger.info(f"  ملخص: {overall.get('summary', '')[:200]}")
    Logger.info(f"  ثغرات مُثرية: {len(ai_report.get('enriched_findings', []))}")


if __name__ == "__main__":
    main()
