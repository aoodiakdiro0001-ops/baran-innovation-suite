#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Cyber-SentinelBaran | telegram_notifier.py
================================================================
قناة التنبيهات الفورية عبر Telegram Bot API.
يرسل رسالة منسقة (Markdown) لكل ثغرة حرجة/عالية مع كود الإصلاح.

الاستخدام:
  python telegram_notifier.py --report=ai-report.json
  python telegram_notifier.py --test  # لإرسال رسالة اختبار
================================================================
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, Any, List

sys.path.insert(0, str(Path(__file__).parent))
from scanner import Logger


# ============================================================
# إرسال رسالة Telegram
# ============================================================
def send_telegram(bot_token: str, chat_id: str, text: str, parse_mode: str = "Markdown") -> bool:
    """
    يرسل رسالة عبر Telegram Bot API.
    يُرجع True عند النجاح.
    """
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True,
    }).encode("utf-8")
    req = urllib.request.Request(
        url, data=payload, headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return bool(data.get("ok"))
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8")
        Logger.err(f"Telegram HTTP {e.code}: {err[:200]}")
        return False
    except Exception as e:
        Logger.err(f"Telegram error: {e}")
        return False


# ============================================================
# تنسيق ثغرة كرسالة Markdown
# ============================================================
def format_vuln_message(v: Dict[str, Any]) -> str:
    """ينسق ثغرة كرسالة Telegram Markdown جذابة"""
    sev_emoji = {
        "critical": "🚨",
        "high": "⚠️",
        "medium": "🟡",
        "low": "🔵",
        "info": "ℹ️",
    }
    emoji = sev_emoji.get(str(v.get("severity", "")).lower(), "🐛")
    lines = [
        f"{emoji} *إنذار أمني - خطورة {v.get('severity', '').upper()}*",
        "",
        f"*الثغرة:* `{v.get('title', '')}`",
        f"*الفئة:* {v.get('category', '')}",
    ]
    if v.get("cve_id"):
        lines.append(f"*CVE:* `{v['cve_id']}`")
    if v.get("file_path"):
        loc = f"`{v['file_path']}`"
        if v.get("line_number"):
            loc += f":`{v['line_number']}`"
        lines.append(f"*الموقع:* {loc}")

    lines.extend(["", f"*الوصف:*", v.get("description", "—")[:500]])

    # كود الإصلاح من AI
    ai = v.get("ai_analysis", {})
    if isinstance(ai, dict):
        if ai.get("risk_score"):
            lines.append(f"\n*درجة الخطورة:* {ai['risk_score']}/100")
        if ai.get("fix_code"):
            lines.append("\n*🛠️ كود الإصلاح المقترح:*")
            lines.append("```")
            # لغة البرمجة (مبسط)
            ext = (v.get("file_path") or "").rsplit(".", 1)[-1].lower()
            lang = {"py": "python", "js": "javascript", "ts": "typescript", "tsx": "tsx", "go": "go"}.get(ext, "")
            if lang:
                lines.append(f"```{lang}")
            lines.append(ai["fix_code"][:2000])
            lines.append("```")
        if ai.get("recommendations"):
            lines.append(f"\n*توصيات:* {ai['recommendations'][:300]}")

    lines.append("\n_SentinelBaran - حماية ذكية استباقية_")
    return "\n".join(lines)


# ============================================================
# الإرسال الرئيسي
# ============================================================
def main():
    parser = argparse.ArgumentParser(description="Cyber-SentinelBaran Telegram Notifier")
    parser.add_argument("--report", help="ملف تقرير AI")
    parser.add_argument("--test", action="store_true", help="إرسال رسالة اختبار")
    parser.add_argument("--min-severity", default="high", choices=["critical", "high", "medium", "low", "info"])
    args = parser.parse_args()

    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")

    if not bot_token or not chat_id:
        Logger.err("TELEGRAM_BOT_TOKEN و TELEGRAM_CHAT_ID مطلوبان في متغيرات البيئة")
        sys.exit(1)

    # وضع الاختبار
    if args.test:
        Logger.info("إرسال رسالة اختبار إلى Telegram...")
        msg = (
            "🧪 *اختبار Cyber-SentinelBaran*\n\n"
            "تم استلام هذه الرسالة بنجاح!\n\n"
            f"التوقيت: `{time.strftime('%Y-%m-%d %H:%M:%S')}`\n"
            f"المستلم: `{chat_id}`\n\n"
            "_المنظومة تعمل بشكل سليم_"
        )
        ok = send_telegram(bot_token, chat_id, msg)
        sys.exit(0 if ok else 1)

    # الإرسال الفعلي للتقرير
    if not args.report:
        Logger.err("--report مطلوب (أو --test)")
        sys.exit(1)

    report_path = Path(args.report)
    if not report_path.exists():
        Logger.err(f"ملف التقرير غير موجود: {report_path}")
        sys.exit(1)

    report = json.loads(report_path.read_text(encoding="utf-8"))
    enriched = report.get("enriched_findings", [])
    findings = report.get("findings", [])

    # اختيار الثغرات فوق الخطورة الدنيا
    sev_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
    min_idx = sev_order.get(args.min_severity, 1)
    relevant = [f for f in (enriched or findings) if sev_order.get(f.get("severity", "").lower(), 5) <= min_idx]

    Logger.info(f"إرسال {len(relevant)} تنبيه عبر Telegram...")

    sent = 0
    for i, v in enumerate(relevant):
        msg = format_vuln_message(v)
        Logger.info(f"  [{i+1}/{len(relevant)}] {v.get('title', '')[:50]}")
        if send_telegram(bot_token, chat_id, msg):
            sent += 1
            Logger.ok("    ✓ تم الإرسال")
        else:
            Logger.err("    ✗ فشل الإرسال")
        time.sleep(1)  # تجنب rate limit (30 رسالة/ثانية افتراضياً)

    # رسالة ملخص
    overall = report.get("overall_assessment", {})
    summary_msg = (
        "📊 *ملخص الفحص الأمني - Cyber-SentinelBaran*\n\n"
        f"*الهدف:* `{report.get('scan_metadata', {}).get('target', '—')}`\n"
        f"*إجمالي الثغرات:* {len(findings)}\n"
        f"*الثغرات الحرجة المُرسلة:* {sent}\n"
        f"*درجة المخاطر:* {overall.get('overall_risk_score', '?')}/100\n\n"
        f"*الملخص:*\n{overall.get('summary', '—')[:500]}\n\n"
        f"*أهم التوصيات:*\n{overall.get('top_recommendations', '—')[:500]}"
    )
    send_telegram(bot_token, chat_id, summary_msg)

    Logger.info(f"اكتمل الإرسال: {sent}/{len(relevant)} تنبيه")


if __name__ == "__main__":
    main()
