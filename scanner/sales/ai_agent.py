#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Omni-Sales ZeroBaran | ai_agent.py
================================================================
العقل التجاري الذاتي. يأخذ رسالة العميل + تاريخ المحادثة + سياق
RAG، ويُولّد رداً احترافياً يهدف لإتمام البيع أو حل المشكلة.

يدعم: Gemini API، Groq API، Z.ai SDK

الاستخدام:
  python ai_agent.py --message="كم سعر الباقة؟" --conversation-id=abc
  python ai_agent.py --message="أريد الشراء" --kb-context=kb.json --tone=professional

الخرج (JSON على stdout):
{
  "response": "نص الرد",
  "confidence": 0-100,
  "intent": "sales|pricing|support|complaint|booking|info",
  "should_escalate": bool,
  "model": "gemini|groq|fallback",
  "rag_used": ["kb-id-1", "kb-id-2"]
}
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
from typing import Dict, List, Optional


class Logger:
    INFO = "\033[95m[AI-Agent]\033[0m"
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
def call_gemini(prompt: str, system_prompt: str) -> str:
    api_key = os.environ.get("GEMINI_API_KEY", "") or os.environ.get("OMNI_GEMINI_API_KEY", "")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY غير مُعرّف")

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + api_key
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {"temperature": 0.5, "maxOutputTokens": 800},
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Gemini HTTP {e.code}")


