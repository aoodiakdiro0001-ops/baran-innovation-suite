#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Pixel-ZeroBaran | batch_processor.py
================================================================
معالجة دفعات الصور بالجملة. يستقبل مجلداً كاملاً ويُخرج صوراً
معالَجة بأحد الأنماط الأربعة:
  - rembg: إزالة الخلفية فقط
  - relight: إعادة إضاءة
  - composite: دمج في خلفية
  - full: المعالجة الكاملة (rembg + composite)

الاستخدام:
  python batch_processor.py --folder=products/ --style=studio --output=final/
  python batch_processor.py --folder=products/ --process=rembg --output=nobg/
================================================================
"""

import argparse
import os
import sys
import json
import time
from pathlib import Path
from typing import List, Dict

sys.path.insert(0, str(Path(__file__).parent))
from rembg_processor import remove_background, Logger as RLogger, ensure_rembg
from ai_relighter import process_full, BACKGROUND_TEMPLATES


def process_folder(
    input_folder: str,
    output_folder: str,
    process_type: str,
    style: str,
    model: str,
) -> List[Dict]:
    """
    يمعالج كل صور في مجلد.
    """
    input_dir = Path(input_folder)
    output_dir = Path(output_folder)
    output_dir.mkdir(parents=True, exist_ok=True)

    supported = (".jpg", ".jpeg", ".png", ".webp", ".bmp")
    images = [f for f in input_dir.rglob("*") if f.suffix.lower() in supported]

    print(f"\033[95m[BATCH]\033[0m تم رصد {len(images)} صورة — نوع المعالجة: {process_type}", flush=True)
    if style and process_type in ("composite", "full", "relight"):
        print(f"\033[95m[BATCH]\033[0m النمط: {style}", flush=True)

    results = []
    for i, img_path in enumerate(images):
        print(f"\n\033[95m[BATCH]\033[0m [{i+1}/{len(images)}] {img_path.name}", flush=True)
        start = time.time()
        try:
            if process_type == "rembg":
                out_path = output_dir / (img_path.stem + "_nobg.png")
                remove_background(str(img_path), str(out_path), "u2net")

            elif process_type == "composite":
                # نفترض الصورة معزولة أصلاً (PNG شفاف)
                out_path = output_dir / (img_path.stem + f"_{style}.png")
                process_full(str(img_path), style, str(out_path), model=model)

            elif process_type == "full":
                # 1) عزل الخلفية
                nobg_path = output_dir / "tmp" / (img_path.stem + "_nobg.png")
                nobg_path.parent.mkdir(exist_ok=True)
                remove_background(str(img_path), str(nobg_path), "u2net")
                # 2) دمج في خلفية
                out_path = output_dir / (img_path.stem + f"_{style}.png")
                process_full(str(nobg_path), style, str(out_path), model=model)
                # تنظيف
                nobg_path.unlink(missing_ok=True)

            duration = (time.time() - start) * 1000
            results.append({
                "input": str(img_path),
                "output": str(out_path) if "out_path" in locals() else None,
                "duration_ms": int(duration),
                "status": "completed",
            })
        except Exception as e:
            print(f"\033[91m[ERR]\033[0m {img_path.name}: {e}", flush=True)
            results.append({
                "input": str(img_path),
                "error": str(e),
                "status": "failed",
            })

    # تقرير
    success = sum(1 for r in results if r["status"] == "completed")
    print(f"\n\033[92m[OK]\033[0m اكتملت الدفعة: {success}/{len(results)} نجاح", flush=True)

    # حفظ سجل المعالجة
    log_path = output_dir / "batch_log.json"
    log_path.write_text(json.dumps({
        "input_folder": input_folder,
        "output_folder": output_folder,
        "process_type": process_type,
        "style": style,
        "model": model,
        "started_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total": len(results),
        "success": success,
        "failed": len(results) - success,
        "results": results,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\033[92m[OK]\033[0m تم حفظ السجل: {log_path}", flush=True)

    return results


def main():
    parser = argparse.ArgumentParser(description="Pixel-ZeroBaran Batch Processor")
    parser.add_argument("--folder", required=True, help="مجلد الصور الأصلية")
    parser.add_argument("--output", default="results/", help="مجلد النتائج")
    parser.add_argument(
        "--process",
        default="full",
        choices=["rembg", "relight", "composite", "full"],
        help="نوع المعالجة",
    )
    parser.add_argument(
        "--style",
        default="studio",
        choices=list(BACKGROUND_TEMPLATES.keys()),
        help="نمط الخلفية",
    )
    parser.add_argument("--model", default="stabilityai/stable-diffusion-xl-base-1.0")
    args = parser.parse_args()

    if not ensure_rembg():
        sys.exit(1)

    process_folder(args.folder, args.output, args.process, args.style, args.model)


if __name__ == "__main__":
    main()
