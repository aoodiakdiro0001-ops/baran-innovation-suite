# 🛡️ Cyber-SentinelBaran

<div dir="rtl">

## منظومة الفحص الأمني، اختبار الاختراق، والحماية الذاتية اللامركزية

**نظام ذكي متكامل لاختبار الاختراق الآلي، فحص الويب ومنافذ الشبكات، واكتشاف الثغرات الأمنية في التطبيقات والمواقع.**

يقوم بتمشيط خوادمك ومستودعاتك البرمجية دورياً، فحص الأكواد والروابط بحثاً عن الثغرات الشهيرة (OWASP Top 10، الحقن، الإعدادات الخاطئة)، إرسال تقرير فوري بالخطورة، وحتى اقتراح كود الإصلاح آلياً — دون دفع دولار واحد لأي أداة أمنية مدفوعة، وبموارد مجانية بالكامل.

---

## 📋 لماذا تتمنى كل شركة وكل فرد الحصول عليه؟

| الميزة | الوصف |
|---|---|
| 💰 **توفير مال فلكي** | أدوات فحص الأمان واختبار الاختراق للشركات تكلف ثروات سنوياً؛ هذا النظام يؤدي نفس الغرض بتكلفة صفر. |
| ⚡ **الحماية الاستباقية** | يكتشف الثغرات قبل أن يستغلها المخترقون، مما يمنع الاختراقات وتسريب البيانات المدمرة. |
| 🔒 **السيادة والخصوصية التامة** | فحصك الأمني يتم محلياً أو عبر أدوات مفتوحة المصدر دون إرسال بياناتك السرية لجهات خارجية. |

---

## 🛠️ الموارد المجانية البحتة (The Free Tech Stack)

| المكوّن | التقنية | الدور |
|---|---|---|
| محرك الجدولة | **GitHub Actions** | تشغيل الفحص المجدول مع كل push/PR |
| محرك الفحص | **Python + Semgrep + Nuclei + Nmap** | فحص الكود، الويب، والمنافذ |
| العقل الذكي | **Gemini API / Groq API (Free)** | تحليل الثغرات وتوليد كود الإصلاح |
| قاعدة البيانات | **Supabase (PostgreSQL Free Tier)** | تخزين السجلات التاريخية |
| قناة التنبيه | **Telegram Bot API** | تنبيه فوري عاجل على الهاتف |

---

## 📐 البنية البرمجية (Software Architecture)

```
[مستودع الكود / الخوادم المستهدفة]
                  │
                  ▼
[GitHub Actions + Semgrep/Nuclei/Nmap]
                  │
                  ▼
[Gemini AI - تحليل + توليد كود الإصلاح]
                  │
                  ▼
[Supabase ──► Telegram Bot (تنبيه + حل)]
```

### الطبقات الأربع:

1. **طبقة الفحص والمسح (Scanning)** — سكربت بايثون يدمج Semgrep/Nuclei/Nmap
2. **العقل الذكي (AI Core)** — Gemini يحلل ويقترح الإصلاح
3. **طبقة الأرشيف (Persistence)** — Supabase يحفظ السجل التاريخي
4. **طبقة التوصيل (Alerts)** — Telegram يرسل التنبيه الفوري

---

## ⚙️ التشغيل السريع

### المتطلبات الأساسية:
- Python 3.11+
- GitHub repository مع Actions مفعّل
- مفاتيح API:
  - `GEMINI_API_KEY` (مجاناً من Google AI Studio)
  - `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`
  - `SUPABASE_URL` + `SUPABASE_ANON_KEY` (مجاناً من Supabase)

### إعداد الـ Secrets في GitHub:
1. اذهب إلى Repository → Settings → Secrets and variables → Actions
2. أضف الـ Secrets المذكورة أعلاه

### إطلاق فحص يدوي:
```bash
gh workflow run security-scan.yml -f target=. -f scan_type=full
```

### أو فحص محلي مباشر:
```bash
# 1. فحص الكود
python scanner/scanner.py --target=. --scan-type=full --output=scan-results.json

# 2. تحليل AI
python scanner/ai_analyzer.py --scan-results=scan-results.json --provider=gemini

# 3. حفظ في Supabase
python scanner/supabase_client.py --action=save-scan --report=ai-report.json --target=.

# 4. إرسال Telegram
python scanner/telegram_notifier.py --report=ai-report.json --min-severity=high
```