def call_groq(prompt: str, system_prompt: str) -> str:
    api_key = os.environ.get("GROQ_API_KEY", "") or os.environ.get("OMNI_GROQ_API_KEY", "")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY غير مُعرّف")

    url = "https://api.groq.com/openai/v1/chat/completions"
    payload = {
        "model": "llama-3.1-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.5,
        "max_tokens": 800,
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
# اكتشاف النية + الحاجة للتحويل
# ============================================================
def detect_intent(text: str) -> str:
    t = text.lower()
    if re.search(r"(سعر|كم|تكلفة|how much|price|باقة|راتب|دفع)", t):
        return "pricing"
    if re.search(r"(شراء|اشتراك|دفع|طلب|اشترك|buy|order|subscribe)", t):
        return "sales"
    if re.search(r"(موعد|حجز|استشارة|booking|reserve|schedule)", t):
        return "booking"
    if re.search(r"(مشكلة|شكوى|سيء|broken|issue|bug|غاضب|احتيال|محرج)", t):
        return "complaint"
    if re.search(r"(كيف|ما هي|استفسار|info|تعمل|هل|متى|أين)", t):
        return "info"
    return "support"


def should_escalate(text: str, sentiment: str = "neutral") -> bool:
    t = text.lower()
    if re.search(r"(مدير|موظف|شكوى|سيء|غاضب|احتيال|محرج|أسوأ|لا أريد|reject)", t):
        return True
    if sentiment in ("negative", "mixed") and re.search(r"(مشكلة|broken|issue|bug)", t):
        return True
    return False


def detect_sentiment(text: str) -> str:
    t = text.lower()
    if re.search(r"(شكر|ممتاز|رائع|جيد|happy|good|great|love|سعيد|معجب)", t):
        return "positive"
    if re.search(r"(سيء|أسوأ|غاضب|مشكلة|broken|angry|bad|crp|فاشل|تأخر)", t):
        return "negative"
    return "neutral"


# ============================================================
# توليد رد الـ AI
# ============================================================
DEFAULT_SYSTEM_PROMPT = (
    "أنت وكيل مبيعات ودعم عملاء محترف لشركة ZeroBaran. تصرف بلباقة، "
    "ساعد العميل في اختيار المنتج المناسب، أجب عن استفساراته بدقة، "
    "ووجهه لإتمام الطلب. استخدم معلومات قاعدة المعرفة المتاحة."
)


def build_prompt(message: str, kb_items: List[Dict], history: List[Dict], tone: str) -> str:
    kb_context = ""
    if kb_items:
        kb_context = "\n\nمعلومات قاعدة المعرفة المتاحة:\n"
        for kb in kb_items[:3]:
            price = f" بسعر {kb.get('price', '')} {kb.get('currency', 'USD')}" if kb.get("price") else ""
            kb_context += f"\n• {kb.get('title', '')}{price}\n{kb.get('content', '')[:300]}\n"

    history_str = ""
    if history:
        history_str = "\n\nآخر 4 رسائل في المحادثة:\n"
        for h in history[-4:]:
            role = "العميل" if h.get("role") == "customer" else "الوكيل"
            history_str += f"{role}: {h.get('content', '')[:150]}\n"

    return (
        f"أسلوب الرد: {tone}\n"
        f"{kb_context}{history_str}\n"
        f"\nسؤال العميل الحالي:\n{message}\n\n"
        f"أجب بالعربية بشكل مهذب وواضح. إذا توفرت معلومة في قاعدة المعرفة استخدمها. "
        f"إن لم تتوفر، اقترح التواصل المباشر: baranavisat@gmail.com أو واتساب 00905313263722."
    )


def generate_response(
    message: str,
    conversation_history: List[Dict],
    kb_items: List[Dict],
    tone: str = "professional",
    system_prompt: Optional[str] = None,
) -> Dict:
    Logger.info(f"توليد رد لرسالة ({len(message)} حرف)")
    sys_prompt = system_prompt or os.environ.get("OMNI_SYSTEM_PROMPT", DEFAULT_SYSTEM_PROMPT)
    user_prompt = build_prompt(message, kb_items, conversation_history, tone)

    raw = ""
    model = "fallback"
    for fn, name in [(call_gemini, "gemini"), (call_groq, "groq")]:
        try:
            raw = fn(user_prompt, sys_prompt)
            model = name
            Logger.ok(f"نجح التوليد عبر {name}")
            break
        except Exception as e:
            Logger.warn(f"فشل {name}: {e}")
            continue

    if not raw:
        Logger.err("فشل كل المزودين. استخدام fallback")
        raw = fallback_response(message, kb_items)
        model = "fallback"

    intent = detect_intent(message)
    sentiment = detect_sentiment(message)
    escalate = should_escalate(message, sentiment)
    confidence = 92 if kb_items else 80

    rag_ids = [kb.get("id") for kb in kb_items if kb.get("id")]

    return {
        "response": raw.strip(),
        "confidence": confidence,
        "intent": intent,
        "sentiment": sentiment,
        "should_escalate": escalate,
        "model": model,
        "rag_used": rag_ids,
    }


def fallback_response(message: str, kb_items: List[Dict]) -> str:
    if kb_items:
        top = kb_items[0]
        price = f" بسعر {top.get('price')} {top.get('currency', 'USD')}" if top.get("price") else ""
        return (
            f"شكراً لتواصلك! 🌟 بناءً على ما ذكرت، إليك ما يناسبك:\n\n"
            f"{top.get('title')}{price}.\n\n{top.get('content', '')[:300]}\n\n"
            f"للطلب أو الاستفسار أكثر، تواصل معنا: baranavisat@gmail.com أو واتساب 00905313263722."
        )
    return (
        "شكراً لرسالتك! 🌟 للأسف لا أملك معلومة محددة الآن، لكن فريقنا سيتواصل معك قريباً. "
        "للتواصل المباشر: baranavisat@gmail.com أو واتساب 00905313263722."
    )


# ============================================================
# الواجهة الرئيسية
# ============================================================
def main():
    parser = argparse.ArgumentParser(description="Omni-Sales AI Sales Agent")
    parser.add_argument("--message", required=True, help="رسالة العميل")
    parser.add_argument("--conversation-id", help="معرّف المحادثة")
    parser.add_argument("--kb-context", help="ملف JSON بعناصر قاعدة المعرفة (RAG)")
    parser.add_argument("--history", help="ملف JSON بتاريخ المحادثة")
    parser.add_argument("--tone", default="professional", choices=["professional", "friendly", "formal", "casual"])
    parser.add_argument("--system-prompt", help="System Prompt مخصص")
    parser.add_argument("--output", default="ai_response.json")
    args = parser.parse_args()

    kb_items = []
    if args.kb_context and Path(args.kb_context).exists():
        with open(args.kb_context, encoding="utf-8") as f:
            data = json.load(f)
            kb_items = data if isinstance(data, list) else data.get("items", [])

    history = []
    if args.history and Path(args.history).exists():
        with open(args.history, encoding="utf-8") as f:
            history = json.load(f)

    Logger.info("=" * 60)
    Logger.info("Omni-Sales ZeroBaran — AI Sales Agent")
    Logger.info(f"  الرسالة: {args.message[:60]}{'...' if len(args.message) > 60 else ''}")
    Logger.info(f"  الأسلوب: {args.tone}")
    Logger.info(f"  عناصر KB: {len(kb_items)}")
    Logger.info("=" * 60)

    result = generate_response(
        message=args.message,
        conversation_history=history,
        kb_items=kb_items,
        tone=args.tone,
        system_prompt=args.system_prompt,
    )
    result["conversationId"] = args.conversation_id
    result["message"] = args.message

    Path(args.output).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    Logger.ok(f"تم حفظ الرد في {args.output}")
    Logger.info(f"  النية: {result['intent']}")
    Logger.info(f"  المشاعر: {result['sentiment']}")
    Logger.info(f"  التحويل: {result['should_escalate']}")
    Logger.info(f"  RAG: {result['rag_used']}")

    # JSON على stdout أيضاً للتكامل مع pipelines
    print(json.dumps(result, ensure_ascii=False))
    print(f"::set-output name=confidence::{result['confidence']}")
    print(f"::set-output name=intent::{result['intent']}")


if __name__ == "__main__":
    main()
