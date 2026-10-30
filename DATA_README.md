# 📊 Data-Nexus ZeroBaran

<div dir="rtl">

## منظومة تحليل وهندسة البيانات الذاتية واللامركزية

**نظام ذكي متكامل لجمع، تنظيف، تحليل، واستخراج الرؤى من قواعد البيانات الضخمة والملفات المتعددة (CSV, JSON, SQL, APIs) أوتوماتيكياً.** يقوم بربط مصادر البيانات المتباينة، معالجة القيم المفقودة والشوائب برمجياً، توليد لوحات تحكم تفاعلية فورية، وإرسال تقارير تنبؤية دقيقة عن حالة عملك أو مشروعك — دون دفع دولار واحد لأي منصة تحليل مدفوعة، وبموارد مجانية بالكامل.

---

## 📋 لماذا تتمنى كل شركة وكل فرد الحصول عليه؟

| الميزة | الوصف |
|---|---|
| 💰 **توفير مالي فلكي** | أدوات هندسة وتحليل البيانات (Tableau $70/مستخدم/شهر، Power BI $20/مستخدم/شهر، Looker $30K+/سنة) تكلف الشركات ثروات سنوياً؛ هذا النظام يؤدي نفس الغرض باحترافية وبتكلفة صفر. |
| 📊 **التحليل التنبؤي الفوري** | لا يقتصر على عرض الأرقام السابقة، بل يستخدم الذكاء الاصطناعي لتوقع الاتجاهات المستقبلية (مبيعات، تراجع أداء، احتياجات مخزون). |
| 🔒 **السيادة المطلقة للبيانات** | حماية بياناتك الحساسة أو المالية وعدم تسريبها لشركات التحليل الخارجية. كل شيء يبقى تحت سيطرتك على Supabase الخاص بك. |

---

## 🛠️ الموارد المجانية البحتة (The Free Tech Stack)

| المكوّن | التقنية | الدور |
|---|---|---|
| محرك المعالجة (Pipeline) | **Python + Pandas/Polars + GitHub Actions** | سحب البيانات، تنظيفها، تنفيذ العمليات الحسابية والمعقدة دورياً |
| العقل التحليلي | **Gemini API / Groq API** | قراءة مصفوفات البيانات واستخراج القصة وراء الأرقام |
| قاعدة البيانات (Lakehouse) | **Supabase (PostgreSQL Free)** | تخزين الجداول الضخمة والبيانات المعالَجة للرجوع إليها تاريخياً |
| لوحة التحكم | **Streamlit / Next.js Dashboard** | استضافة مجانية لرسوم بيانية تفاعلية مبهرة |
| قناة التنبيهات | **Telegram Bot API** | تقارير صباحية وتنبيهات فورية عند الشذوذ |

---

## 📐 البنية البرمجية (Software Architecture)

```
[مصادر البيانات (CSV, SQL, JSON, APIs)]
              │
              ▼
[GitHub Actions + Python (ETL Pipeline)]
              │
              ▼
[Supabase (Data Lakehouse - حِفظ سحابي)]
              │
              ▼
[Gemini API (تحليل + تنبؤ + توصيات)]
              │
              ▼
[Streamlit Dashboard + Telegram Bot]
```

---

## ⚙️ التشغيل السريع

### المتطلبات:
- Python 3.11+
- `pip install -r scanner/data/requirements.txt`
- مفاتيح API (تُملأ من تبويب الإعدادات):
  - `GEMINI_API_KEY` (مجاني من Google AI Studio)
  - `DATA_TELEGRAM_BOT_TOKEN` + `DATA_TELEGRAM_CHAT_ID`
  - (اختياري) `DATA_SUPABASE_URL` + `DATA_SUPABASE_ANON_KEY`

### تشغيل محلي:
```bash
# 1. ETL على ملف CSV
python scanner/data/etl_pipeline.py --input=data/sales.csv --output=processed/clean.parquet

# 2. كشف الشذوذ
python scanner/data/anomaly_detector.py --metric=sales --values=100,200,300,9000

# 3. تحليل AI
python scanner/data/ai_insights.py --dataset="Sales Q4" --summary="..." --metrics=sales,cost

# 4. تقرير أسبوعي
python scanner/data/telegram_alerts.py --weekly
```

### عبر GitHub Actions:
```bash
gh workflow run data-pipeline.yml -f mode=full_pipeline -f source_file=data/sales.csv
```

---

## 🚀 المزايا الرئيسية

- ✅ **ETL تلقائي** لـ CSV, JSON, SQL, APIs
- ✅ **تنظيف ذكي**: drop NA, dedupe, type cast, normalize, fill missing
- ✅ **كشف الشذوذ** بـ 3 طرق: Z-Score, IQR, Isolation Forest
- ✅ **رؤى AI**: اتجاهات + تنبؤات + توصيات عملية
- ✅ **8 مصادر بيانات تجريبية** (مبيعات، عملاء، Shopify، GA، Meta Ads، مخزون، مرتجعات، شحن)
- ✅ **تنبيهات فورية** على Telegram عند الشذوذ الحرج
- ✅ **تقرير أسبوعي** تلقائي مع الأبرز رؤى
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

- **المشروع رقم #11** في سجل قاعدة بيانات الابتكار البرمجي.
- تاريخ الإبداع: 2026-10-30
- المؤلف: Baran Avisat

---

## ⚠️ إخلاء المسؤولية

لا تُحلّل بيانات شخصية أو حساسة دون موافقة صاحبها. هذا النظام للأغراض التحليلية التجارية المشروعة فقط.

---

<div align="center">

### صُمِّم وبُنِيَ بحب لمؤسسات ومحللي العالم العربي والإسلامي 📊

</div>

</div>
