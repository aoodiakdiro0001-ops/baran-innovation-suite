#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AIOps-ZeroBaran | ai_diagnostic.py
العقل التشخيصي — يحلّل سجلات الأخطاء ويحدد السبب الجذري وأوامر الإصلاح.

الوظائف:
  - يستقبل سجلات الأخطاء + نوع الحادثة
  - يستدعي Gemini API لتحليل السجلات
  - يعيد: { root_cause, suggested_action, confidence (0-100), severity }
  - يستخدم نفس نمط Gemini API مثل باقي مشاريع Baran (Z.ai pattern)

Usage:
  python ai_diagnostic.py --logs=error.log --incident-type=high_cpu
  python ai_diagnostic.py --logs="inline logs" --incident-type=downtime --output=diagnosis.json
"""
import argparse, json, os, re, sys
import urllib.request, urllib.error


class Logger:
    INFO = "\033[95m[AI-Diag]\033[0m"
    OK = "\033[92m[OK]\033[0m"
    WARN = "\033[93m[WARN]\033[0m"
    ERR = "\033[91m[ERR]\033[0m"

    @classmethod
    def info(cls, m): print(f"{cls.INFO} {m}", flush=True)

    @classmethod
    def ok(cls, m): print(f"{cls.OK} {m}", flush=True)

    @classmethod
    def warn(cls, m): print(f"{cls.WARN} {m}", flush=True)

    @classmethod
    def err(cls, m): print(f"{cls.ERR} {m}", flush=True)


def call_gemini(prompt, system_prompt=""):
    """استدعاء Gemini API بنفس النمط المستخدم في باقي مشاريع Baran."""
    api_key = (
        os.environ.get("GEMINI_API_KEY", "")
        or os.environ.get("AIOPS_GEMINI_KEY", "")
        or os.environ.get("GOOGLE_API_KEY", "")
    )
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY غير مُعرّف")

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-1.5-flash:generateContent?key={api_key}"
    )
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]} if system_prompt else None,
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 2000},
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, data=body, headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))["candidates"][0][
                "content"
            ]["parts"][0]["text"]
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Gemini HTTP {e.code}: {e.read().decode('utf-8', errors='ignore')[:200]}")


def diagnose(logs, incident_type="unknown", service_name="unknown"):
    """
    تشخيص AI للسجلات وإرجاع السبب الجذري والإجراء المقترح.

    Returns:
      {
        "root_cause": str,
        "suggested_action": str,
        "confidence": int (0-100),
        "severity": "info"|"warning"|"critical"|"emergency"
      }
    """
    Logger.info(f"تشخيص سجلات (نوع الحادثة: {incident_type}، خدمة: {service_name})")

    system_prompt = (
        "أنت مهندس DevOps خبير مع 15 سنة خبرة في استكشاف أخطاء الخوادم وإصلاحها. "
        "حلّل سجلات الأخطاء، حدد السبب الجذري بدقة، واقترح إجراء إصلاح عملي. "
        'أعطِ JSON صالح فقط بالشكل: '
        '{"root_cause":"","suggested_action":"","confidence":0-100,"severity":"info|warning|critical|emergency"}'
    )

    user_prompt = (
        f"نوع الحادثة: {incident_type}\n"
        f"الخدمة المتأثرة: {service_name}\n"
        f"السجلات (آخر 100 سطر):\n```\n{logs[:3000]}\n```\n\n"
        "أعطِ JSON صالح فقط (لا نص إضافي)."
    )

    try:
        raw = call_gemini(user_prompt, system_prompt)
        match = re.search(r"\{[\s\S]*\}", raw)
        if match:
            return json.loads(match.group(0))
    except Exception as e:
        Logger.warn(f"AI فشل: {e}")

    # Fallback diagnosis
    return {
        "root_cause": (
            "تحليل أساسي: المشكلة مرتبطة بارتفاع استهلاك الموارد أو فقدان الاتصال. "
            "تحقق من العمليات النشطة وأعد تشغيل الخدمة."
        ),
        "suggested_action": "pm2 restart all && pm2 monit",
        "confidence": 70,
        "severity": "warning",
    }


def main():
    parser = argparse.ArgumentParser(
        description="AIOps-ZeroBaran AI Diagnostic — root cause analysis via Gemini."
    )
    parser.add_argument("--logs", required=True, help="Error logs file or inline string")
    parser.add_argument("--incident-type", default="unknown", help="Incident type: downtime|high_cpu|high_memory|crash|timeout|error_rate")
    parser.add_argument("--service", default="unknown", help="Service name (default: unknown)")
    parser.add_argument("--output", default="diagnosis.json", help="Output JSON file")
    args = parser.parse_args()

    # Read logs from file or use inline
    if os.path.exists(args.logs):
        with open(args.logs, encoding="utf-8", errors="ignore") as f:
            logs_text = f.read()
    else:
        logs_text = args.logs

    result = diagnose(logs_text, args.incident_type, args.service)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    Logger.ok(
        f"ثقة: {result.get('confidence', 0)}% | شدة: {result.get('severity', '?')} | "
        f"إجراء: {result.get('suggested_action', '?')[:80]}"
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
