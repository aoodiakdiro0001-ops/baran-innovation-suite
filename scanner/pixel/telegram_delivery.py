#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Pixel-ZeroBaran | telegram_delivery.py
================================================================
قناة التسليم الفوري عبر Telegram Bot API.
يرسل الصورة النهائية المعالَجة بصيغة PNG عالية الدقة.

الاستخدام:
  python telegram_delivery.py --image=final.png --caption="نتيجة المعالجة"
  python telegram_delivery.py --image=final.png --chat-id=@user
================================================================
"""

import argparse
import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path


class Logger:
    INFO = "\033[94m[tg]\033[0m"
    OK = "\033[92m[OK]\033[0m"
    ERR = "\033[91m[ERR]\033[0m"

    @classmethod
    def info(cls, msg): print(f"{cls.INFO} {msg}", flush=True)
    @classmethod
    def ok(cls, msg): print(f"{cls.OK} {msg}", flush=True)
    @classmethod
    def err(cls, msg): print(f"{cls.ERR} {msg}", flush=True)


def send_telegram_photo(
    bot_token: str,
    chat_id: str,
    photo_path: str,
    caption: str = "",
) -> bool:
    """
    يرسل صورة عبر Telegram Bot API (sendPhoto).
    """
    if not Path(photo_path).exists():
        Logger.err(f"الصورة غير موجودة: {photo_path}")
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
    boundary = "----PixelZeroBaranBoundary"
    files = {"photo": (Path(photo_path).name, open(photo_path, "rb"), "image/png")}
    fields = {"chat_id": chat_id, "caption": caption}

    # بناء multipart/form-data يدوياً
    body = b""
    for name, value in fields.items():
        body += f"--{boundary}\r\n".encode()
        body += f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode()
        body += f"{value}\r\n".encode()

    for name, (filename, fileobj, content_type) in files.items():
        body += f"--{boundary}\r\n".encode()
        body += f'Content-Disposition: form-data; name="{name}"; filename="{filename}"\r\n'.encode()
        body += f"Content-Type: {content_type}\r\n\r\n".encode()
        body += fileobj.read()
        body += b"\r\n"
    body += f"--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("ok"):
                Logger.ok(f"تم إرسال الصورة إلى {chat_id}")
                return True
            else:
                Logger.err(f"Telegram error: {data.get('description')}")
                return False
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="ignore")
        Logger.err(f"HTTP {e.code}: {err[:200]}")
        return False
    except Exception as e:
        Logger.err(f"خطأ: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Pixel-ZeroBaran Telegram Delivery")
    parser.add_argument("--image", required=True, help="مسار الصورة النهائية")
    parser.add_argument("--caption", default="🎨 نتيجة معالجة Pixel-ZeroBaran", help="نص مع الصورة")
    parser.add_argument("--chat-id", help="Chat ID (افتراضي: من env)")
    args = parser.parse_args()

    bot_token = os.environ.get("PIXEL_TELEGRAM_BOT_TOKEN", "") or os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = args.chat_id or os.environ.get("PIXEL_TELEGRAM_CHAT_ID", "") or os.environ.get("TELEGRAM_CHAT_ID", "")

    if not bot_token or not chat_id:
        Logger.err("PIXEL_TELEGRAM_BOT_TOKEN و PIXEL_TELEGRAM_CHAT_ID مطلوبان")
        sys.exit(1)

    success = send_telegram_photo(bot_token, chat_id, args.image, args.caption)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
