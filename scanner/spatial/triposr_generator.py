#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Spatial-ZeroBaran | triposr_generator.py
================================================================
محرك توليد المجسمات ثلاثية الأبعاد من صورة أو نص.
يستخدم نماذج Hugging Face Serverless Inference APIs المجانية:
  - TripoSR (Stability AI) - الأفضل للصور الواقعية
  - Shap-E (OpenAI) - أسرع، يدعم النص والصورة
  - DreamGaussian - نعومة عالية، نسيج PBR

الاستخدام:
  python triposr_generator.py --input=chair.jpg --output=raw.obj
  python triposr_generator.py --prompt="viking chair" --output=raw.obj
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
from typing import Optional


class Logger:
    INFO = "\033[95m[3D-Gen]\033[0m"
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
# استدعاء Hugging Face Inference API
# ============================================================
def call_huggingface_3d(
    model_id: str,
    input_data: bytes,
    output_path: str,
    is_image: bool = True,
) -> bool:
    """
    يستدعي نموذج 3D من Hugging Face (TripoSR/Shap-E).
    يرجع True عند النجاح.
    """
    token = os.environ.get("SPATIAL_HF_TOKEN", "") or os.environ.get("HUGGINGFACE_TOKEN", "")
    if not token:
        Logger.err("SPATIAL_HF_TOKEN أو HUGGINGFACE_TOKEN غير مُعرّف")
        return False

    url = f"https://api-inference.huggingface.co/models/{model_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "image/png" if is_image else "application/json",
        "Accept": "application/octet-stream",  # يرجع binary OBJ/GLB
    }

    Logger.info(f"استدعاء Hugging Face model: {model_id}")
    req = urllib.request.Request(url, data=input_data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            asset_data = resp.read()
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            Path(output_path).write_bytes(asset_data)
            Logger.ok(f"تم توليد المجسم: {output_path} ({len(asset_data) / 1024:.1f} KB)")
            return True
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="ignore")
        Logger.err(f"HF HTTP {e.code}: {err[:200]}")
        return False
    except Exception as e:
        Logger.err(f"HF error: {e}")
        return False


# ============================================================
# توليد من صورة (TripoSR)
# ============================================================
def generate_from_image(image_path: str, output_path: str, model: str = "stabilityai/TripoSR") -> bool:
    """يحوّل صورة 2D إلى مجسم 3D عبر TripoSR"""
    if not Path(image_path).exists():
        Logger.err(f"الصورة غير موجودة: {image_path}")
        return False

    Logger.info(f"توليد 3D من صورة: {image_path}")
    with open(image_path, "rb") as f:
        image_data = f.read()

    return call_huggingface_3d(model, image_data, output_path, is_image=True)


# ============================================================
# توليد من نص (Shap-E)
# ============================================================
def generate_from_text(prompt: str, output_path: str, model: str = "openai/shap-e-v2") -> bool:
    """يحوّل وصفاً نصياً إلى مجسم 3D عبر Shap-E"""
    Logger.info(f"توليد 3D من نص: '{prompt[:50]}...'")

    payload = json.dumps({"inputs": prompt}).encode("utf-8")
    return call_huggingface_3d(model, payload, output_path, is_image=False)


# ============================================================
# توليد من رسم تخطيطي (Sketch)
# ============================================================
def generate_from_sketch(sketch_path: str, output_path: str) -> bool:
    """
    يحوّل رسم تخططي إلى مجسم. يستخدم TripoSR مع preprocessing.
    (مبسّط - في الإنتاج يُطبَّق edge detection قبل الإرسال)
    """
    Logger.info(f"توليد 3D من رسم: {sketch_path}")
    # حالياً نستخدم نفس generate_from_image (مبسّط)
    return generate_from_image(sketch_path, output_path)


# ============================================================
# الواجهة الرئيسية
# ============================================================
def main():
    parser = argparse.ArgumentParser(description="Spatial-ZeroBaran 3D Generator")
    parser.add_argument("--input", help="مسار صورة الإدخال")
    parser.add_argument("--prompt", help="وصف نصي للمجسم")
    parser.add_argument("--output", required=True, help="مسار المخرج (.obj / .glb)")
    parser.add_argument(
        "--model",
        default="TripoSR",
        choices=["TripoSR", "Shap-E", "DreamGaussian"],
        help="نموذج التوليد",
    )
    parser.add_argument("--timeout", type=int, default=120, help="مهلة الانتظار (ثوانٍ)")
    args = parser.parse_args()

    model_map = {
        "TripoSR": "stabilityai/TripoSR",
        "Shap-E": "openai/shap-e-v2",
        "DreamGaussian": "dreamgaussian/dreamgaussian",
    }

    model_id = model_map.get(args.model, model_map["TripoSR"])
    Logger.info("=" * 60)
    Logger.info("Spatial-ZeroBaran — 3D Asset Generator")
    Logger.info(f"  النموذج: {args.model} ({model_id})")
    Logger.info(f"  المخرج: {args.output}")
    Logger.info("=" * 60)

    start = time.time()
    success = False

    if args.input:
        success = generate_from_image(args.input, args.output, model_id)
    elif args.prompt:
        success = generate_from_text(args.prompt, args.output, model_id)
    else:
        parser.print_help()
        sys.exit(1)

    if success:
        duration_ms = int((time.time() - start) * 1000)
        file_size = Path(args.output).stat().st_size if Path(args.output).exists() else 0
        Logger.ok(f"اكتمل التوليد في {duration_ms}ms — الحجم: {file_size / 1024:.1f} KB")

        # حفظ تقرير
        report = {
            "input": args.input or args.prompt,
            "output": args.output,
            "model": args.model,
            "file_size_bytes": file_size,
            "duration_ms": duration_ms,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
        report_path = args.output.replace(".obj", "").replace(".glb", "") + "_report.json"
        Path(report_path).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"::set-output name=asset_path::{args.output}")
    else:
        Logger.err("فشل التوليد")
        sys.exit(1)


if __name__ == "__main__":
    main()
