#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Pixel-ZeroBaran | supabase_storage.py
================================================================
طبقة الأرشيف — رفع الصور الأصلية والمعالَجة إلى Supabase Storage
لحفظ السجل التاريخي والوصول إليها لاحقاً من لوحة التحكم.

الاستخدام:
  python supabase_storage.py --upload=final.png --bucket=pixel-results
  python supabase_storage.py --list --bucket=pixel-results
================================================================
"""

import argparse
import os
import sys
import json
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional, List


class Logger:
    INFO = "\033[94m[supabase]\033[0m"
    OK = "\033[92m[OK]\033[0m"
    ERR = "\033[91m[ERR]\033[0m"

    @classmethod
    def info(cls, msg): print(f"{cls.INFO} {msg}", flush=True)
    @classmethod
    def ok(cls, msg): print(f"{cls.OK} {msg}", flush=True)
    @classmethod
    def err(cls, msg): print(f"{cls.ERR} {msg}", flush=True)


class SupabaseStorage:
    def __init__(self, url: str, anon_key: str):
        self.url = url.rstrip("/")
        self.anon_key = anon_key
        self.headers = {
            "apikey": anon_key,
            "Authorization": f"Bearer {anon_key}",
        }

    def upload(self, file_path: str, bucket: str, path: Optional[str] = None) -> dict:
        """
        يرفع ملف إلى Supabase Storage.
        """
        if not Path(file_path).exists():
            raise FileNotFoundError(file_path)

        file_name = path or Path(file_path).name
        url = f"{self.url}/storage/v1/object/{bucket}/{file_name}"
        headers = {**self.headers, "Content-Type": "image/png", "x-upsert": "true"}

        with open(file_path, "rb") as f:
            data = f.read()

        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                Logger.ok(f"تم رفع {file_name} إلى {bucket}")
                return result
        except urllib.error.HTTPError as e:
            err = e.read().decode("utf-8", errors="ignore")
            Logger.err(f"HTTP {e.code}: {err[:200]}")
            raise

    def list_objects(self, bucket: str) -> List[dict]:
        """ي列出 كل الملفات في bucket."""
        url = f"{self.url}/storage/v1/object/list/{bucket}"
        body = json.dumps({"prefix": "", "limit": 100}).encode("utf-8")
        headers = {**self.headers, "Content-Type": "application/json"}
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            Logger.err(f"HTTP {e.code}: {e.read().decode('utf-8', errors='ignore')[:200]}")
            raise

    def get_public_url(self, bucket: str, path: str) -> str:
        """يُرجع الرابط العام للملف (إذا كان bucket عاماً)."""
        return f"{self.url}/storage/v1/object/public/{bucket}/{path}"


def main():
    parser = argparse.ArgumentParser(description="Pixel-ZeroBaran Supabase Storage")
    parser.add_argument("--upload", help="مسار الملف للرفع")
    parser.add_argument("--bucket", default="pixel-results", help="اسم الـ bucket")
    parser.add_argument("--path", help="المسار داخل الـ bucket (افتراضي: اسم الملف)")
    parser.add_argument("--list", action="store_true", help="عرض قائمة الملفات")
    args = parser.parse_args()

    url = os.environ.get("PIXEL_SUPABASE_URL", "") or os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("PIXEL_SUPABASE_ANON_KEY", "") or os.environ.get("SUPABASE_ANON_KEY", "")
    if not url or not key:
        Logger.err("PIXEL_SUPABASE_URL و PIXEL_SUPABASE_ANON_KEY مطلوبان")
        sys.exit(1)

    client = SupabaseStorage(url, key)

    if args.list:
        files = client.list_objects(args.bucket)
        print(json.dumps(files, ensure_ascii=False, indent=2))
    elif args.upload:
        result = client.upload(args.upload, args.bucket, args.path)
        public_url = client.get_public_url(args.bucket, args.path or Path(args.upload).name)
        print(f"\n\033[92m[OK]\033[0m الرابط العام: {public_url}")
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