---

## 📁 هيكل المشروع

```
cyber-sentinelbaran/
├── src/                          # لوحة التحكم Next.js
│   ├── app/
│   │   ├── api/
│   │   │   ├── scans/            # API الفحوصات
│   │   │   ├── vulnerabilities/  # API الثغرات
│   │   │   ├── ai-analyze/       # API التحليل الذكي
│   │   │   ├── alerts/           # API التنبيهات
│   │   │   ├── settings/         # API الإعدادات
│   │   │   └── stats/            # API الإحصائيات
│   │   ├── page.tsx              # الصفحة الرئيسية
│   │   └── layout.tsx
│   └── components/
│       └── sentinel/             # مكوّنات النظام
│           ├── stats-grid.tsx
│           ├── charts-grid.tsx
│           ├── scans-list.tsx
│           ├── vulnerabilities-list.tsx
│           ├── alerts-list.tsx
│           ├── settings-panel.tsx
│           ├── architecture-docs.tsx
│           └── new-scan-card.tsx
├── scanner/                      # سكربتات Python
│   ├── scanner.py                # الفحص الأمني
│   ├── ai_analyzer.py            # التحليل الذكي
│   ├── telegram_notifier.py     # التنبيهات
│   └── supabase_client.py       # طبقة الأرشيف
├── .github/workflows/            # GitHub Actions
│   ├── security-scan.yml        # فحص مع push/PR
│   └── scheduled-scan.yml       # فحص مجدول يومياً
├── prisma/schema.prisma         # قاعدة البيانات (dev)
└── scripts/seed.ts              # بيانات تجريبية
```

---

## 🚀 المزايا الرئيسية

- ✅ **فحص آلي كامل** عبر GitHub Actions (push/PR/cron)
- ✅ **فحص SAST** عبر Semgrep (OWASP Top 10، حقن، أسرار)
- ✅ **فحص DAST** عبر Nuclei (ثغرات الويب المعروفة)
- ✅ **مسح المنافذ** عبر Nmap (خدمات مكشوفة)
- ✅ **تحليل ذكي** عبر Gemini/Groq (درجة خطورة + كود إصلاح)
- ✅ **تنبيه Telegram فوري** مع كود الإصلاح جاهز للنسخ
- ✅ **أرشيف تاريخي** في Supabase لمقارنة الوضع الأمني عبر الزمن
- ✅ **لوحة تحكم احترافية** برسوم بيانية وإحصائيات
- ✅ **تكلفة صفر** — كل الأدوات Free Tier أو مفتوحة المصدر

---

## 📞 الدعم والمساهمة

- 👤 المالك: **Baran Avisat**
- 📧 البريد الرسمي للدعم: `baranavisat@gmail.com`
- 💬 واتساب / الهاتف: `00905313263722`
- 🛍️ المتجر الرسمي: https://baranavi.gumroad.com/
- 🐛 للتبليغ عن الثغرات: `baranavisat@gmail.com` (عنوان الرسالة: Security Report)
- 🤝 للدعم والمساهمة: `baranavisat@gmail.com`

---

## 📜 الترخيص

رخصة MIT — حر للتعديل والتوزيع مع الإبقاء على حقوق الملكية الفكرية.

```
MIT License

Copyright (c) 2026 Baran Avisat (baranavisat@gmail.com) — Baran Innovation Suite

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...
```

---

## 🏆 السجل

- **المشروع رقم #14** في سجل قاعدة بيانات الابتكار البرمجي.
- تاريخ الإبداع: 2026-10-30
- المؤلف: Baran Avisat (baranavisat@gmail.com)

---

## ⚠️ إخلاء المسؤولية

هذا النظام لأغراض تعليمية واختبار الأمان على **ممتلكاتك أنت فقط**. استخدام الأدوات على أهداف لا تملك تصريحاً بها غير قانوني. استخدم بمسؤولية وأخلاق.

---

<div align="center">

### صُمِّم وبُنِيَ بحب لحماية مطوري ومؤسسات العالم العربي والإسلامي 🛡️

</div>

</div>
