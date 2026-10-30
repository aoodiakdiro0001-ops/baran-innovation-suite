# 🎭 Spatial-ZeroBaran

<div dir="rtl">

## الاستوديو الذاتي لتوليد ومعالجة المجسمات ثلاثية الأبعاد

**منظومة أتمتة لإنتاج وتجميع وتنظيف المجسمات ثلاثية الأبعاد (3D Assets) فورياً.** تحوّل النصوص أو الصور ثنائية الأبعاد (2D) إلى مجسمات جاهزة للضغط والاستخدام مباشرة داخل محركات الألعاب (Unreal Engine / Unity) أو برامج التصميم (Blender) مع أتمتة عمليات تقليل المضلعات (Decimation) وتوليد الإكساءات (Texturing) — دون دفع دولار واحد لأي منصة مدفوعة، وبموارد مجانية بالكامل.

---

## 📋 لماذا تتمنى كل شركة وكل فرد الحصول عليه؟

| الميزة | الوصف |
|---|---|
| 💰 **توفير مالي هائل** | بناء مكتبة مجسمات احترافية يكلف آلاف الدولارات؛ هذا النظام يولّدها وفق الطلب (On-Demand) بتكلفة صفر. |
| ⚡ **تسريع خطوط الإنتاج** | اختصار أسابيع من النمذجة اليدوية (3D Modeling) إلى دقائق معدودة لتجهيز البيئات والشخصيات والمجسمات. |
| 🔧 **أتمتة التنظيف والتجهيز** | لا يكتفي بتوليد المجسم، بل ينظّف هيكليته البرمجية ويحسّن أداءه ليعمل بسلاسة على الأجهزة الهوائية والسحابية. |

---

## 🛠️ الموارد المجانية البحتة (The Free Tech Stack)

| المكوّن | التقنية | الدور |
|---|---|---|
| محرك التشغيل (GPU/CPU) | **GitHub Actions / HF Spaces** | خوادم مجانية تعالج خوارزميات التحويل |
| محرك التوليد الذكي | **TripoSR / Shap-E / DreamGaussian** | نماذج مفتوحة المصدر لتحويل الصورة/النص إلى .OBJ/.GLB |
| محرك التعديل والتحسين | **Python + Blender Headless** | تشغيل Blender كخلفية لمعالجة المضلعات وخفض الحجم |
| التخزين وأرشيف المكتبة | **Supabase Free / GitHub LFS** | حفظ ملفات المجسمات والوصلات للرجوع إليها |
| واجهة التحكم والطلب | **Telegram Bot / Streamlit** | استقبال الأوامر وروابط تنزيل الأصول الجاهزة |

---

## 📐 البنية البرمجية (Software Architecture)

```
[إرسال صورة أو وصف للمجسم (Telegram/ويب)]
              │
              ▼
[Hugging Face API (توليد مجسم 3D خام .GLB/.OBJ)]
              │
              ▼
[Blender Headless (Decimation + UV Mapping + Textures)]
              │
              ▼
[Supabase Storage ──► رابط تنزيل + GIF معاينة (Telegram)]
```

### الطبقات الأربع:
1. **طبقة استقبال الفكرة** (Telegram / Web UI)
2. **العقل المولِّد للأنماط** (TripoSR / Shap-E)
3. **محرك المعالجة والتنظيف** (Blender Headless)
4. **طبقة التخزين والتسليم** (Supabase + Telegram)

---

## ⚙️ التشغيل السريع

### المتطلبات:
- Python 3.11+
- Blender مثبّت (`apt install blender` على Ubuntu)
- `pip install -r scanner/spatial/requirements.txt`
- مفاتيح API:
  - `SPATIAL_HF_TOKEN` (مجاني من huggingface.co)
  - `SPATIAL_TELEGRAM_BOT_TOKEN` + `SPATIAL_TELEGRAM_CHAT_ID`
  - (اختياري) `SPATIAL_SUPABASE_URL` + `SPATIAL_SUPABASE_ANON_KEY`

### تشغيل محلي:
```bash
# 1. توليد مجسم خام من صورة
python scanner/spatial/triposr_generator.py --input=chair.jpg --output=raw.obj

# 2. توليد من نص
python scanner/spatial/triposr_generator.py --prompt="viking chair" --output=raw.obj

# 3. معالجة Blender (Decimation + UV + Textures)
python scanner/spatial/blender_processor.py --input=raw.obj --output=final.glb --decimate=0.15 --uv-maps --textures

# 4. تسليم عبر Telegram
python scanner/spatial/telegram_delivery.py --asset-path=final.glb --name="Viking Chair" --report=final_report.json
```

### عبر GitHub Actions:
```bash
gh workflow run spatial-3d-pipeline.yml \
  -f prompt="ancient greek statue" \
  -f model_source=TripoSR \
  -f output_format=glb \
  -f decimate_ratio=0.15 \
  -f deliver_to_telegram=true
```

---

## 🚀 المزايا الرئيسية

- ✅ **توليد من 3 مدخلات**: نص، صورة 2D، رسم تخطيطي
- ✅ **3 نماذج**: TripoSR، Shap-E، DreamGaussian
- ✅ **Decimation آلي**: تقليل 85-95% من المضلعات
- ✅ **UV Mapping تلقائي** + تطبيع الإكساءات
- ✅ **4 صيغ تصدير**: GLB، FBX، OBJ، PLY
- ✅ **إصدارات متعددة** لكل مجسم (raw → cleaned → decimated)
- ✅ **تسليم عبر Telegram** مع GIF معاينة متحركة
- ✅ **أرشفة في Supabase** Storage
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

- **المشروع رقم #10** في سجل قاعدة بيانات الابتكار البرمجي.
- تاريخ الإبداع: 2026-10-30
- المؤلف: Baran Avisat

---

## ⚠️ إخلاء المسؤولية

استخدم فقط لتوليد مجسمات من أعمالك أو صورة تملكها. لا تستخدم أعمال الآخرين بدون إذن.

---

<div align="center">

### صُمِّم وبُنِيَ بحب لمطوري ومصممي الألعاب ثلاثية الأبعاد في العالم العربي والإسلامي 🎭

</div>

</div>
