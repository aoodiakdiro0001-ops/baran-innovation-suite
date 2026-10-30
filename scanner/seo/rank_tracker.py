#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
SEO-GhostBaran | rank_tracker.py
================================================================
محرك تتبع ترتيب الكلمات المفتاحية في نتائج البحث.
يستخدم SerpApi (Free Tier) لاستخراج الترتيب الفعلي،
أو يحلل نتائج Google مباشرة عبر BeautifulSoup (fallback).

الاستخدام:
  python rank_tracker.py --keywords=keywords.txt --target=sentinelbaran.io
  python rank_tracker.py --keyword="فحص أمني تلقائي" --target=sentinelbaran.io
================================================================
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Optional


class Logger:
    INFO = "\033[92m[rank]\033[0m"
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
# SerpApi integration (Free Tier: 100 searches/month)
# ============================================================
def fetch_via_serpapi(keyword: str, target_domain: str, locale: str = "ar") -> Dict:
    """
    يستخدم SerpApi للحصول على نتائج بحث حقيقية + الترتيب الفعلي للموقع.
    """
    api_key = os.environ.get("SERPAPI_KEY", "")
    if not api_key:
        return {"error": "no_serpapi_key"}

    params = {
        "engine": "google",
        "q": keyword,
        "hl": locale,
        "gl": locale if locale == "en" else "ae",
        "num": "100",
        "api_key": api_key,
    }
    url = "https://serpapi.com/search?" + urllib.parse.urlencode(params)

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SEO-GhostBaran/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))

            organic = data.get("organic_results", [])
            target_rank = 0
            for i, result in enumerate(organic, 1):
                link = result.get("link", "")
                if target_domain.lower() in link.lower():
                    target_rank = i
                    break

            # أقوى منافس
            competitor_rank = 1
            competitor_domain = ""
            if organic:
                competitor_domain = urllib.parse.urlparse(organic[0].get("link", "")).netloc
                competitor_rank = 1

            return {
                "keyword": keyword,
                "target_rank": target_rank,
                "total_results": data.get("search_information", {}).get("total_results", 0),
                "competitor_rank": competitor_rank,
                "competitor_domain": competitor_domain,
                "source": "serpapi",
            }
    except urllib.error.HTTPError as e:
        return {"error": f"serpapi_http_{e.code}"}
    except Exception as e:
        return {"error": str(e)}


# ============================================================
# Fallback: استخراج الترتيب من Google مباشرة (rate-limited)
# ============================================================
def fetch_via_google_scrape(keyword: str, target_domain: str, locale: str = "ar") -> Dict:
    """
    Fallback: يحلل نتائج Google مباشرة عبر urllib + regex بسيط.
    ليس دقيقاً مثل SerpApi لكنه مجاني تماماً.
    """
    Logger.warn(f"استخدام Google scraper مباشر (بدون SerpApi) — قد يكون أقل دقة")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": f"{locale},en;q=0.9",
    }
    query = urllib.parse.quote(keyword)
    url = f"https://www.google.com/search?q={query}&num=100&hl={locale}"

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="ignore")

        # بحث بسيط عن target_domain في HTML (ليس دقيقاً 100% لكن كافٍ)
        target_lower = target_domain.lower()
        # تقدير الترتيب بحسب أول ظهور للنطاق في HTML
        # (مبسّط — SerpApi أدق بكثير)
        import re
        # ابحث عن روابط النطاق
        pattern = re.compile(r'href="(https?://[^"]*' + re.escape(target_lower) + r'[^"]*)"', re.IGNORECASE)
        matches = pattern.findall(html)
        target_rank = len(matches) > 0 and (html.find(target_lower) // 5000) or 0
        target_rank = min(max(target_rank, 1), 100) if matches else 0

        return {
            "keyword": keyword,
            "target_rank": target_rank,
            "total_results": 0,
            "source": "google_scrape",
            "note": "ترتيب تقديري — استخدم SerpApi لدقة أعلى",
        }
    except Exception as e:
        return {"error": str(e)}


# ============================================================
# تحليل الكلمات من ملف
# ============================================================
def load_keywords(file_path: str) -> List[str]:
    """يقرأ كلمات من ملف نصي (كل سطر = كلمة)"""
    return [
        line.strip()
        for line in Path(file_path).read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.startswith("#")
    ]


# ============================================================
# المعالجة الرئيسية
# ============================================================
def track_keyword(keyword: str, target: str, locale: str = "ar") -> Dict:
    """يتتبع ترتيب كلمة واحدة"""
    Logger.info(f"تتبع: '{keyword}' على موقع {target}")

    # جرّب SerpApi أولاً
    result = fetch_via_serpapi(keyword, target, locale)
    if "error" in result:
        Logger.warn(f"SerpApi failed: {result['error']}")
        # Fallback
        result = fetch_via_google_scrape(keyword, target, locale)

    if "error" in result:
        Logger.err(f"فشل: {result['error']}")
        return {**result, "keyword": keyword, "captured_at": datetime.now(timezone.utc).isoformat()}

    Logger.ok(f"ترتيب '{keyword}': #{result.get('target_rank', 0)}")
    result["captured_at"] = datetime.now(timezone.utc).isoformat()
    return result


def main():
    parser = argparse.ArgumentParser(description="SEO-GhostBaran Rank Tracker")
    parser.add_argument("--keyword", help="كلمة واحدة")
    parser.add_argument("--keywords", help="ملف نصي بقائمة كلمات")
    parser.add_argument("--target", required=True, help="النطاق المستهدف (sentinelbaran.io)")
    parser.add_argument("--locale", default="ar", choices=["ar", "en", "fr"], help="لغة البحث")
    parser.add_argument("--output", default="rank-results.json", help="ملف النتائج")
    parser.add_argument("--delay", type=float, default=2.0, help="تأخير بين الطلبات (ثوان)")
    args = parser.parse_args()

    keywords: List[str] = []
    if args.keyword:
        keywords = [args.keyword]
    elif args.keywords:
        keywords = load_keywords(args.keywords)
    else:
        parser.print_help()
        sys.exit(1)

    Logger.info(f"بدء تتبع {len(keywords)} كلمة مفتاحية للنطاق {args.target}")

    results = []
    for i, kw in enumerate(keywords):
        Logger.info(f"[{i+1}/{len(keywords)}] {kw}")
        result = track_keyword(kw, args.target, args.locale)
        results.append(result)
        if i < len(keywords) - 1:
            time.sleep(args.delay)

    Path(args.output).write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    Logger.ok(f"تم حفظ النتائج: {args.output}")

    # ملخص
    found = [r for r in results if r.get("target_rank", 0) > 0]
    Logger.info(f"ملخص: {len(found)}/{len(results)} كلمة ظهرت في أول 100 نتيجة")

    # Fallback للـ pipeline التالي
    print(f"::set-output name=tracked::{len(results)}")
    print(f"::set-output name=found::{len(found)}")


if __name__ == "__main__":
    main()
