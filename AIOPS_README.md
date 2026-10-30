# 🤖 AIOps-ZeroBaran

<div dir="rtl">

## المهندس الرقمي الذاتي لإدارة وصيانة الخوادم

**نظام ذكي متكامل ومستقل لمراقبة صحة الخوادم، اكتشاف الأعطال، وإصلاحها ذاتياً (Self-Healing Operations).** يقوم بمراقبة خوادمك ومواقعك على مدار الساعة، وعند حدوث أي انقطاع أو ارتفاع مفاجئ في استهلاك الموارد أو ظهور أخطاء برمجية، لا يكتفي بإرسال تنبيه، بل يقوم آلياً بتشخيص السبب الجذري (Root Cause Analysis)، وتنفيذ أوامر الإصلاح التلقائي (مثل إعادة تشغيل الخدمات المنهارة أو تنظيف الذاكرة)، مع إرسال تقرير تشخيصي شامل — دون دفع دولار واحد لأي منصة مراقبة مدفوعة، وبموارد مجانية بالكامل.

---

## 📋 لماذا تتمنى كل شركة وكل مطور الحصول عليه؟

| الميزة | الوصف |
|---|---|
| 💰 **توفير مالي فلكي** | أدوات إدارة الخوادم (Datadog $15/host/mo، New Relic $99/mo، PagerDuty $21/user/mo) تكلف مبالغ طائلة؛ هذا النظام يؤدي نفس الغرض بتكلفة صفر. |
| ⚡ **استجابة فورية** | يتصرّف فور حدوث الخلل لإعادة الموقع أو الخدمة للعمل قبل أن يلاحظ العملاء أي انقطاع. MTTR (Mean Time To Recovery) من 15-120 ثانية. |
| 🤖 **مهندس سحابي 24/7** | يمنحك مهندس سحابي (Cloud Engineer) يعمل على مدار 24 ساعة دون أي مصاريف تشغيلية. يقلل الاعتماد على العنصر البشري. |
| 🔒 **سيادة وخصوصية** | سجلاتك ومفاتيحك تبقى على خوادمك، لا تُرسل لأي طرف ثالث (باستثناء نماذج AI التي تختارها). |

---

## 🛠️ الموارد المجانية البحتة (The Free Tech Stack)

| المكوّن | التقنية | الدور |
|---|---|---|
| محرّك الرصد | **GitHub Actions + Cloudflare Workers + Cron** | فحص دوري لصحة الخوادم والـ APIs (HTTP / TCP / ICMP) |
| العقل التشخيصي | **Gemini API / Groq API (Free Tiers)** | تحليل السجلات، اكتشاف السبب الجذري، توليد أوامر الإصلاح |
| محرّك التنفيذ الذاتي | **SSH + systemd + PM2 + Docker** | تنفيذ أوامر الإصلاح (restart / kill / failover) بأمان |
| قاعدة البيانات | **Supabase / Turso / SQLite** | سجلات Uptime، الأعطال، والإجراءات المتخذة + التقارير اليومية |
| التنبيهات والأوامر | **Telegram Bot API + Web Dashboard** | تقارير الحوادث الفورية + أوامر إصلاح يدوية عبر الأزرار |

---

## 📐 البنية البرمجية (Software Architecture)

```
[GitHub Actions (كل 5 دقائق) → Health Monitor]
              │
              ▼
[فحص HTTP/TCP لكل خدمة + قياس زمن الاستجابة]
              │
       (إذا خطأ 5xx أو timeout)
              ▼
[سحب آخر 100 سطر من error logs]
              │
              ▼
[Gemini API (تحليل السجلات + استخراج السبب الجذري وأمر الإصلاح)]
              │
              ▼
[Auto-Remediation (تنفيذ systemctl restart / FLUSHDB / kill -9)]
              │
              ▼
[Supabase ──► Telegram Bot (تقرير كامل + الحالة + زمن التعافي)]
```

### الطبقات الأربع:
1. **طبقة المراقبة المستمرة** (GitHub Actions + Cloudflare Workers)
2. **طبقة التشخيص الذكي** (Gemini AI / Groq API)
3. **طبقة الاستعادة الذاتية** (SSH + systemd + Webhooks)
4. **طبقة التقارير والتنبيه** (Telegram Bot + Supabase)

---

## ⚙️ التشغيل السريع

### المتطلبات:
- Python 3.11+
- مفاتيح API:
  - `GEMINI_API_KEY` (مجاني من Google AI Studio)
  - `GROQ_API_KEY` (اختياري، مجاني من Groq Console)
  - `AIOPS_TELEGRAM_BOT_TOKEN` + `AIOPS_TELEGRAM_CHAT_ID` (للتنبيهات)
  - (اختياري) `AIOPS_SUPABASE_URL` + `AIOPS_SUPABASE_ANON_KEY` (للسجلات)

### تشغيل محلي:
```bash
# 1. مراقبة خادم HTTP كل 60 ثانية (كود 200 متوقع)
python scanner/aiops/health_monitor.py \
  --url=https://api.sentinelbaran.io/health \
  --timeout=10 \
  --expected-code=200 \
  --interval=60 \
  --count=3

# 2. فحص TCP port (PostgreSQL مثلاً)
python scanner/aiops/health_monitor.py \
  --url=db.sentinelbaran.io \
  --port=5432 \
  --timeout=5 \
  --interval=30

# 3. تشخيص AI لسجلات الأخطاء
python scanner/aiops/ai_diagnostic.py \
  --logs=error.log \
  --incident-type=high_cpu \
  --service=web-01 \
  --output=diagnosis.json

# 4. تنفيذ إصلاح ذاتي (إعادة تشغيل خدمة)
python scanner/aiops/auto_remediation.py \
  --incident-id=INC-014 \
  --action=auto_restart \
  --service=nginx \
  --dry-run \
  --output=remediation.json

# 5. إرسال تقرير حادثة لتليجرام
python scanner/aiops/telegram_alerts.py \
  --incident=incident.json
```

