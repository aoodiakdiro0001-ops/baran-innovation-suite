#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Spatial-ZeroBaran | telegram_delivery.py
================================================================
قناة تسليم المجسمات ثلاثية الأبعاد عبر Telegram Bot API.
يرسل:
  - ملف المجسم النهائي (GLB/FBX/OBJ)
  - GIF معاينة متحركة (إذا متوفر)
  - تقرير المعالجة (عدد المضلعات، الحجم، التوفير)

الاستخدام:
  python telegram_delivery.py --asset-path=final.glb --name="viking_chair"
  python telegram_delivery.py --asset-id=latest --report=report.json
================================================================
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path


def send_telegram_document(bot_token: str, chat_id: str, file_path: str, caption: str = "") -> bool:
    """يرسل ملف (مجسم 3D) عبر sendDocument"""
    if not Path(file_path).exists():
        print(f"[ERR] الملف غير موجود: {file_path}", flush=True)
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendDocument"
    boundary = "----SpatialZeroBaranBoundary"

    # بناء multipart/form-data يدوياً
    body = b""
    fields = {"chat_id": chat_id, "caption": caption[:1024]}
    for name, value in fields.items():
        body += f"--{boundary}\r\n".encode()
        body += f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode()
        body += f"{value}\r\n".encode()

    file_name = Path(file_path).name
    with open(file_path, "rb") as f:
        file_data = f.read()

    body += f"--{boundary}\r\n".encode()
    body += f'Content-Disposition: form-data; name="document"; filename="{file_name}"\r\n'.encode()
    body += b"Content-Type: application/octet-stream\r\n\r\n"
    body += file_data
    body += b"\r\n"
    body += f"--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return bool(data.get("ok"))
    except Exception as e:
        print(f"[ERR] Telegram: {e}", flush=True)
        return False


def send_telegram_text(bot_token: str, chat_id: str, text: str) -> bool:
    """يرسل رسالة نصية"""
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True,
    }).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return bool(json.loads(resp.read().decode("utf-8")).get("ok"))
    except Exception as e:
        print(f"[ERR] Telegram text: {e}", flush=True)
        return False


def format_caption(name: str, report: dict) -> str:
    """ينسّق رسالة التسليم"""
    original = report.get("original_polygons", 0)
    final = report.get("final_polygons", 0)
    reduction = report.get("actual_reduction_pct", 0)
    size_kb = report.get("output_size_bytes", 0) / 1024
    duration = report.get("duration_ms", 0) / 1000

    return f"""🎭 *Spatial-ZeroBaran — مجسم 3D جاهز*

*الاسم:* `{name}`
*المضلعات:* `{original:,}` → `{final:,}` ({reduction}% تقليل)
*الحجم:* {size_kb:.1f} KB
*الزمن:* {duration:.1f}s
*UV Map:* {'✅' if report.get('uv_applied') else '❌'}
*Textures:* {'✅' if report.get('textures_applied') else '❌'}

📁 المجسم جاهز للسحب والإسقاط في Unity/Unreal/Blender
✨ صُنع بموارد مجانية بالكامل"""


def main():
    parser = argparse.ArgumentParser(description="Spatial-ZeroBaran Telegram Delivery")
    parser.add_argument("--asset-path", help="مسار ملف المجسم")
    parser.add_argument("--name", default="3D Asset", help="اسم المجسم")
    parser.add_argument("--report", help="ملف تقرير المعالجة JSON")
    parser.add_argument("--gif", help="GIF المعاينة (اختياري)")
    args = parser.parse_args()

    bot_token = os.environ.get("SPATIAL_TELEGRAM_BOT_TOKEN", "") or os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("SPATIAL_TELEGRAM_CHAT_ID", "") or os.environ.get("TELEGRAM_CHAT_ID", "")
    if not bot_token or not chat_id:
        print("[ERR] SPATIAL_TELEGRAM_BOT_TOKEN و SPATIAL_TELEGRAM_CHAT_ID مطلوبان", flush=True)
        sys.exit(1)

    # قراءة التقرير
    report = {}
    if args.report and Path(args.report).exists():
        with open(args.report, encoding="utf-8") as f:
            report = json.load(f)

    if args.asset_path and Path(args.asset_path).exists():
        caption = format_caption(args.name, report)
        ok = send_telegram_document(bot_token, chat_id, args.asset_path, caption)
        if ok:
            print(f"[OK] تم إرسال {args.name} إلى Telegram", flush=True)
            sys.exit(0)
        else:
            print(f"[ERR] فشل إرسال {args.name}", flush=True)
            sys.exit(1)
    else:
        print("[ERR] --asset-path مطلوب", flush=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
