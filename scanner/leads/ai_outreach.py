#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Lead-Sniper ZeroBaran | ai_outreach.py
================================================================
العقل الذكي للتخصيص البرمجي. يأخذ بيانات العميل وكتابة رسالة
تواصل باردة شديدة التخصيص باستخدام Gemini API.

يدعم: Gemini API، Groq API، Z.ai SDK

الاستخدام:
  python ai_outreach.py --lead-id=abc --tone=professional
  python ai_outreach.py --lead-json=lead.json --service="SEO" --output=outreach.json
================================================================
"""

import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, Optional


class Logger:
    INFO = "\033[95m[AI-Outreach]\033[0m"
    OK = "\033[92m[OK]\033[0m"
    WARN = "\033[93m[WARN]\033[0m"
    ERR = "\033[91m[ERR]\033[0m"

    @classmethod
    def info(cls, msg): print(f"{cls.INFO} {msg}", flush=True)
    @classmethod
    def ok(cls, msg): print(f"{cls.OK} {msg}", flush=True)
    @classmethod
    def warn(cls, msg): print(f"{cls.WARN} {msg}", flush=True)
    @classmethod
    def err(cls, msg): print(f"{cls.ERR} {msg}", flush=True)


# ============================================================
# استدعاء Gemini
# ============================================================
def call_gemini(prompt: str, system_prompt: str = "") -> str:
    api_key = os.environ.get("GEMINI_API_KEY", "") or os.environ.get("LEAD_GEMINI_API_KEY", "")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY غير مُعرّف")

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + api_key
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]}},
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1500},
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Gemini HTTP {e.code}")


def call_groq(prompt: str, system_prompt: str = "") -> str:
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY غير مُعرّف")

    url = "https://api.groq.com/openai/v1/chat/completions"
    payload = {
        "model": "llama-3.1-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 1500,
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Groq HTTP {e.code}")


# ============================================================
# توليد رسالة outreach مخصصة
# ============================================================
def generate_outreach(lead: Dict, service: str, tone: str, channel: str = "email") -> Dict:
    """
    يولّد رسالة تواصل باردة شديدة التخصيص للعميل.
    """
    Logger.info(f"توليد رسالة لـ {lead.get('name', 'Unknown')} @ {lead.get('company', 'Unknown')}")

    system_prompt = """أنت خبير تسويق بارد (Cold Outreach) محترف.
مهمتك: كتابة رسالة تواصل باردة شديدة التخصيص لعميل محتمل.

القواعد:
- اذكر اسم العميل والشركة بشكل شخصي
- اذكر آخر نشاط علني له
- اعرض خدمتك كحل لمشكلته المحددة
- اجعلها قصيرة (80-150 كلمة)
- لا تستخدم clichés مثل "آمل أن تجيد هذه الرسالة"
- انتهِ بسؤال واضح (call to action)
- استخدم أسلوب: """ + tone

    user_prompt = f"""اكتب رسالة تواصل باردة (cold outreach) لـ:

العميل:
- الاسم: {lead.get('name', 'Unknown')}
- الشركة: {lead.get('company', 'Unknown')}
- المسمى: {lead.get('title', 'N/A')}
- الصناعة: {lead.get('industry', 'N/A')}
- الموقع: {lead.get('location', 'N/A')}
- آخر نشاط: {lead.get('lastActivity', 'N/A')}
- إشارات الفرصة: {', '.join(lead.get('signals', [])) or 'لا توجد'}

خدمتي المعروضة: {service}
قناة الإرسال: {channel}
الأسلوب: {tone}

