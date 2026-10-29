# 🎨 Pixel-ZeroBaran

<div dir="rtl">

## استوديو تعديل ومعالجة الصور والتصميم الذاتي اللامركزي

**نظام ذكي متكامل لتعديل الصور، إزالة الخلفيات بدقة متناهية، إعادة إضاءة المنتجات (Relighting)، وتوليد لقطات تسويقية احترافية للمنتجات أو الأشخاص (Product/Portrait Virtual Photography).**

يقوم بمعالجة الصور الخام بضغطة زر واحدة، دمجها في خلفيات واقعية تناسب الهوية التجارية، وتصديرها بدقة عالية جاهزة للإعلانات — دون دفع دولار واحد لأي أداة مدفوعة، وبموارد مجانية بالكامل.

---

## 📋 لماذا تتمنى كل شركة وكل فرد الحصول عليه؟

| الميزة | الوصف |
|---|---|
| 💰 **توفير مالي فلكي** | استئجار استوديو تصوير أو دفع اشتراكات أدوات احترافية يكلف مئات الدولارات شهرياً؛ هذا النظام يؤدي نفس الغرض بتكلفة صفر. |
| ⚡ **السرعة والإنتاج الفوري** | معالجة وعرض عشرات صور المنتجات خلال ثوانٍ معدودة دون الحاجة لخبرة في برامج التصميم المعقدة (Bulk Processing). |
| ✨ **الجودة والواقعية** | يدمج المنتجات في بيئات بصرية طبيعية مع ظلال وإضاءة متوافقة تماماً كأنها صُوّرت في استوديو عالمي. |

---

## 🛠️ الموارد المجانية البحتة (The Free Tech Stack)

| المكوّن | التقنية | الدور |
|---|---|---|
| محرك التشغيل | **GitHub Actions** | تنفيذ المعالجة المجدولة والآلية |
| محرك العزل والتعديل | **rembg + Pillow + OpenCV** | عزل الخلفيات بدقة، تعديل الأبعاد، تجهيز الصور |
| العقل البصري | **Hugging Face API + Gemini API** | تحليل الصور، توليد خلفيات واقعية، ضبط الإضاءة |
| قاعدة البيانات والتخزين | **Supabase Storage** | حفظ الصور الأصلية والنهائية |
| قناة الاستقبال والتسليم | **Telegram Bot API** | استلام الصور وإرسال النتيجة الفاخرة |

---

## 📐 البنية البرمجية (Software Architecture)

```
[رفع صورة المنتج (تليجرام/ويب/API)]
              │
              ▼
[rembg — عزل الخلفية بدقة فائقة]
              │
              ▼
[Hugging Face / Gemini — توليد خلفية تسويقية + إضاءة]
              │
              ▼
[Supabase Storage ──► Telegram Bot (PNG عالية الدقة)]
```

### الطبقات الخمس:

1. **طبقة الالتقاط (Ingestion)** — Telegram / Web / API
2. **طبقة العزل (Isolation)** — rembg لعزل الخلفية
3. **العقل البصري (AI Relighting)** — Hugging Face / Gemini
4. **طبقة الأرشيف (Persistence)** — Supabase Storage
5. **طبقة التسليم (Delivery)** — Telegram Bot

---

## ⚙️ التشغيل السريع

### المتطلبات:
- Python 3.11+
- `pip install -r scanner/pixel/requirements.txt`
- مفاتيح API (تُملأ من تبويب الإعدادات في لوحة التحكم):
  - `HUGGINGFACE_TOKEN` (مجاناً من huggingface.co/settings/tokens)
  - `GEMINI_API_KEY` (اختياري - لتحسين الـ prompts)
  - `PIXEL_TELEGRAM_BOT_TOKEN` + `PIXEL_TELEGRAM_CHAT_ID`
  - `PIXEL_SUPABASE_URL` + `PIXEL_SUPABASE_ANON_KEY`