### عبر GitHub Actions:
```bash
# تشغيل دورة مراقبة شاملة (check_all=true, auto_heal=true)
gh workflow run aiops-monitoring.yml \
  -f check_all=true \
  -f auto_heal=true

# مراقبة خدمة محددة فقط (دون إصلاح ذاتي)
gh workflow run aiops-monitoring.yml \
  -f check_all=false \
  -f specific_service_url=https://api.example.com/health \
  -f auto_heal=false
```

> يتم تنفيذ الـ workflow تلقائياً كل 5 دقائق عبر cron `*/5 * * * *`.

---

## 🚀 المزايا الرئيسية

- ✅ **مراقبة 24/7** عبر GitHub Actions مجاناً (2000 دقيقة/شهر)
- ✅ **فحص متعدد الأنواع**: HTTP / HTTPS / TCP / ICMP (auto-detect)
- ✅ **تشخيص AI** للسجلات (Gemini 1.5 Flash — مجاني)
- ✅ **إصلاح ذاتي** (Self-Healing) عبر 7 أنواع إجراءات:
  - `auto_restart` (systemctl restart)
  - `clear_cache` (FLUSHDB Redis)
  - `kill_process` (kill -9 + restart)
  - `scale_up` (docker-compose scale)
  - `failover` (تفعيل خادم احتياطي)
  - `log_rotate` (تحرير مساحة القرص)
  - `custom` (أمر مخصّص)
- ✅ **تنبيهات فورية** على Telegram (severity-based)
- ✅ **سجل دائم** في Supabase لكل الحوادث والإجراءات
- ✅ **إحصائيات يومية** + Uptime + MTTR + التكلفة المُوفَّرة
- ✅ **10 خدمات تجريبية** (API, Web, PostgreSQL, Redis, CDN, Celery, Telegram Bot, S3, Pixel-ZeroBaran, SEO-GhostBaran)
- ✅ **7 حوادث تجريبية** + **8 إجراءات إصلاح (AI-suggested)**
- ✅ **14 يوم** من الإحصائيات اليومية (.daily stats)
- ✅ **تكلفة صفر** — كل الأدوات Free Tier أو مفتوحة المصدر

---

## 📂 هيكل الملفات

```
scanner/aiops/
├── health_monitor.py       # فحص HTTP/TCP لكل خدمة
├── ai_diagnostic.py        # تحليل AI للسجلات + استخراج السبب الجذري
├── auto_remediation.py     # تنفيذ أوامر الإصلاح الذاتي
├── telegram_alerts.py      # إرسال تنبيهات Telegram للحوداث
└── requirements.txt        # requests + urllib (stdlib)

.github/workflows/
└── aiops-monitoring.yml    # مراقبة كل 5 دقائق + AI + auto-heal + alerts

src/app/api/aiops/
├── stats/route.ts          # إحصائيات شاملة (overview + daily + status + recent)
├── services/route.ts       # قائمة الخدمات المراقَبة + عدّاد الحوادث
├── incidents/route.ts      # قائمة الحوادث + remediations
└── remediations/route.ts   # قائمة إجراءات الإصلاح

src/components/aiops/
├── aiops-stats-grid.tsx        # 6 بطاقات (خدمات/تعمل/حوادث/إصلاح/uptime/توفير)
├── aiops-charts-grid.tsx       # 3 رسوم (Area حوادث/إصلاح، Pie حالات، Bar استجابة)
├── service-list.tsx            # جدول الخدمات (auto-refresh 10s)
├── incident-list.tsx           # بطاقات الحوادث + Dialog تفصيلي (auto-refresh 15s)
├── aiops-architecture-docs.tsx # التوثيق (طبقات + workflow + tech stack)
└── aiops-settings-panel.tsx    # 4 بطاقات (AI + Monitoring + Telegram + Supabase)
```

---

## 🗄️ قاعدة البيانات (Prisma Models)

| النموذج | الدور |
|---|---|
| `MonitoredService` | الخدمات المراقَبة (10 سجلات تجريبية) |
| `Incident` | الحوادث المكتشفة (7 سجلات تجريبية) |
| `Remediation` | إجراءات الإصلاح (8 سجلات تجريبية) |
| `AiopsDailyStat` | إحصائيات يومية (14 يوم) |

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

- **المشروع رقم #8** في سجل قاعدة بيانات الابتكار البرمجي.
- تاريخ الإبداع: 2026-10-30
- المؤلف: Baran Avisat

---

## ⚠️ إخلاء المسؤولية

استخدم Auto-Remediation بحذر على بيئات الإنتاج. الوضع الافتراضي هو `dry-run` (محاكاة) لتفادي الإضرار بالخوادم. راجع الأوامر المُولَّدة من AI قبل تنفيذها فعلياً. لا تفعّل `auto_heal=true` على بيئات حسّاسة دون اختبار كافٍ.

---

<div align="center">

### صُمِّم وبُنِيَ بحب لمطوري ومهندسي DevOps ومؤسسات العالم العربي والإسلامي 🤖

</div>

</div>
