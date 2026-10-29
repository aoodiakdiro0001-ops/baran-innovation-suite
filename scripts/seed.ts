/**
 * Cyber-SentinelBaran Seed Script
 * يُنشئ بيانات تجريبية واقعية للعرض
 */
import { db } from "@/lib/db";

async function seed() {
  console.log("[SEED] بدء زرع البيانات التجريبية لـ Cyber-SentinelBaran...");

  // تنظيف البيانات القديمة
  await db.alertLog.deleteMany();
  await db.aiReport.deleteMany();
  await db.vulnerability.deleteMany();
  await db.scan.deleteMany();
  await db.setting.deleteMany();
  await db.imageJob.deleteMany();
  await db.backgroundTemplate.deleteMany();
  await db.pixelDailyStat.deleteMany();

  // إنشاء الفحوصات
  const scans = await Promise.all(
    [
      {
        target: "github.com/Cyber-SentinelBaran/core-platform",
        scanType: "full",
        status: "completed",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 12),
        totalFiles: 1842,
        totalFindings: 23,
        criticalCount: 2,
        highCount: 5,
        mediumCount: 9,
        lowCount: 7,
        triggeredBy: "cron",
        commitSha: "a3f5c12",
      },
      {
        target: "github.com/Cyber-SentinelBaran/api-service",
        scanType: "semgrep",
        status: "completed",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 6),
        totalFiles: 412,
        totalFindings: 11,
        criticalCount: 1,
        highCount: 3,
        mediumCount: 4,
        lowCount: 3,
        triggeredBy: "push",
        commitSha: "b8d2e91",
      },
      {
        target: "https://api.sentinelbaran.io",
        scanType: "nuclei",
        status: "completed",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1 + 1000 * 60 * 18),
        totalFiles: 0,
        totalFindings: 7,
        criticalCount: 1,
        highCount: 2,
        mediumCount: 3,
        lowCount: 1,
        triggeredBy: "cron",
      },
      {
        target: "github.com/Cyber-SentinelBaran/dashboard",
        scanType: "full",
        status: "running",
        startedAt: new Date(Date.now() - 1000 * 60 * 4),
        totalFiles: 256,
        totalFindings: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        triggeredBy: "push",
        commitSha: "f1c9a42",
      },
      {
        target: "https://sentinelbaran.io",
        scanType: "nmap",
        status: "failed",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12 + 1000 * 60 * 2),
        totalFiles: 0,
        totalFindings: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        triggeredBy: "manual",
      },
      {
        target: "github.com/Cyber-SentinelBaran/auth-module",
        scanType: "semgrep",
        status: "completed",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10 + 1000 * 60 * 8),
        totalFiles: 78,
        totalFindings: 18,
        criticalCount: 3,
        highCount: 6,
        mediumCount: 5,
        lowCount: 4,
        triggeredBy: "cron",
      },
    ].map((s) => db.scan.create({ data: s })),
  );

  // إنشاء الثغرات
  const vulnerabilities = [
    {
      scanId: scans[0].id,
      title: "SQL Injection في دالة authenticateUser",
      severity: "critical",
      category: "OWASP A03:2021 - Injection",
      cveId: "CWE-89",
      filePath: "src/auth/auth.py",
      lineNumber: 42,
      codeSnippet:
        "cursor.execute(f\"SELECT * FROM users WHERE email='{email}' AND password='{password}'\")",
      description:
        "ثغرة حقن SQL خطيرة تسمح للمهاجم بتجاوز المصادقة أو تنفيذ أوامر SQL ضارة على قاعدة البيانات. المدخلات غير مُعقّمة وتُدمج مباشرة في الاستعلام.",
      remediation:
        "استخدم استعلامات معاملية (Parameterized Queries) أو ORM layer يفصل البيانات عن الكود.",
      aiSuggestion:
        "import psycopg2\n\n# الإصلاح المقترح:\ncursor.execute(\n    \"SELECT * FROM users WHERE email=%s AND password=%s\",\n    (email, password)\n)",
      status: "open",
    },
    {
      scanId: scans[0].id,
      title: "Hardcoded API Secret في الإعدادات",
      severity: "critical",
      category: "OWASP A02:2021 - Cryptographic Failures",
      cveId: "CWE-798",
      filePath: "config/settings.py",
      lineNumber: 15,
      codeSnippet: 'STRIPE_SECRET = "sk_live_51NqXy2ABCDEF..."',
      description:
        "مفتاح API حقيقي محفوظ كنص صلب في الكود. أي شخص يصل للمستودع يحصل على المفتاح ويستطيع شحن البطاقات.",
      remediation:
        "استخدم متغيرات البيئة (.env) وإدارة الأسرار عبر خدمات مثل AWS Secrets Manager أو HashiCorp Vault.",
      aiSuggestion:
        'import os\n\n# الإصلاح المقترح:\nSTRIPE_SECRET = os.environ.get("STRIPE_SECRET")\nif not STRIPE_SECRET:\n    raise RuntimeError("STRIPE_SECRET غير مُعرّف في متغيرات البيئة")',
      status: "in_progress",
    },
    {
      scanId: scans[0].id,
      title: "XSS Stored في تعليقات المستخدمين",
      severity: "high",
      category: "OWASP A03:2021 - Injection",
      cveId: "CWE-79",
      filePath: "src/comments/render.tsx",
      lineNumber: 28,
      codeSnippet: "<div dangerouslySetInnerHTML={{__html: comment.body}} />",
      description:
        "محتوى المستخدم يُعرض بدون تطهير، مما يسمح بحقن سكربتات تُنفّذ في متصفحات المستخدمين الآخرين (Stored XSS).",
      remediation:
        "تجنب dangerouslySetInnerHTML، أو استخدم DOMPurify لتطهير HTML قبل العرض.",
      aiSuggestion:
        "import DOMPurify from 'dompurify';\n\n// الإصلاح المقترح:\n<div\n  dangerouslySetInnerHTML={{\n    __html: DOMPurify.sanitize(comment.body)\n  }}\n/>",
      status: "open",
    },
    {
      scanId: scans[0].id,
      title: "CORS مفتوح على جميع النطاقات",
      severity: "high",
      category: "OWASP A05:2021 - Security Misconfiguration",
      cveId: "CWE-942",
      filePath: "src/middleware.ts",
      lineNumber: 8,
      codeSnippet: 'res.setHeader("Access-Control-Allow-Origin", "*")',
      description:
        "إعداد CORS يسمح لأي موقع بقراءة الاستجابات. يمكن استغلاله لسرقة البيانات عبر CSRF أو third-party scripts.",
      remediation:
        "قيد CORS بقائمة نطاقات موثوقة فقط (Allowlist) بدل العنصر النجمي.",
      aiSuggestion:
        'const ALLOWED = ["https://sentinelbaran.io", "https://app.sentinelbaran.io"];\n\n// الإصلاح المقترح:\nconst origin = req.headers.get("origin");\nif (ALLOWED.includes(origin)) {\n    res.setHeader("Access-Control-Allow-Origin", origin);\n    res.setHeader("Vary", "Origin");\n}',
      status: "open",
    },
    {
      scanId: scans[0].id,
      title: "Weak Password Hashing (MD5)",
      severity: "high",
      category: "OWASP A02:2021 - Cryptographic Failures",
      cveId: "CWE-327",
      filePath: "src/auth/hash.py",
      lineNumber: 22,
      codeSnippet: "return hashlib.md5(password.encode()).hexdigest()",
      description:
        "MD5 مكسور منذ زمن طويل ويُكسّر بسهولة عبر rainbow tables. كلمات مرور المستخدمين ستتسرب فور تسريب قاعدة البيانات.",
      remediation:
        "استخدم bcrypt أو argon2 أو scrypt مع salt عشوائي وعامل عمل cost مرتفع.",
      aiSuggestion:
        "import bcrypt\n\n# الإصلاح المقترح:\ndef hash_password(password: str) -> str:\n    salt = bcrypt.gensalt(rounds=12)\n    return bcrypt.hashpw(password.encode(), salt).decode()\n\ndef verify_password(password: str, hashed: str) -> bool:\n    return bcrypt.checkpw(password.encode(), hashed.encode())",
      status: "fixed",
      fixedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      scanId: scans[1].id,
      title: "Missing Rate Limiting على نقطة تسجيل الدخول",
      severity: "high",
      category: "OWASP A07:2021 - Identification & Auth Failures",
      cveId: "CWE-307",
      filePath: "src/api/login.ts",
      lineNumber: 5,
      codeSnippet: "export default async function login(req, res) { /* no rate limit */ }",
      description:
        "نقطة تسجيل الدخول لا تحتوي على أي rate limiting، مما يسمح بحملات brute-force غير محدودة على كلمات المرور.",
      remediation:
        "أضف rate limiting عبر Upstash Redis أوmiddleware مع حد أقصى 5 محاولات لكل IP في 15 دقيقة.",
      aiSuggestion:
        'import { Ratelimit } from "@upstash/ratelimit";\nimport { Redis } from "@upstash/redis";\n\n// الإصلاح المقترح:\nconst limiter = new Ratelimit({\n  redis: Redis.fromEnv(),\n  limiter: Ratelimit.slidingWindow(5, "15 m"),\n});\n\nconst { success } = await limiter.limit(req.ip);\nif (!success) return res.status(429).json({ error: "محاولات كثيرة" });',
      status: "open",
    },
    {
      scanId: scans[1].id,
      title: "Insecure Deserialization في استيراد البيانات",
      severity: "high",
      category: "OWASP A08:2021 - Software & Data Integrity Failures",
      cveId: "CWE-502",
      filePath: "src/import/parser.ts",
      lineNumber: 17,
      codeSnippet: "const data = pickle.loads(request.body)",
      description:
        "استخدام pickle.loads على بيانات غير موثوقة يسمح بتنفيذ كود عن بعد (RCE).",
      remediation:
        "استخدم JSON بدل pickle، أو validate الشكل قبل deserialization.",
      aiSuggestion:
        '// الإصلاح المقترح:\nimport { z } from "zod";\n\nconst Schema = z.object({\n  users: z.array(z.object({\n    email: z.string().email(),\n    name: z.string(),\n  })),\n});\n\nconst data = Schema.parse(JSON.parse(request.body));',
      status: "open",
    },
    {
      scanId: scans[2].id,
      title: "Header missing X-Frame-Options",
      severity: "medium",
      category: "OWASP A05:2021 - Security Misconfiguration",
      cveId: "CWE-1021",
      filePath: "https://api.sentinelbaran.io",
      description: "إطار الاستجابة لا يمنع clickjacking، يمكن تضمين الموقع في iframe خبيث.",
      remediation: "أضف X-Frame-Options: DENY أو CSP frame-ancestors 'none'",
      aiSuggestion:
        '# nginx\nadd_header X-Frame-Options "DENY" always;\n\n# Next.js middleware.ts\nres.headers.set("X-Frame-Options", "DENY");\nres.headers.set("Content-Security-Policy", "frame-ancestors \'none\'");',
      status: "open",
    },
    {
      scanId: scans[2].id,
      title: "TLS 1.0 مدعوم (Deprecated)",
      severity: "medium",
      category: "OWASP A02:2021 - Cryptographic Failures",
      cveId: "CWE-326",
      filePath: "https://api.sentinelbaran.io",
      description: "الخادم يقبل TLS 1.0 المعروف بضعفه ضد BEAST وPOODLE attacks.",
      remediation: "قّلل دعم TLS إلى 1.2+ فقط.",
      aiSuggestion:
        '# nginx\nssl_protocols TLSv1.2 TLSv1.3;\nssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;\nssl_prefer_server_ciphers on;',
      status: "open",
    },
    {
      scanId: scans[2].id,
      title: "Directory Listing مفعّل",
      severity: "medium",
      category: "OWASP A05:2021 - Security Misconfiguration",
      cveId: "CWE-538",
      filePath: "https://api.sentinelbaran.io/static/",
      description: "إعداد الخادم يعرض محتويات المجلدات، مما يكشف بنية الملفات الحساسة.",
      remediation: "عطّل directory listing في إعدادات الخادم.",
      aiSuggestion: "# nginx\nautoindex off;\n\n# Apache\nOptions -Indexes",
      status: "open",
    },
    {
      scanId: scans[5].id,
      title: "JWT بدون التحقق من التوقيع",
      severity: "critical",
      category: "OWASP A02:2021 - Cryptographic Failures",
      cveId: "CWE-347",
      filePath: "src/auth/jwt.py",
      lineNumber: 56,
      codeSnippet: "jwt.decode(token, options={'verify_signature': False})",
      description:
        "تعطيل التحقق من توقيع JWT يسمح لأي مستخدم بتزوير رموز وصول لأي حساب.",
      remediation: "فعّل التحقق من التوقيع واستخدم خوارزمية RS256 مع مفاتيح دوارة.",
      aiSuggestion:
        '# الإصلاح المقترح:\nimport jwt\n\nPUBLIC_KEY = load_public_key()\n\npayload = jwt.decode(\n    token,\n    PUBLIC_KEY,\n    algorithms=["RS256"],\n    audience="sentinelbaran",\n    issuer="sentinelbaran-auth",\n    options={"require": ["exp", "iat", "sub"]},\n)',
      status: "fixed",
      fixedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
    {
      scanId: scans[5].id,
      title: "SSRF في webhook handler",
      severity: "critical",
      category: "OWASP A10:2021 - SSRF",
      cveId: "CWE-918",
      filePath: "src/webhooks/handler.py",
      lineNumber: 34,
      codeSnippet: 'response = requests.post(user_supplied_url)',
      description:
        "URL المُمرّر من المستخدم يُستخدم مباشرة في requests، يمكن للمهاجم استدعاء خدمات داخلية مثل metadata service (169.254.169.254).",
      remediation:
        "تحقق من النطاق وblock عناوين IP الداخلية ومجالات metadata cloud.",
      aiSuggestion:
        'import ipaddress, urllib.parse\nfrom urllib.parse import urlparse\n\n# الإصلاح المقترح:\ndef safe_fetch(url: str):\n    host = urlparse(url).hostname\n    try:\n        ip = ipaddress.ip_address(host)\n        if ip.is_private or ip.is_loopback or ip.is_link_local:\n            raise ValueError("blocked")\n    except ValueError:\n        # resolve DNS then check\n        pass\n    # validate allowlist of schemes\n    if urlparse(url).scheme not in ("http", "https"):\n        raise ValueError("invalid scheme")\n    return requests.post(url, timeout=5)',
      status: "open",
    },
    {
      scanId: scans[5].id,
      title: "Information Disclosure في /debug",
      severity: "medium",
      category: "OWASP A05:2021 - Security Misconfiguration",
      cveId: "CWE-200",
      filePath: "src/debug/routes.py",
      lineNumber: 12,
      codeSnippet: 'app.route("/debug/env") -> return os.environ',
      description: "نقطة /debug/env تكشف جميع متغيرات البيئة بما فيها الأسرار.",
      remediation: "احذف النقطة في الإنتاج أو قيدها لـ localhost مع auth.",
      aiSuggestion:
        '# الإصلاح المقترح:\nimport os\n\n@app.route("/debug/env")\n@local_only  # decorator\n@require_admin\ndef debug_env():\n    safe_keys = ["NODE_ENV", "LOG_LEVEL"]\n    return {k: os.environ.get(k) for k in safe_keys}',
      status: "open",
    },
    {
      scanId: scans[0].id,
      title: "Outdated dependency: lodash@4.17.20",
      severity: "low",
      category: "OWASP A06:2021 - Vulnerable Components",
      cveId: "CVE-2021-23337",
      filePath: "package.json",
      description: "إصدار lodash مصاب بثغرة command injection في template functions.",
      remediation: "حدّث إلى lodash@4.17.21+ أو استبدل بـ es-toolkit.",
      aiSuggestion: "// الإصلاح المقترح:\n// package.json\n// \"lodash\": \"^4.17.21\"\n// أو:\n// \"es-toolkit\": \"^1.0.0\"",
      status: "open",
    },
    {
      scanId: scans[0].id,
      title: "Verbose error stack traces في الإنتاج",
      severity: "low",
      category: "OWASP A05:2021 - Security Misconfiguration",
      cveId: "CWE-209",
      filePath: "next.config.ts",
      description: "stack traces تُرسل للعميل، تكشف بنية الكود والمسارات الداخلية.",
      remediation: "عطّل productionBrowserSourceMaps وlog الأخطاء داخلياً فقط.",
      aiSuggestion:
        '// الإصلاح المقترح:\n// next.config.ts\nexport default {\n  productionBrowserSourceMaps: false,\n  serverRuntimeConfig: { enableSourceMaps: false },\n};',
      status: "ignored",
    },
    {
      scanId: scans[0].id,
      title: "Cookie بدون SameSite",
      severity: "medium",
      category: "OWASP A01:2021 - Broken Access Control",
      cveId: "CWE-1275",
      filePath: "src/auth/session.ts",
      description: "كوكيز الجلسة بدون SameSite تسمح بـ CSRF عبر طلبات cross-site.",
      remediation: "اضبط SameSite=Strict أو Lax وSecure=true.",
      aiSuggestion:
        '// الإصلاح المقترح:\ncookies().set("session", token, {\n  httpOnly: true,\n  secure: true,\n  sameSite: "lax",\n  path: "/",\n  maxAge: 60 * 60 * 24 * 7,\n});',
      status: "open",
    },
    {
      scanId: scans[0].id,
      title: "Insecure file upload بدون نوع MIME",
      severity: "medium",
      category: "OWASP A04:2021 - Insecure Design",
      cveId: "CWE-434",
      filePath: "src/upload/handler.ts",
      description: "الاعتماد على امتداد الملف فقط يسمح برفع ملفات PHP/JS تحت اسم .jpg.",
      remediation: "تحقق من magic bytes مع file-type library.",
      aiSuggestion:
        '// الإصلاح المقترح:\nimport { fileTypeFromBuffer } from "file-type";\n\nconst type = await fileTypeFromBuffer(buffer);\nconst ALLOWED = ["image/jpeg", "image/png", "image/webp"];\nif (!type || !ALLOWED.includes(type.mime)) {\n  return res.status(415).json({ error: "نوع غير مدعوم" });\n}',
      status: "open",
    },
    {
      scanId: scans[0].id,
      title: "Logging of sensitive data",
      severity: "low",
      category: "OWASP A09:2021 - Security Logging Failures",
      cveId: "CWE-532",
      filePath: "src/utils/logger.ts",
      description: "logger يحفظ كائن الطلب كاملاً بما فيه كلمات المرور والـ tokens.",
      remediation: "redact الحقول الحساسة قبل التسجيل.",
      aiSuggestion:
        '// الإصلاح المقترح:\nconst SENSITIVE = ["password", "token", "ssn", "cardNumber"];\n\nfunction redact(obj) {\n  return Object.fromEntries(\n    Object.entries(obj).map(([k, v]) =>\n      SENSITIVE.includes(k) ? [k, "[REDACTED]"] : [k, v]\n    )\n  );\n}\n\nlogger.info("request", redact(req.body));',
      status: "open",
    },
  ];

  await Promise.all(vulnerabilities.map((v) => db.vulnerability.create({ data: v })));

  // إنشاء تقارير AI
  await db.aiReport.create({
    data: {
      scanId: scans[0].id,
      summary:
        "تم تحليل نتائج الفحص وأظهرت مخاطر عالية. 2 ثغرات حرجة (SQL Injection و Hardcoded Secret) تتطلب إصلاحاً فورياً قبل النشر. 5 ثغرات عالية الخطورة تشمل XSS و CORS misconfiguration. المخاطر الإجمالية مرفوعة بسبب تسرب الأسرار في الكود. يُوصى بمراجعة كامل pipeline قبل أي release.",
      riskScore: 78,
      recommendations:
        "1. إصلاح SQL Injection فوراً عبر parameterized queries.\n2. تدوير مفاتيح Stripe المسربة وإعادة إنشائها.\n3. تطبيق DOMPurify على تعليقات المستخدمين.\n4. إعداد CORS allowlist بدل النجمة.\n5. استبدال MD5 بـ bcrypt.\n6. إضافة rate limiting على نقطة الدخول.\n7. إجراء فحص dependency scan أسبوعياً.\n8. فرض secret scanning hook على كل PR قبل الدمج.",
    },
  });

  await db.aiReport.create({
    data: {
      scanId: scans[1].id,
      summary:
        "تم رصد 11 ثغرة منها 1 حرجة (JWT بدون توقيع) و 3 عالية. ثغرة SSRF في webhook handler تسمح بـ RCE عبر cloud metadata. الوضع يحتاج تدخلاً عاجلاً قبل أي تعرض إنتاجي.",
      riskScore: 84,
      recommendations:
        "1. تفعيل JWT signature verification فوراً.\n2. إضافة SSRF protection في webhook handler.\n3. حذف /debug endpoint في الإنتاج.\n4. مراجعة جميع endpoints التي تأخذ URL من المستخدم.",
    },
  });

  // إنشاء سجللات التنبيهات
  await Promise.all([
    db.alertLog.create({
      data: {
        channel: "telegram",
        recipient: "@sentinelbaran_admin",
        subject: "🚨 إنذار أمني حرج - SQL Injection",
        body: "تم اكتشاف ثغرة SQL Injection في src/auth/auth.py:42. درجة الخطورة: CRITICAL. تم إرسال كود الإصلاح المقترح.",
        status: "sent",
      },
    }),
    db.alertLog.create({
      data: {
        channel: "telegram",
        recipient: "@sentinelbaran_admin",
        subject: "🚨 إنذار أمني حرج - Hardcoded Secret",
        body: "تم اكتشاف مفتاح Stripe حقيقي محفوظ كنص صلب في config/settings.py:15. يُرجى تدوير المفتاح فوراً.",
        status: "sent",
      },
    }),
    db.alertLog.create({
      data: {
        channel: "telegram",
        recipient: "@sentinelbaran_admin",
        subject: "✅ تم إصلاح ثغرة MD5 Hashing",
        body: "تم تطبيق الإصلاح المقترح لاستبدال MD5 بـ bcrypt. الحالة: مغلقة.",
        status: "sent",
      },
    }),
    db.alertLog.create({
      data: {
        channel: "telegram",
        recipient: "@sentinelbaran_admin",
        subject: "⚠️ فحص مجدول اكتمل - 23 ثغرة",
        body: "اكتمل الفحص الكامل لـ core-platform. تم رصد 2 حرجة، 5 عالية، 9 متوسطة، 7 منخفضة.",
        status: "sent",
      },
    }),
    db.alertLog.create({
      data: {
        channel: "telegram",
        recipient: "@sentinelbaran_admin",
        subject: "❌ فشل فحص nmap على sentinelbaran.io",
        body: "تعذّر إكمال فحص nmap. السبب: انتهاء مهلة الاتصال. سيُعاد المحاولة في الجدول القادم.",
        status: "failed",
      },
    }),
  ]);

  // إنشاء الإعدادات
  await Promise.all([
    db.setting.create({ data: { key: "TELEGRAM_BOT_TOKEN", value: "" } }),
    db.setting.create({ data: { key: "TELEGRAM_CHAT_ID", value: "" } }),
    db.setting.create({ data: { key: "GEMINI_API_KEY", value: "" } }),
    db.setting.create({ data: { key: "GROQ_API_KEY", value: "" } }),
    db.setting.create({ data: { key: "OPENROUTER_API_KEY", value: "" } }),
    db.setting.create({ data: { key: "SHODAN_API_KEY", value: "" } }),
    db.setting.create({ data: { key: "SUPABASE_URL", value: "" } }),
    db.setting.create({ data: { key: "SUPABASE_ANON_KEY", value: "" } }),
    db.setting.create({ data: { key: "SCAN_SCHEDULE_CRON", value: "0 2 * * *" } }),
    db.setting.create({ data: { key: "MIN_SEVERITY_ALERT", value: "high" } }),
    db.setting.create({ data: { key: "AI_PROVIDER", value: "gemini" } }),
  ]);

  // معلومات المالك والدعم (عامة، لا مفاتيح)
  await Promise.all([
    db.setting.create({ data: { key: "OWNER_EMAIL", value: "baranavisat@gmail.com" } }),
    db.setting.create({ data: { key: "OWNER_PHONE", value: "00905313263722" } }),
    db.setting.create({ data: { key: "OWNER_NAME", value: "Baran Avisat" } }),
    db.setting.create({ data: { key: "OWNER_USDT_ADDRESS", value: "TLWdTjqqogkXNEXGiPWsGdjFP6ioycxeWW" } }),
    db.setting.create({ data: { key: "OWNER_BTC_ADDRESS", value: "bc1q8dhtdrndxsl70e97t8grydfe6pjue37zrhzf6c" } }),
    db.setting.create({ data: { key: "OWNER_IBAN_TRY", value: "TR10 0001 0090 1008 4013 0050 01" } }),
    db.setting.create({ data: { key: "OWNER_IBAN_USD", value: "TR80 0001 0090 1008 4013 0050 02" } }),
    db.setting.create({ data: { key: "GUMROAD_STORE_URL", value: "https://baranavi.gumroad.com/" } }),
    db.setting.create({ data: { key: "BINANCE_REFERRAL_URL", value: "https://www.binance.com/activity/referral-entry/CPA?ref=CPA_006Q5UBO64" } }),
    db.setting.create({ data: { key: "POCKET_FRIENDS_REFERRAL_URL", value: "https://pocket-friends.co/r/hvb4v0f1tt" } }),
    db.setting.create({ data: { key: "SOLANA_WALLET_ADDRESS", value: "" } }), // أضف يدوياً لاحقاً
    db.setting.create({ data: { key: "EVM_WALLET_ADDRESS", value: "0xDda2b17Dc7437700DE7EeFe564610a1976de6c" } }), // عنوان عام فقط
  ]);

  console.log("[SEED] تم إنشاء البيانات بنجاح");
  console.log(`[SEED] الفحوصات: ${scans.length}`);
  console.log(`[SEED] الثغرات: ${vulnerabilities.length}`);
  console.log("[SEED] التقارير: 2");
  console.log("[SEED] التنبيهات: 5");
  console.log("[SEED] الإعدادات: 22 (مفاتيح فارغة + معلومات المالك العامة)");

  // ============================================================
  // Pixel-ZeroBaran — بيانات تجريبية لاستوديو الصور
  // ============================================================
  console.log("[SEED] بدء زرع بيانات Pixel-ZeroBaran...");

  // قوالب الخلفيات التسويقية
  const templates = await Promise.all([
    db.backgroundTemplate.create({
      data: {
        name: "ستوديو إضاءة ناعمة",
        category: "studio",
        prompt: "professional product photography studio with soft white lighting, gradient background, seamless backdrop, high-end commercial look",
        previewUrl: "",
      },
    }),
    db.backgroundTemplate.create({
      data: {
        name: "طاولة خشبية أنيقة",
        category: "lifestyle",
        prompt: "rustic wooden table with warm natural light, cozy home environment, lifestyle product photography, shallow depth of field",
      },
    }),
    db.backgroundTemplate.create({
      data: {
        name: "شاطئ بحر كاريبي",
        category: "nature",
        prompt: "tropical beach with turquoise water, white sand, palm trees, sunny day, commercial advertising background",
      },
    }),
    db.backgroundTemplate.create({
      data: {
        name: "مكتب عصري",
        category: "lifestyle",
        prompt: "modern minimalist office desk, marble surface, soft natural window light, contemporary interior, premium product display",
      },
    }),
    db.backgroundTemplate.create({
      data: {
        name: "خلفية جرادينت نيون",
        category: "studio",
        prompt: "neon gradient background, vibrant colors purple to blue, futuristic tech product display, glowing edges",
      },
    }),
    db.backgroundTemplate.create({
      data: {
        name: "رصيف مديني ليلي",
        category: "lifestyle",
        prompt: "urban city street at night with bokeh lights, modern architecture background, cinematic product shot",
      },
    }),
  ]);

  // مهام معالجة الصور (تجريبية)
  const jobs = [
    {
      source: "telegram",
      originalUrl: "/uploads/sample-product-1.jpg",
      thumbnailUrl: "",
      fileName: "headphones_raw.jpg",
      fileSize: 1842000,
      width: 4000,
      height: 3000,
      processType: "full",
      backgroundStyle: "studio",
      status: "completed" as const,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      processingTimeMs: 4200,
      resultUrl: "/results/headphones_studio.png",
      resultSize: 2200000,
      triggeredBy: "telegram",
      costSavedUsd: 45.0,
    },
    {
      source: "web",
      originalUrl: "/uploads/sample-product-2.jpg",
      fileName: "sneaker_raw.jpg",
      fileSize: 2400000,
      width: 4500,
      height: 3000,
      processType: "relight",
      backgroundStyle: "studio",
      status: "completed" as const,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      processingTimeMs: 5800,
      resultUrl: "/results/sneaker_relight.png",
      resultSize: 2800000,
      triggeredBy: "manual",
      costSavedUsd: 60.0,
    },
    {
      source: "telegram",
      originalUrl: "/uploads/sample-product-3.jpg",
      fileName: "watch_raw.jpg",
      fileSize: 1950000,
      width: 4000,
      height: 4000,
      processType: "composite",
      backgroundStyle: "lifestyle",
      status: "completed" as const,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      processingTimeMs: 7200,
      resultUrl: "/results/watch_wooden_table.png",
      resultSize: 3100000,
      triggeredBy: "telegram",
      costSavedUsd: 85.0,
    },
    {
      source: "api",
      originalUrl: "/uploads/sample-product-4.jpg",
      fileName: "perfume_raw.jpg",
      fileSize: 1620000,
      width: 3500,
      height: 4500,
      processType: "full",
      backgroundStyle: "studio",
      status: "completed" as const,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      processingTimeMs: 6300,
      resultUrl: "/results/perfume_neon.png",
      resultSize: 2450000,
      triggeredBy: "api",
      costSavedUsd: 70.0,
    },
    {
      source: "web",
      originalUrl: "/uploads/sample-product-5.jpg",
      fileName: "coffee_mug_raw.jpg",
      fileSize: 1280000,
      width: 3000,
      height: 3000,
      processType: "rembg",
      backgroundStyle: null,
      status: "completed" as const,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
      processingTimeMs: 2100,
      resultUrl: "/results/coffee_mug_transparent.png",
      resultSize: 950000,
      triggeredBy: "manual",
      costSavedUsd: 25.0,
    },
    {
      source: "telegram",
      originalUrl: "/uploads/sample-product-6.jpg",
      fileName: "skincare_raw.jpg",
      fileSize: 2050000,
      width: 4000,
      height: 4000,
      processType: "composite",
      backgroundStyle: "nature",
      status: "completed" as const,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      processingTimeMs: 8400,
      resultUrl: "/results/skincare_beach.png",
      resultSize: 3250000,
      triggeredBy: "telegram",
      costSavedUsd: 95.0,
    },
    {
      source: "web",
      originalUrl: "/uploads/sample-product-7.jpg",
      fileName: "laptop_raw.jpg",
      fileSize: 3100000,
      width: 5000,
      height: 3500,
      processType: "full",
      backgroundStyle: "lifestyle",
      status: "processing" as const,
      triggeredBy: "manual",
      costSavedUsd: 0,
    },
    {
      source: "api",
      originalUrl: "/uploads/sample-product-8.jpg",
      fileName: "smartphone_raw.jpg",
      fileSize: 2800000,
      width: 4000,
      height: 5000,
      processType: "relight",
      backgroundStyle: "studio",
      status: "processing" as const,
      triggeredBy: "api",
      costSavedUsd: 0,
    },
    {
      source: "telegram",
      originalUrl: "/uploads/sample-product-9.jpg",
      fileName: "bottle_raw.jpg",
      fileSize: 1450000,
      width: 3500,
      height: 3500,
      processType: "composite",
      backgroundStyle: "industrial",
      status: "failed" as const,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      errorMessage: "HuggingFace API timeout بعد 30 ثانية. سيتم إعادة المحاولة تلقائياً.",
      triggeredBy: "telegram",
      costSavedUsd: 0,
    },
    {
      source: "web",
      originalUrl: "/uploads/sample-product-10.jpg",
      fileName: "watch_luxury_raw.jpg",
      fileSize: 3200000,
      width: 4500,
      height: 4500,
      processType: "full",
      backgroundStyle: "lifestyle",
      status: "completed" as const,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
      processingTimeMs: 9100,
      resultUrl: "/results/watch_luxury_office.png",
      resultSize: 3600000,
      triggeredBy: "manual",
      costSavedUsd: 120.0,
    },
    {
      source: "telegram",
      originalUrl: "/uploads/sample-product-11.jpg",
      fileName: "headphones2_raw.jpg",
      fileSize: 2100000,
      width: 4000,
      height: 3000,
      processType: "composite",
      backgroundStyle: "studio",
      status: "completed" as const,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      processingTimeMs: 5400,
      resultUrl: "/results/headphones2_neon.png",
      resultSize: 2700000,
      triggeredBy: "telegram",
      costSavedUsd: 65.0,
    },
    {
      source: "api",
      originalUrl: "/uploads/sample-product-12.jpg",
      fileName: "bag_raw.jpg",
      fileSize: 1850000,
      width: 3500,
      height: 4500,
      processType: "full",
      backgroundStyle: "lifestyle",
      status: "completed" as const,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
      processingTimeMs: 7800,
      resultUrl: "/results/bag_urban_night.png",
      resultSize: 3050000,
      triggeredBy: "api",
      costSavedUsd: 90.0,
    },
  ];

  await Promise.all(jobs.map((j) => db.imageJob.create({ data: j })));

  // إحصائيات يومية لآخر 14 يوم
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const total = Math.floor(Math.random() * 25) + 5; // 5-30 jobs/day
    const completed = Math.floor(total * (0.85 + Math.random() * 0.1));
    const failed = total - completed - Math.floor(Math.random() * 2);
    const bytesSaved = completed * 1800000;
    const costSaved = completed * 65;
    const avgMs = Math.floor(Math.random() * 5000) + 3000;

    await db.pixelDailyStat.create({
      data: {
        date: dayStart.toISOString().split("T")[0],
        totalJobs: total,
        completedJobs: completed,
        failedJobs: Math.max(0, failed),
        totalImagesProcessed: completed,
        totalBytesSaved: bytesSaved,
        totalCostSavedUsd: costSaved,
        avgProcessingMs: avgMs,
      },
    });
  }

  console.log(`[SEED] Pixel-ZeroBaran: ${templates.length} قالب خلفية`);
  console.log(`[SEED] Pixel-ZeroBaran: ${jobs.length} مهمة معالجة صور`);
  console.log("[SEED] Pixel-ZeroBaran: 14 يوم إحصائيات");
}

seed()
  .catch((e) => {
    console.error("[SEED] فشل:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
