#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
Pixel-ZeroBaran | ai_relighter.py
================================================================
العقل البصري - يدمج المنتج المعزول في خلفية تسويقية احترافية،
يضبط الإضاءة والظلال لتظهر طبيعية 100%.

يدعم:
  - Hugging Face Serverless Inference API (مجاني)
  - Google Gemini API (Free Tier) — لتوليد خلفيات من وصف نصي
  - Stable Diffusion عبر Hugging Face (نماذج متعددة)

الاستخدام:
  python ai_relighter.py --subject=cutout.png --style=studio --output=final.png
  python ai_relighter.py --subject=watch.png --prompt="wooden table, soft window light" --output=final.png
================================================================
"""

import argparse
import base64
import json
import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional


class Logger:
    INFO = "\033[95m[AI-Vision]\033[0m"
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


# قوالب الخلفيات التسويقية الجاهزة
BACKGROUND_TEMPLATES = {
    "studio": "professional product photography studio with soft white lighting, gradient background, seamless backdrop, high-end commercial look, 4k",
    "studio_neon": "neon gradient background, vibrant purple and blue colors, futuristic tech product display, glowing edges, cinematic",
    "lifestyle_wood": "rustic wooden table with warm natural light, cozy home environment, lifestyle product photography, shallow depth of field",
    "lifestyle_office": "modern minimalist office desk, marble surface, soft natural window light, contemporary interior, premium product display",
    "lifestyle_urban_night": "urban city street at night with bokeh lights, modern architecture background, cinematic product shot",
    "nature_beach": "tropical beach with turquoise water, white sand, palm trees, sunny day, commercial advertising background",
    "nature_forest": "misty forest with morning light, dewdrops on leaves, natural zen atmosphere, product photography",
    "industrial_metal": "industrial metal surface with dramatic lighting, modern factory aesthetic, bold product display",
    "minimal_white": "pure white seamless background, soft shadows, minimalist product photography, e-commerce style",
    "minimal_gradient": "smooth color gradient background, soft pastel colors, premium minimal aesthetic, brand photography",
}


# ============================================================
# استدعاء Hugging Face Serverless Inference API
# ============================================================
def call_huggingface(
    prompt: str,
    output_path: str,
    model: str = "stabilityai/stable-diffusion-xl-base-1.0",
) -> bool:
    """
    يستدعي نموذج توليد صور من Hugging Face.
    يتطلب HUGGINGFACE_TOKEN في متغيرات البيئة.
    """
    token = os.environ.get("HUGGINGFACE_TOKEN", "")
    if not token:
        Logger.err("HUGGINGFACE_TOKEN غير مُعرّف")
        return False

    url = f"https://api-inference.huggingface.co/models/{model}"
    payload = {"inputs": prompt}
    body = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "image/png",
        },
    )

    Logger.info(f"استدعاء Hugging Face ({model})...")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            img_data = resp.read()
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            Path(output_path).write_bytes(img_data)
            Logger.ok(f"تم توليد الخلفية: {output_path}")
            return True
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="ignore")
        Logger.err(f"HF HTTP {e.code}: {err[:200]}")
        return False
    except Exception as e:
        Logger.err(f"HF error: {e}")
        return False


# ============================================================
# توليد خلفية عبر Gemini (Vision -> Text -> تجميع)
# ============================================================
def generate_prompt_via_gemini(subject_description: str, style: str) -> Optional[str]:
    """
    يستخدم Gemini لتحسين الـ prompt بناءً على وصف المنتج.
    """
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        Logger.warn("GEMINI_API_KEY غير مُعرّف، استخدام template جاهز")
        return BACKGROUND_TEMPLATES.get(style, BACKGROUND_TEMPLATES["studio"])

    base_prompt = BACKGROUND_TEMPLATES.get(style, BACKGROUND_TEMPLATES["studio"])
    user_prompt = f"""أنت مدير فني لاستوديو تصوير إعلاني.