### تشغيل محلي:
```bash
# 1. عزل خلفية صورة واحدة
python scanner/pixel/rembg_processor.py --input=img.jpg --output=nobg.png

# 2. إعادة إضاءة ودمج في خلفية تسويقية
python scanner/pixel/ai_relighter.py --subject=nobg.png --style=studio --output=final.png

# 3. معالجة دفعة كاملة
python scanner/pixel/batch_processor.py --folder=products/ --process=full --style=lifestyle_wood

# 4. أرشفة في Supabase
python scanner/pixel/supabase_storage.py --upload=final.png --bucket=pixel-results

# 5. تسليم عبر Telegram
python scanner/pixel/telegram_delivery.py --image=final.png
```

### عبر GitHub Actions:
```bash
gh workflow run pixel-processing.yml \
  -f process_type=full \
  -f background_style=studio \
  -f deliver_to_telegram=true
```

---

## 📁 هيكل المشروع

```
cyber-sentinelbaran/  (يحوي أيضاً Pixel-ZeroBaran في نفس المستودع)
├── src/
│   ├── app/
│   │   ├── api/pixel/                  # APIs الصور
│   │   │   ├── stats/route.ts
│   │   │   ├── jobs/route.ts
│   │   │   ├── upload/route.ts
│   │   │   └── templates/route.ts
│   │   └── page.tsx                    # Launcher مع تبويب بين المشروعين
│   └── components/pixel/
│       ├── pixel-stats-grid.tsx
│       ├── pixel-charts-grid.tsx
│       ├── image-uploader.tsx
│       ├── job-queue.tsx
│       ├── results-gallery.tsx
│       ├── pixel-architecture-docs.tsx
│       └── pixel-settings-panel.tsx
├── scanner/pixel/                     # سكربتات Python
│   ├── rembg_processor.py
│   ├── ai_relighter.py
│   ├── batch_processor.py
│   ├── telegram_delivery.py
│   ├── supabase_storage.py
│   └── requirements.txt
├── .github/workflows/
│   └── pixel-processing.yml            # معالجة الصور عبر Actions
└── prisma/schema.prisma               # جداول ImageJob, BackgroundTemplate, PixelDailyStat
```

---

## 🚀 المزايا الرئيسية

- ✅ **عزل خلفية فوري** بدقة عالية عبر rembg (مفتوح المصدر)
- ✅ **10 قوالب خلفيات تسويقية** (ستوديو، خشب، شاطئ، مكتب، نيون، إلخ)
- ✅ **معالجة دفعات بالجملة** (Bulk Processing)
- ✅ **دمج ذكي مع ظلال واقعية** عبر Pillow
- ✅ **أرشفة تلقائية** في Supabase Storage
- ✅ **تسليم فوري** عبر Telegram Bot
- ✅ **GitHub Actions** مجاني للمعالجة المجدولة
- ✅ **تكلفة صفر** — كل الأدوات Free Tier أو مفتوحة المصدر

---

## 📞 الدعم والمساهمة

- 📧 البريد: `baranavisat@gmail.com`
- 💬 واتساب: `00905313263722`
- 🛍️ المتجر: `https://baranavi.gumroad.com/`

---

## 📜 الترخيص

رخصة MIT — حر للتعديل والتوزيع مع الإبقاء على حقوق الملكية الفكرية.

---

## 🏆 السجل

- **المشروع رقم #13** في سجل قاعدة بيانات الابتكار البرمجي.
- تاريخ الإبداع: 2026-10-30
- المؤلف: Baran Avisat

---

## ⚠️ إخلاء المسؤولية

استخدم فقط مع صور تملك حقوقها. لا تستخدم صور الآخرين بدون إذن. Pixel-ZeroBaran لا يتحمل مسؤولية أي استخدام مخالف لحقوق الملكية الفكرية.

---

<div align="center">

### صُمِّم وبُنِيَ بحب لمساعدة التجار والمصممين في العالم العربي والإسلامي 🎨

</div>

</div>