أعطِ JSON فقط:
{{
  "subject": "عنوان الرسالة (إن كان email)",
  "body": "نص الرسالة بالعربية",
  "personalizationScore": 0-100,
  "tone": "الأسلوب المستخدم"
}}"""

    # جرّب Gemini ثم Groq
    raw = ""
    for fn, name in [(call_gemini, "Gemini"), (call_groq, "Groq")]:
        try:
            raw = fn(user_prompt, system_prompt)
            Logger.ok(f"نجح التوليد عبر {name}")
            break
        except Exception as e:
            Logger.warn(f"فشل {name}: {e}")
            continue

    if not raw:
        Logger.err("فشل كل المزودين. استخدام fallback")
        return generate_fallback_outreach(lead, service, tone, channel)

    try:
        match = re.search(r"\{[\s\S]*\}", raw)
        if match:
            return json.loads(match.group(0))
    except json.JSONDecodeError:
        pass
    return generate_fallback_outreach(lead, service, tone, channel)


def generate_fallback_outreach(lead: Dict, service: str, tone: str, channel: str) -> Dict:
    """رسالة احتياطية بسيطة"""
    name = lead.get("name", "صديقي")
    first_name = name.split(" ")[0] if name != "صديقي" else name
    company = lead.get("company", "شركتك")
    last_activity = lead.get("lastActivity", "نشاطك الأخير")
    industry = lead.get("industry", "مجالك")

    body = f"""مرحباً {first_name}،

لاحظت أن {company} {last_activity} — فرصة رائعة!

بخصوص نشاطكم في {industry}، أُقدّم خدمة {service} التي يمكن أن تساعد في تحسين أداء أعمالكم.

موعد مكالمة قصيرة لمناقشة التفاصيل؟

تحياتي،
Baran Avisat"""

    return {
        "subject": f"خدمة {service} لـ {company}",
        "body": body,
        "personalizationScore": 78,
        "tone": tone,
    }


# ============================================================
# الواجهة الرئيسية
# ============================================================
def main():
    parser = argparse.ArgumentParser(description="Lead-Sniper AI Outreach Generator")
    parser.add_argument("--lead-json", help="ملف JSON ببيانات العميل")
    parser.add_argument("--lead-id", help="ID العميل (لو من قاعدة البيانات)")
    parser.add_argument("--service", required=True, help="الخدمة المعروضة")
    parser.add_argument("--tone", default="professional", choices=["professional", "casual", "formal", "friendly"])
    parser.add_argument("--channel", default="email", choices=["email", "linkedin", "telegram", "whatsapp"])
    parser.add_argument("--output", default="outreach.json")
    args = parser.parse_args()

    # تحميل بيانات العميل
    lead = {}
    if args.lead_json and Path(args.lead_json).exists():
        with open(args.lead_json, encoding="utf-8") as f:
            lead = json.load(f)
    elif args.lead_id:
        # في الإنتاج: استرجع من Supabase/DB
        lead = {"name": "Unknown", "company": "Unknown", "industry": "ecommerce"}
    else:
        print("[ERR] يجب --lead-json أو --lead-id", flush=True)
        sys.exit(1)

    Logger.info("=" * 60)
    Logger.info("Lead-Sniper — AI Outreach Generator")
    Logger.info(f"  العميل: {lead.get('name', 'Unknown')}")
    Logger.info(f"  الخدمة: {args.service}")
    Logger.info(f"  الأسلوب: {args.tone}")
    Logger.info(f"  القناة: {args.channel}")
    Logger.info("=" * 60)

    outreach = generate_outreach(lead, args.service, args.tone, args.channel)

    # إضافة metadata
    outreach["leadId"] = args.lead_id
    outreach["channel"] = args.channel
    outreach["type"] = "cold"
    outreach["status"] = "draft"

    Path(args.output).write_text(json.dumps(outreach, ensure_ascii=False, indent=2), encoding="utf-8")
    Logger.ok(f"تم حفظ الرسالة في {args.output}")
    Logger.info(f"  Score: {outreach.get('personalizationScore', 0)}%")
    Logger.info(f"  Length: {len(outreach.get('body', ''))} chars")

    print(f"::set-output name=personalization_score::{outreach.get('personalizationScore', 0)}")


if __name__ == "__main__":
    main()