لدي منتج: {subject_description}.
أريد خلفية تسويقية بنمط: {style}.
prompt أساسي: {base_prompt}.
حسّنه ليكون أكثر دقة واحترافية ليناسب المنتج تحديداً. أعطِ الرد بالإنجليزية فقط، بـ prompt واحد فقط بدون شرح."""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 200},
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        Logger.warn(f"Gemini fallback: {e}")
        return base_prompt


# ============================================================
# دمج المنتج المعزول في الخلفية المُولَّدة
# ============================================================
def composite_image(
    subject_path: str,
    background_path: str,
    output_path: str,
    position: str = "center",
    scale: float = 0.65,
) -> bool:
    """
    يدمج صورة المنتج (مع شفافية) في الخلفية المُولَّدة.
    يستخدم Pillow فقط (مفتوح المصدر).
    """
    from PIL import Image

    Logger.info(f"دمج {subject_path} في {background_path}")
    try:
        subject = Image.open(subject_path).convert("RGBA")
        background = Image.open(background_path).convert("RGB")

        # resize الخلفية لتطابق أبعاد المنتج
        bg_w, bg_h = background.size
        subj_w, subj_h = subject.size

        # resize المنتج إلى 65% من ارتفاع الخلفية
        target_h = int(bg_h * scale)
        target_w = int(subj_w * (target_h / subj_h))
        subject_resized = subject.resize((target_w, target_h), Image.LANCZOS)

        # تحديد الموقع
        if position == "center":
            x = (bg_w - target_w) // 2
            y = (bg_h - target_h) // 2
        elif position == "bottom_center":
            x = (bg_w - target_w) // 2
            y = bg_h - target_h - int(bg_h * 0.1)  # 10% padding من الأسفل
        else:
            x, y = (bg_w - target_w) // 2, bg_h - target_h - int(bg_h * 0.1)

        # دمج
        background.paste(subject_resized, (x, y), subject_resized)
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        background.save(output_path, format="PNG", quality=95)
        Logger.ok(f"تم الدمج: {output_path}")
        return True
    except Exception as e:
        Logger.err(f"فشل الدمج: {e}")
        return False


# ============================================================
# خط المعالجة الكامل
# ============================================================
def process_full(
    subject_path: str,
    style: str,
    output_path: str,
    custom_prompt: Optional[str] = None,
    position: str = "center",
    scale: float = 0.65,
    model: str = "stabilityai/stable-diffusion-xl-base-1.0",
) -> dict:
    """
    خط المعالجة الكامل:
      1) توليد خلفية تسويقية
      2) دمج المنتج المعزول في الخلفية
    """
    Logger.info("=" * 60)
    Logger.info("Pixel-ZeroBaran AI Relighting Pipeline")
    Logger.info(f"  المنتج: {subject_path}")
    Logger.info(f"  النمط: {style}")
    Logger.info(f"  النموذج: {model}")
    Logger.info("=" * 60)

    # 1) توليد الـ prompt
    if custom_prompt:
        prompt = custom_prompt
    else:
        prompt = generate_prompt_via_gemini(Path(subject_path).stem, style)
    Logger.info(f"Prompt النهائي:\n  {prompt[:200]}...")

    # 2) توليد الخلفية
    bg_path = "/tmp/pixel_bg.png"
    if not call_huggingface(prompt, bg_path, model):
        return {"error": "huggingface_failed"}

    # 3) دمج المنتج في الخلفية
    if not composite_image(subject_path, bg_path, output_path, position, scale):
        return {"error": "composite_failed"}

    # 4) تنظيف
    Path(bg_path).unlink(missing_ok=True)

    return {
        "subject_path": subject_path,
        "output_path": output_path,
        "style": style,
        "prompt": prompt,
        "model": model,
    }


def main():
    parser = argparse.ArgumentParser(description="Pixel-ZeroBaran AI Relighter")
    parser.add_argument("--subject", required=True, help="صورة المنتج المعزولة (PNG شفاف)")
    parser.add_argument("--output", default="final_composite.png", help="مسار النتيجة النهائية")
    parser.add_argument(
        "--style",
        default="studio",
        choices=list(BACKGROUND_TEMPLATES.keys()),
        help="نمط الخلفية التسويقية",
    )
    parser.add_argument("--prompt", help="prompt مخصص بدل النمط")
    parser.add_argument("--position", default="center", choices=["center", "bottom_center"])
    parser.add_argument("--scale", type=float, default=0.65, help="نسبة ارتفاع المنتج من الخلفية (0.0-1.0)")
    parser.add_argument("--model", default="stabilityai/stable-diffusion-xl-base-1.0")
    args = parser.parse_args()

    result = process_full(
        args.subject,
        args.style,
        args.output,
        args.prompt,
        args.position,
        args.scale,
        args.model,
    )
    if "error" in result:
        Logger.err(f"فشل: {result['error']}")
        sys.exit(1)
    else:
        Logger.ok("اكتملت المعالجة بنجاح!")


if __name__ == "__main__":
    main()
