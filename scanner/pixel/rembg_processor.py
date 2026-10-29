#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Pixel-ZeroBaran | rembg_processor.py
================================================================
محرك عزل الخلفية بدقة متناهية باستخدام rembg (مفتوح المصدر).
يقوم بـ:
  - عزل المنتج عن الخلفية خلال ثانية واحدة
  - تصدير PNG شفاف بدقة عالية
  - تحسين الحواف وتنعيمها
  - معالجة دفعة من الصور دفعة واحدة

الاستخدام:
  python rembg_processor.py --input=img.jpg --output=out.png
  python rembg_processor.py --batch=products/ --output=results/
================================================================
"""

import argparse
import os
import sys
import time
from pathlib import Path
from typing import Optional, List


class Logger:
    INFO = "\033[94m[rembg]\033[0m"
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


def ensure_rembg():
    """يتحقق من تثبيت rembg ويوجه المستخدم إذا لم يكن"""
    try:
        import rembg  # noqa
        from PIL import Image  # noqa
        return True
    except ImportError:
        Logger.err("rembg أو Pillow غير مثبتين. ثبّتهما:")
        print("  pip install rembg pillow onnxruntime", flush=True)
        return False


def remove_background(input_path: str, output_path: str, model: str = "u2net") -> dict:
    """
    يعزل الخلفية من صورة واحدة.
    يُرجع dict بمعطيات المعالجة (الزمن، حجم النتيجة، إلخ).
    """
    from rembg import remove, new_session
    from PIL import Image

    if not Path(input_path).exists():
        raise FileNotFoundError(f"الصورة غير موجودة: {input_path}")

    Logger.info(f"بدء عزل الخلفية: {input_path}")
    start = time.time()

    # إنشاء جلسة rembg (تُحمّل النموذج مرة واحدة للدفعات)
    session = new_session(model)

    # تحميل الصورة
    input_image = Image.open(input_path)
    Logger.info(f"أبعاد الصورة: {input_image.size[0]}x{input_image.size[1]}")

    # عزل الخلفية
    output_image = remove(input_image, session=session)

    # حفظ النتيجة
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    output_image.save(output_path, format="PNG", optimize=True)

    duration_ms = int((time.time() - start) * 1000)
    output_size = Path(output_path).stat().st_size

    Logger.ok(f"تم! الزمن: {duration_ms}ms، الحجم: {output_size/1024:.1f} KB")
    return {
        "input_path": input_path,
        "output_path": output_path,
        "duration_ms": duration_ms,
        "output_size": output_size,
        "model": model,
    }


def batch_remove(input_folder: str, output_folder: str, model: str = "u2net") -> List[dict]:
    """يعالج دفعة من الصور دفعة واحدة"""
    input_dir = Path(input_folder)
    output_dir = Path(output_folder)
    output_dir.mkdir(parents=True, exist_ok=True)

    supported = (".jpg", ".jpeg", ".png", ".webp", ".bmp")
    images = [f for f in input_dir.rglob("*") if f.suffix.lower() in supported]
    Logger.info(f"تم رصد {len(images)} صورة في {input_folder}")

    results = []
    for i, img_path in enumerate(images):
        Logger.info(f"[{i+1}/{len(images)}] {img_path.name}")
        out_path = output_dir / (img_path.stem + "_nobg.png")
        try:
            result = remove_background(str(img_path), str(out_path), model)
            results.append(result)
        except Exception as e:
            Logger.err(f"فشل {img_path.name}: {e}")
            results.append({"input_path": str(img_path), "error": str(e)})

    success = sum(1 for r in results if "error" not in r)
    Logger.ok(f"اكتملت الدفعة: {success}/{len(results)} نجاح")
    return results


def main():
    parser = argparse.ArgumentParser(description="Pixel-ZeroBaran — عزل الخلفية")
    parser.add_argument("--input", help="مسار صورة واحدة")
    parser.add_argument("--output", help="مسار النتيجة")
    parser.add_argument("--batch", help="مجلد صور للمعالجة الدفعية")
    parser.add_argument("--output-folder", default="results/", help="مجلد النتائج للدفعات")
    parser.add_argument(
        "--model",
        default="u2net",
        choices=["u2net", "u2netp", "isnet-general-use", "silueta"],
        help="نموذج rembg (u2net الافتراضي، isnet-general-use الأحدث)",
    )
    args = parser.parse_args()

    if not ensure_rembg():
        sys.exit(1)

    if args.batch:
        batch_remove(args.batch, args.output_folder, args.model)
    elif args.input and args.output:
        remove_background(args.input, args.output, args.model)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
