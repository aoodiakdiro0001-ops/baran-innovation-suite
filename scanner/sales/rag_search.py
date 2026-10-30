#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Omni-Sales ZeroBaran | rag_search.py
================================================================
محرّك البحث في قاعدة المعرفة (RAG retrieval). يأخذ استفسار
العميل، يبحث في الكتالوج + الأسئلة + السياسات + التسعير،
ويُرجِع أفضل 3 نتائج ذات صلة.

الاستخدام:
  python rag_search.py --query="باقة الأمان" --limit=3
  python rag_search.py --query="كيف أدفع" --category=pricing

الخرج (JSON على stdout):
{
  "query": "...",
  "results": [
    { "id": "...", "title": "...", "category": "...", "content": "...", "price": 600, "score": 5 },
    ...
  ],
  "count": 3
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
from typing import Dict, List


class Logger:
    INFO = "\033[95m[RAG]\033[0m"
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
# الكلمات الموقوفة العربية
# ============================================================
ARABIC_STOPWORDS = set("في من عن على الى إلى و ال واو او أو مع ثم هو هي نحن أنا أنت كم ما كيف هل".split())
ENGLISH_STOPWORDS = set("the a an and or to of in on at how what is are do".split())


def tokenize(text: str) -> List[str]:
    """تقسيم النص لرموز بحثية صالحة"""
    text = text.lower()
    tokens = re.split(r"[\s،,.؟!()\-/+:]+", text)
    return [
        t for t in tokens
        if len(t) > 2 and t not in ARABIC_STOPWORDS and t not in ENGLISH_STOPWORDS
    ]


def score_item(item: Dict, query_tokens: List[str], query_lower: str) -> int:
    """احسب درجة الصلة بين الاستفسار وعنصر قاعدة المعرفة"""
    haystack = f"{item.get('title', '')} {item.get('content', '')} {item.get('tags', '')}".lower()
    score = 0
    for tk in query_tokens:
        if tk in haystack:
            score += 1
    # بونص لتطابق العنوان
    if item.get("title", "").lower().find(query_lower) >= 0:
        score += 2
    # بونص لتطابق الـ SKU
    if item.get("sku") and item.get("sku", "").lower().find(query_lower) >= 0:
        score += 2
    # بونص للتسعير عند سؤال عن سعر
    if item.get("category") == "pricing" and "سعر" in query_lower:
        score += 2
    if item.get("category") == "faq" and ("كيف" in query_lower or "ما" in query_lower):
        score += 1
    return score


# ============================================================
# البحث في قاعدة المعرفة
# ============================================================
def search_kb(query: str, items: List[Dict], category: str = None, limit: int = 3) -> List[Dict]:
    """ابحث في الكتالوج وأرجع أفضل النتائج"""
    query_lower = query.lower().strip()
    query_tokens = tokenize(query)

    if not query_tokens:
        return []

    candidates = items
    if category:
        candidates = [it for it in items if it.get("category") == category]

    scored = []
    for it in candidates:
        s = score_item(it, query_tokens, query_lower)
        if s > 0:
            scored.append((it, s))

    scored.sort(key=lambda x: x[1], reverse=True)
    top = scored[:limit]

    return [
        {
            "id": it.get("id"),
            "title": it.get("title"),
            "category": it.get("category"),
            "content": it.get("content", "")[:500],
            "price": it.get("price"),
            "currency": it.get("currency", "USD"),
            "sku": it.get("sku"),
            "tags": it.get("tags"),
            "score": s,
        }
        for (it, s) in top
    ]


# ============================================================
# تحميل قاعدة المعرفة من Supabase (إن توفّر)
# ============================================================
def load_kb_from_supabase() -> List[Dict]:
    """حمّل عناصر قاعدة المعرفة من Supabase إن توفّرت المفاتيح"""
    url = os.environ.get("OMNI_SUPABASE_URL")
    key = os.environ.get("OMNI_SUPABASE_ANON_KEY")
    if not url or not key:
        return []
    try:
        endpoint = f"{url.rstrip('/')}/rest/v1/knowledge_base?active=eq.true"
        req = urllib.request.Request(
            endpoint,
            headers={
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Accept": "application/json",
            },
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        Logger.warn(f"Supabase fetch failed: {e}")
        return []


def load_kb_from_file(path: str) -> List[Dict]:
    """حمّل من ملف JSON محلي"""
    if not Path(path).exists():
        return []
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        return data
    return data.get("items", [])


# ============================================================
# الواجهة الرئيسية
# ============================================================
def main():
    parser = argparse.ArgumentParser(description="Omni-Sales RAG Knowledge Search")
    parser.add_argument("--query", required=True, help="استفسار العميل")
    parser.add_argument("--category", choices=["product", "service", "faq", "policy", "pricing"], help="تصفية حسب الفئة")
    parser.add_argument("--limit", type=int, default=3, help="عدد النتائج")
    parser.add_argument("--kb-file", help="ملف JSON محلي بقاعدة المعرفة")
    parser.add_argument("--output", default="rag_results.json")
    args = parser.parse_args()

    # تحميل قاعدة المعرفة: Supabase أولاً، ثم ملف محلي
    items = load_kb_from_supabase()
    if not items and args.kb_file:
        items = load_kb_from_file(args.kb_file)

    if not items:
        Logger.warn("لا توجد عناصر KB متاحة. تأكد من Supabase أو --kb-file")
        # بيانات تجريبية مدمجة للعرض
        items = [
            {"id": "kb-0", "title": "Cyber-SentinelBaran - باقة الفحص الأساسي", "category": "product",
             "content": "باقة فحص أمني شامل: Semgrep + Nuclei + Nmap. تحليل AI للنتائج وتوليد كود الإصلاح. التكلفة: $600 شهرياً.",
             "price": 600, "currency": "USD", "sku": "CSB-BASIC", "tags": "[\"security\", \"scan\"]"},
            {"id": "kb-9", "title": "طرق الدفع المتاحة", "category": "pricing",
             "content": "نقبل: Visa/Mastercard عبر Stripe، تحويل بنكي (IBAN تركي/dولاري)، Bitcoin (BTC)، USDT (TRC20).",
             "tags": "[\"payment\", \"pricing\", \"iban\"]"},
        ]

    Logger.info("=" * 60)
    Logger.info("Omni-Sales — RAG Knowledge Search")
    Logger.info(f"  الاستفسار: {args.query}")
    Logger.info(f"  الفئة: {args.category or 'الكل'}")
    Logger.info(f"  عناصر KB: {len(items)}")
    Logger.info("=" * 60)

    results = search_kb(args.query, items, args.category, args.limit)

    out = {
        "query": args.query,
        "results": results,
        "count": len(results),
    }
    Path(args.output).write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    Logger.ok(f"تم حفظ {len(results)} نتيجة في {args.output}")
    for r in results:
        Logger.info(f"  • [{r['score']}] {r['title']} ({r['category']})")

    print(json.dumps(out, ensure_ascii=False))


if __name__ == "__main__":
    main()
