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
  await db.keyword.deleteMany();
  await db.rankSnapshot.deleteMany();
  await db.competitor.deleteMany();
  await db.generatedContent.deleteMany();
  await db.seoDailyStat.deleteMany();
  await db.dataset.deleteMany();
  await db.pipeline.deleteMany();
  await db.insight.deleteMany();
  await db.anomaly.deleteMany();
  await db.dataDailyStat.deleteMany();
  await db.asset3D.deleteMany();
  await db.assetVersion.deleteMany();
  await db.spatialDailyStat.deleteMany();
  await db.lead.deleteMany();
  await db.outreach.deleteMany();
  await db.campaign.deleteMany();
  await db.leadDailyStat.deleteMany();
  await db.monitoredService.deleteMany();
  await db.incident.deleteMany();
  await db.remediation.deleteMany();
  await db.aiopsDailyStat.deleteMany();
  await db.conversation.deleteMany();
  await db.chatMessage.deleteMany();
  await db.knowledgeBase.deleteMany();
  await db.salesDailyStat.deleteMany();

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

  // ============================================================
  // SEO-GhostBaran — بيانات تجريبية لمنظومة الرصد التسويقي
  // ============================================================
  console.log("[SEED] بدء زرع بيانات SEO-GhostBaran...");

  // الكلمات المفتاحية المُتتبَّعة
  const keywords = [
    { keyword: "فحص أمني تلقائي", locale: "ar", searchVolume: 2400, difficulty: 35, intent: "commercial", currentRank: 7, previousRank: 12, bestRank: 5, worstRank: 25, url: "https://sentinelbaran.io/scan", status: "tracking" },
    { keyword: "إزالة خلفية الصور", locale: "ar", searchVolume: 12000, difficulty: 55, intent: "informational", currentRank: 18, previousRank: 22, bestRank: 14, worstRank: 40, url: "https://sentinelbaran.io/pixel", status: "tracking" },
    { keyword: "owasp top 10 scanner", locale: "en", searchVolume: 8200, difficulty: 68, intent: "commercial", currentRank: 3, previousRank: 5, bestRank: 2, worstRank: 15, url: "https://sentinelbaran.io/owasp", status: "won" },
    { keyword: "ai content generator arabic", locale: "en", searchVolume: 4100, difficulty: 42, intent: "commercial", currentRank: 14, previousRank: 14, bestRank: 11, worstRank: 28, url: "https://sentinelbaran.io/ai-content", status: "tracking" },
    { keyword: "تتبع ترتيب الكلمات المفتاحية", locale: "ar", searchVolume: 1800, difficulty: 28, intent: "commercial", currentRank: 22, previousRank: 18, bestRank: 16, worstRank: 35, url: "", status: "lost" },
    { keyword: "rembg python tutorial", locale: "en", searchVolume: 6500, difficulty: 45, intent: "informational", currentRank: 9, previousRank: 11, bestRank: 8, worstRank: 30, url: "https://sentinelbaran.io/rembg-guide", status: "tracking" },
    { keyword: "اختبار الاختراق للمبتدئين", locale: "ar", searchVolume: 3200, difficulty: 30, intent: "informational", currentRank: 4, previousRank: 6, bestRank: 3, worstRank: 20, url: "https://sentinelbaran.io/pentest-101", status: "tracking" },
    { keyword: "stable diffusion background generation", locale: "en", searchVolume: 9500, difficulty: 62, intent: "informational", currentRank: 28, previousRank: 30, bestRank: 22, worstRank: 45, url: "", status: "tracking" },
    { keyword: "حماية موقع ووردبريس", locale: "ar", searchVolume: 2100, difficulty: 38, intent: "informational", currentRank: 15, previousRank: 16, bestRank: 12, worstRank: 32, url: "https://sentinelbaran.io/wordpress", status: "tracking" },
    { keyword: "telegram bot python", locale: "en", searchVolume: 18500, difficulty: 72, intent: "informational", currentRank: 11, previousRank: 13, bestRank: 9, worstRank: 25, url: "https://sentinelbaran.io/tg-bot", status: "tracking" },
    { keyword: "supabase storage upload", locale: "en", searchVolume: 3800, difficulty: 40, intent: "informational", currentRank: 6, previousRank: 8, bestRank: 4, worstRank: 18, url: "https://sentinelbaran.io/supabase", status: "tracking" },
    { keyword: "تحسين محركات البحث 2026", locale: "ar", searchVolume: 5600, difficulty: 58, intent: "informational", currentRank: 24, previousRank: 27, bestRank: 20, worstRank: 50, url: "", status: "opportunity" },
    { keyword: "github actions cron schedule", locale: "en", searchVolume: 7200, difficulty: 48, intent: "informational", currentRank: 13, previousRank: 13, bestRank: 10, worstRank: 28, url: "https://sentinelbaran.io/actions-cron", status: "tracking" },
    { keyword: "نموذج gemini 1.5 flash", locale: "ar", searchVolume: 2900, difficulty: 33, intent: "informational", currentRank: 2, previousRank: 4, bestRank: 1, worstRank: 12, url: "https://sentinelbaran.io/gemini", status: "won" },
    { keyword: "استراتيجية تسويق المحتوى", locale: "ar", searchVolume: 4400, difficulty: 50, intent: "commercial", currentRank: 17, previousRank: 20, bestRank: 14, worstRank: 38, url: "", status: "tracking" },
    { keyword: "best free seo tools 2026", locale: "en", searchVolume: 11000, difficulty: 65, intent: "commercial", currentRank: 8, previousRank: 10, bestRank: 6, worstRank: 22, url: "https://sentinelbaran.io/seo-tools", status: "tracking" },
    { keyword: "فجوات المحتوى وتحليل المنافسين", locale: "ar", searchVolume: 1200, difficulty: 25, intent: "informational", currentRank: 1, previousRank: 3, bestRank: 1, worstRank: 8, url: "https://sentinelbaran.io/gap-analysis", status: "won" },
    { keyword: "vue vs react performance", locale: "en", searchVolume: 22000, difficulty: 78, intent: "informational", currentRank: 35, previousRank: 32, bestRank: 28, worstRank: 50, url: "", status: "lost" },
    { keyword: "إعادة إضاءة المنتجات للإعلانات", locale: "ar", searchVolume: 850, difficulty: 22, intent: "commercial", currentRank: 5, previousRank: 7, bestRank: 4, worstRank: 14, url: "https://sentinelbaran.io/relight", status: "tracking" },
    { keyword: "how to use semgrep ci", locale: "en", searchVolume: 2100, difficulty: 32, intent: "informational", currentRank: 12, previousRank: 14, bestRank: 10, worstRank: 25, url: "https://sentinelbaran.io/semgrep-ci", status: "tracking" },
  ];

  const keywordRecords = await Promise.all(
    keywords.map((k) => db.keyword.create({ data: k }))
  );

  // لقطات تاريخية للترتيب (آخر 14 يوم لكل كلمة)
  for (const kw of keywordRecords) {
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      // محاكاة تغير تدريجي نحو currentRank
      const progress = (13 - i) / 13;
      const current = Math.round(kw.previousRank + (kw.currentRank - kw.previousRank) * progress);
      // إضافة jitter
      const jitter = Math.floor((Math.random() - 0.5) * 2);
      const snapshotRank = Math.max(1, Math.min(50, current + jitter));
      await db.rankSnapshot.create({
        data: {
          keywordId: kw.id,
          rank: snapshotRank,
          competitorRank: Math.max(1, snapshotRank + Math.floor((Math.random() - 0.3) * 8)),
          capturedAt: d,
        },
      });
    }
  }

  // المنافسين
  const competitors = [
    { domain: "ahrefs.com", name: "Ahrefs", totalKeywords: 18, avgRank: 4.2, topKeywords: 14, estTraffic: 18500000, strengths: JSON.stringify({ backlinks: 1200000, contentLength: 2400, da: 88 }) },
    { domain: "semrush.com", name: "SEMrush", totalKeywords: 22, avgRank: 5.1, topKeywords: 16, estTraffic: 15200000, strengths: JSON.stringify({ backlinks: 950000, contentLength: 2200, da: 84 }) },
    { domain: "snyk.io", name: "Snyk", totalKeywords: 12, avgRank: 8.5, topKeywords: 8, estTraffic: 4200000, strengths: JSON.stringify({ backlinks: 320000, contentLength: 2800, da: 76 }) },
    { domain: "remove.bg", name: "Remove.bg", totalKeywords: 8, avgRank: 3.8, topKeywords: 6, estTraffic: 8900000, strengths: JSON.stringify({ backlinks: 145000, contentLength: 800, da: 71 }) },
    { domain: "vercel.com", name: "Vercel", totalKeywords: 15, avgRank: 6.4, topKeywords: 11, estTraffic: 12400000, strengths: JSON.stringify({ backlinks: 280000, contentLength: 1900, da: 81 }) },
    { domain: "medium.com", name: "Medium", totalKeywords: 25, avgRank: 12.3, topKeywords: 9, estTraffic: 28000000, strengths: JSON.stringify({ backlinks: 5200000, contentLength: 1500, da: 95 }) },
  ];
  await Promise.all(competitors.map((c) => db.competitor.create({ data: c })));

  // محتوى مُولَّد بواسطة AI
  const content = [
    {
      keywordId: keywordRecords[0].id,
      title: "الدليل الشامل للفحص الأمني التلقائي: كيف تحمي تطبيقك في 2026",
      slug: "automatic-security-scanning-guide-2026",
      contentType: "article",
      wordCount: 2400,
      metaTitle: "فحص أمني تلقائي: الدليل الكامل 2026 | Cyber-SentinelBaran",
      metaDesc: "تعلّم كيفية إعداد فحص أمني تلقائي لمشروعك باستخدام أدوات مجانية بالكامل: Semgrep، Nuclei، وNmap مع تحليل الذكاء الاصطناعي.",
      body: "# مقدمة\n\nفي عصر تتسارع فيه التهديدات السيبرانية، لم يعد الفحص الأمني الدوري اختياراً بل ضرورة...\n\n## لماذا الفحص التلقائي؟\n\n[محتوى كامل]",
      headings: JSON.stringify({ h1: ["الدليل الشامل للفحص الأمني التلقائي"], h2: ["لماذا الفحص التلقائي؟", "أدوات الفحص المجانية", "إعداد GitHub Actions", "تحليل النتائج بالذكاء الاصطناعي"], h3: ["Semgrep للكود", "Nuclei للويب", "Nmap للمنافذ"] }),
      suggestedTags: JSON.stringify(["security", "automation", "ci-cd", "owasp"]),
      seoScore: 92,
      readabilityScore: 78,
      status: "ready",
      estimatedTraffic: 1800,
    },
    {
      keywordId: keywordRecords[6].id,
      title: "اختبار الاختراق للمبتدئين: 7 خطوات لاختراق نظامك الخاص قانونياً",
      slug: "pentesting-for-beginners-7-steps",
      contentType: "article",
      wordCount: 1850,
      metaTitle: "اختبار اختراق للمبتدئين: 7 خطوات عملية 2026",
      metaDesc: "دليل عملي خطوة بخطوة لتعلّم اختبار الاختراق من الصفر على أنظمتك الخاصة بأمان قانوني.",
      body: "# اختبار الاختراق للمبتدئين\n\n## الخطوة 1: إعداد المختبر\n[محتوى]",
      headings: JSON.stringify({ h1: ["اختبار الاختراق للمبتدئين"], h2: ["إعداد المختبر", "أدوات أساسية", "خطوات الاختبار"] }),
      suggestedTags: JSON.stringify(["pentest", "beginners", "ethical-hacking"]),
      seoScore: 88,
      readabilityScore: 82,
      status: "ready",
      estimatedTraffic: 2400,
    },
    {
      keywordId: keywordRecords[13].id,
      title: "نموذج Gemini 1.5 Flash: الاستخدام العملي وتحليل الأداء",
      slug: "gemini-1-5-flash-guide",
      contentType: "article",
      wordCount: 2100,
      metaTitle: "نموذج Gemini 1.5 Flash: الدليل الكامل 2026",
      metaDesc: "كل ما تحتاج معرفته عن نموذج Gemini 1.5 Flash من Google — القدرات، التسعير، حالات الاستخدام، والكود العملي.",
      body: "# نموذج Gemini 1.5 Flash\n\n## مقدمة\n[محتوى كامل]",
      headings: JSON.stringify({ h1: ["نموذج Gemini 1.5 Flash"], h2: ["المقدمة", "المقارنة", "حالات الاستخدام", "الكود العملي"] }),
      suggestedTags: JSON.stringify(["gemini", "ai", "google", "llm"]),
      seoScore: 95,
      readabilityScore: 80,
      status: "published",
      estimatedTraffic: 3200,
    },
    {
      keywordId: keywordRecords[4].id,
      title: "تتبع ترتيب الكلمات المفتاحية: 5 استراتيجيات متقدمة لـ 2026",
      slug: "keyword-rank-tracking-strategies",
      contentType: "article",
      wordCount: 1650,
      metaTitle: "تتبع ترتيب الكلمات المفتاحية: 5 استراتيجيات 2026",
      metaDesc: "استراتيجيات متقدمة لتتبع ترتيب موقعك مقابل المنافسين وكشف الفرص الصاعدة.",
      body: "# تتبع ترتيب الكلمات المفتاحية\n[محتوى]",
      headings: JSON.stringify({ h1: ["تتبع ترتيب الكلمات المفتاحية"], h2: ["الأساسيات", "الاستراتيجيات", "الأدوات"] }),
      suggestedTags: JSON.stringify(["seo", "rank-tracking", "keywords"]),
      seoScore: 76,
      readabilityScore: 75,
      status: "draft",
      estimatedTraffic: 950,
    },
    {
      keywordId: keywordRecords[11].id,
      title: "تحسين محركات البحث 2026: 12 تحديثاً جديداً يجب معرفتها",
      slug: "seo-optimization-2026-updates",
      contentType: "article",
      wordCount: 2800,
      metaTitle: "تحسين محركات البحث 2026: التحديثات الكاملة",
      metaDesc: "آخر تحديثات خوارزميات Google في 2026 وكيف تتأقلم استراتيجية المحتوى الخاصة بك.",
      body: "# تحسين محركات البحث 2026\n[محتوى]",
      headings: JSON.stringify({ h1: ["تحسين محركات البحث 2026"], h2: ["تحديثات Google", "تأثير AI", "استراتيجيات"] }),
      suggestedTags: JSON.stringify(["seo", "google", "ai", "2026"]),
      seoScore: 90,
      readabilityScore: 76,
      status: "ready",
      estimatedTraffic: 4200,
    },
    {
      keywordId: keywordRecords[5].id,
      title: "rembg Python Tutorial: إزالة الخلفية بدقة احترافية",
      slug: "rembg-python-tutorial",
      contentType: "article",
      wordCount: 1900,
      metaTitle: "rembg Python Tutorial: الدليل الكامل 2026",
      metaDesc: "تعلّم استخدام مكتبة rembg في بايثون لإزالة خلفية الصور بدقة عالية مجاناً.",
      body: "# rembg Python Tutorial\n[محتوى]",
      headings: JSON.stringify({ h1: ["rembg Python Tutorial"], h2: ["التثبيت", "الاستخدام", "النماذج"] }),
      suggestedTags: JSON.stringify(["python", "rembg", "image-processing"]),
      seoScore: 86,
      readabilityScore: 84,
      status: "ready",
      estimatedTraffic: 1500,
    },
  ];
  await Promise.all(content.map((c) => db.generatedContent.create({ data: c })));

  // إحصائيات يومية لـ SEO (آخر 14 يوم)
  const seoNow = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(seoNow.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const top10 = Math.floor(8 + Math.random() * 5);
    const top1 = Math.floor(1 + Math.random() * 3);
    await db.seoDailyStat.create({
      data: {
        date: dayStart.toISOString().split("T")[0],
        keywordsTracked: 20,
        avgRank: Math.round((8 + Math.random() * 8) * 10) / 10,
        top10Count: top10,
        top1Count: top1,
        rankImprovements: Math.floor(Math.random() * 6),
        rankDrops: Math.floor(Math.random() * 4),
        contentGenerated: Math.floor(Math.random() * 3),
        competitorsAnalyzed: 6,
      },
    });
  }

  console.log(`[SEED] SEO-GhostBaran: ${keywords.length} كلمة مفتاحية`);
  console.log(`[SEED] SEO-GhostBaran: ${keywords.length * 14} لقطة تاريخية`);
  console.log(`[SEED] SEO-GhostBaran: ${competitors.length} منافس`);
  console.log(`[SEED] SEO-GhostBaran: ${content.length} مقال مُولَّد`);
  console.log("[SEED] SEO-GhostBaran: 14 يوم إحصائيات");

  // ============================================================
  // Data-Nexus ZeroBaran — بيانات تجريبية لمنظومة تحليل البيانات
  // ============================================================
  console.log("[SEED] بدء زرع بيانات Data-Nexus ZeroBaran...");

  // مصادر البيانات
  const datasets = [
    {
      name: "مبيعات Q4 2026",
      source: "csv",
      fileName: "sales_q4_2026.csv",
      rowCount: 18420,
      columnCount: 12,
      sizeBytes: 2400000,
      schema: JSON.stringify([
        { name: "order_id", type: "int" },
        { name: "customer_id", type: "int" },
        { name: "product", type: "string" },
        { name: "category", type: "string" },
        { name: "price", type: "float" },
        { name: "quantity", type: "int" },
        { name: "total", type: "float" },
        { name: "date", type: "datetime" },
        { name: "country", type: "string" },
        { name: "city", type: "string" },
        { name: "payment_method", type: "string" },
        { name: "discount", type: "float" },
      ]),
      qualityScore: 87,
      missingValues: 184,
      duplicates: 23,
      status: "analyzed",
      processedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    },
    {
      name: "بيانات العملاء (CRM)",
      source: "sql",
      fileName: "customers_export.sql",
      rowCount: 5420,
      columnCount: 18,
      sizeBytes: 1800000,
      schema: JSON.stringify([
        { name: "customer_id", type: "int" },
        { name: "name", type: "string" },
        { name: "email", type: "string" },
        { name: "phone", type: "string" },
        { name: "country", type: "string" },
        { name: "registration_date", type: "datetime" },
        { name: "last_purchase", type: "datetime" },
        { name: "total_orders", type: "int" },
        { name: "lifetime_value", type: "float" },
        { name: "segment", type: "string" },
      ]),
      qualityScore: 92,
      missingValues: 45,
      duplicates: 0,
      status: "cleaned",
      processedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    },
    {
      name: "API Shopify - المنتجات",
      source: "api",
      fileName: null,
      rowCount: 2870,
      columnCount: 8,
      sizeBytes: 950000,
      schema: JSON.stringify([
        { name: "product_id", type: "string" },
        { name: "title", type: "string" },
        { name: "vendor", type: "string" },
        { name: "price", type: "float" },
        { name: "inventory", type: "int" },
        { name: "created_at", type: "datetime" },
        { name: "tags", type: "string" },
        { name: "status", type: "string" },
      ]),
      qualityScore: 78,
      missingValues: 56,
      duplicates: 12,
      status: "analyzed",
      processedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      name: "زوار الموقع (Google Analytics)",
      source: "api",
      fileName: null,
      rowCount: 36500,
      columnCount: 10,
      sizeBytes: 4200000,
      schema: JSON.stringify([
        { name: "date", type: "datetime" },
        { name: "sessions", type: "int" },
        { name: "users", type: "int" },
        { name: "pageviews", type: "int" },
        { name: "bounce_rate", type: "float" },
        { name: "avg_session_duration", type: "float" },
        { name: "country", type: "string" },
        { name: "device", type: "string" },
        { name: "source", type: "string" },
        { name: "conversions", type: "int" },
      ]),
      qualityScore: 95,
      missingValues: 0,
      duplicates: 0,
      status: "analyzed",
      processedAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
    },
    {
      name: "حملات الإعلانات (Meta Ads)",
      source: "json",
      fileName: "meta_ads_export.json",
      rowCount: 1240,
      columnCount: 9,
      sizeBytes: 580000,
      schema: JSON.stringify([
        { name: "campaign_id", type: "string" },
        { name: "name", type: "string" },
        { name: "spend", type: "float" },
        { name: "impressions", type: "int" },
        { name: "clicks", type: "int" },
        { name: "conversions", type: "int" },
        { name: "cpc", type: "float" },
        { name: "ctr", type: "float" },
        { name: "roas", type: "float" },
      ]),
      qualityScore: 71,
      missingValues: 89,
      duplicates: 5,
      status: "cleaned",
      processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      name: "مخزون المستودعات",
      source: "csv",
      fileName: "inventory_warehouse.csv",
      rowCount: 8420,
      columnCount: 7,
      sizeBytes: 1200000,
      schema: JSON.stringify([
        { name: "sku", type: "string" },
        { name: "product_name", type: "string" },
        { name: "warehouse", type: "string" },
        { name: "quantity", type: "int" },
        { name: "last_updated", type: "datetime" },
        { name: "min_threshold", type: "int" },
        { name: "reorder_needed", type: "bool" },
      ]),
      qualityScore: 84,
      missingValues: 28,
      duplicates: 0,
      status: "analyzed",
      processedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
    {
      name: "مرتجعات الطلبات",
      source: "csv",
      fileName: "returns_2026.csv",
      rowCount: 980,
      columnCount: 6,
      sizeBytes: 320000,
      schema: JSON.stringify([
        { name: "return_id", type: "int" },
        { name: "order_id", type: "int" },
        { name: "reason", type: "string" },
        { name: "refund_amount", type: "float" },
        { name: "date", type: "datetime" },
        { name: "status", type: "string" },
      ]),
      qualityScore: 65,
      missingValues: 145,
      duplicates: 8,
      status: "raw",
    },
    {
      name: "تتبع الشحن (DHL API)",
      source: "api",
      fileName: null,
      rowCount: 15600,
      columnCount: 5,
      sizeBytes: 890000,
      schema: JSON.stringify([
        { name: "tracking_id", type: "string" },
        { name: "status", type: "string" },
        { name: "origin", type: "string" },
        { name: "destination", type: "string" },
        { name: "delivery_date", type: "datetime" },
      ]),
      qualityScore: 88,
      missingValues: 0,
      duplicates: 0,
      status: "processing",
    },
  ];

  const datasetRecords = await Promise.all(
    datasets.map((d) => db.dataset.create({ data: d }))
  );

  // عمليات ETL Pipeline لكل dataset
  const pipelineOps: Record<string, string[]> = {
    csv: ["drop_na", "dedupe", "type_cast", "normalize_dates", "validate_schema", "outlier_detection"],
    sql: ["type_cast", "normalize_strings", "validate_emails", "segment_customers"],
    api: ["dedupe", "flatten_nested", "validate_schema", "cache_response"],
    json: ["normalize_keys", "type_cast", "drop_na", "validate_schema"],
  };

  for (const ds of datasetRecords) {
    const ops = pipelineOps[ds.source] || ["drop_na", "dedupe", "type_cast"];
    if (ds.status === "analyzed" || ds.status === "cleaned") {
      await db.pipeline.create({
        data: {
          datasetId: ds.id,
          type: ds.status === "analyzed" ? "etl" : "clean",
          status: "completed",
          startedAt: new Date(ds.uploadedAt.getTime() + 1000 * 60),
          finishedAt: ds.processedAt,
          durationMs: Math.floor(Math.random() * 30000) + 5000,
          rowsAffected: ds.rowCount - ds.missingValues,
          operations: JSON.stringify(ops),
        },
      });
    } else if (ds.status === "processing") {
      await db.pipeline.create({
        data: {
          datasetId: ds.id,
          type: "etl",
          status: "running",
          startedAt: new Date(Date.now() - 1000 * 60 * 2),
        },
      });
    }
  }

  // رؤى AI المُستخرَجة
  const insights = [
    {
      datasetId: datasetRecords[0].id,
      type: "trend",
      title: "ارتفاع المبيعات بنسبة 24% في شهر أكتوبر",
      body: "تحليل بيانات المبيعات في Q4 2026 يُظهر ارتفاعاً ملحوظاً بنسبة 24% مقارنة بالربع السابق. الفئات الأكثر نمواً: الإلكترونيات (+38%)، الملابس (+19%). السبب الرئيسي: حملات Meta Ads في الكويت والإمارات حققت ROAS 4.2x.",
      confidence: 91,
      severity: "high",
      metric: "sales",
      actualValue: 18420,
      recommendation: "زيادة ميزانية حملات Meta Ads في الخليج بنسبة 30%، خصوصاً للمنتجات الإلكترونية.",
    },
    {
      datasetId: datasetRecords[0].id,
      type: "prediction",
      title: "توقع المبيعات لشهر نوفمبر: $420K (+18%)",
      body: "بناءً على نموذج ARIMA والبيانات التاريخية لآخر 6 أشهر، نتوقع مبيعات بقيمة $420K في نوفمبر 2026. الفاصل الزمني 95%: [$385K, $455K]. أعلى المبيعات متوقعة في أسبوع Black Friday.",
      confidence: 84,
      severity: "high",
      metric: "sales",
      predictedValue: 420000,
      recommendation: "تجهيز مخزون إضافي للإلكترونيات قبل 25 نوفمبر، والإعلان عن عروض Black Friday مبكراً.",
    },
    {
      datasetId: datasetRecords[1].id,
      type: "anomaly",
      title: "هجرة 142 عميل VIP في أسبوع واحد",
      body: "رصد النظام مغادرة 142 عميل من شريحة VIP خلال الأسبوع الماضي — أعلى بمقدار 3.2x من المتوسط الأسبوعي (44). 68% منهم من فئة العملاء الذين مضى على آخر شراء لهم 30-45 يوماً.",
      confidence: 96,
      severity: "critical",
      metric: "churn",
      actualValue: 142,
      recommendation: "إرسال عرض استرجاع فوري (خصم 25%) للعملاء غير النشطين 21-30 يوماً عبر واتساب + إيميل مخصّص.",
    },
    {
      datasetId: datasetRecords[3].id,
      type: "trend",
      title: "زيارة الموقع من الموبايل تجاوزت الديسكتوب لأول مرة",
      body: "في أكتوبر 2026، لأول مرة في تاريخ الموقع، تجاوزت زيارات الموبايل (62.4%) زيارات الديسكتوب (37.6%). معدل الارتداد على الموبايل أعلى بـ 18% مما يشير إلى مشكلة UX.",
      confidence: 88,
      severity: "medium",
      metric: "bounce_rate",
      recommendation: "تحسين سرعة تحميل الصفحات على الموبايل (Core Web Vitals)، وتبسيط عملية الـ checkout.",
    },
    {
      datasetId: datasetRecords[4].id,
      type: "recommendation",
      title: "حملة 'Summer Collection' تستهلك ميزانية بدون نتائج",
      body: "حملة 'Summer Collection' أنفقت $4,820 في 14 يوم، حققت 12 تحويل فقط (CPC=$3.20، ROAS=0.8x). مقارنة بحملة 'Winter Preview' (ROAS=4.5x)، هذه الحملة تستنزف الميزانية بلا عائد مجدٍ.",
      confidence: 93,
      severity: "high",
      metric: "roas",
      actualValue: 0.8,
      recommendation: "إيقاف حملة 'Summer Collection' فوراً وإعادة توجيه الميزانية لحملة 'Winter Preview' الناجحة.",
    },
    {
      datasetId: datasetRecords[5].id,
      type: "prediction",
      title: "نفاد مخزون 8 منتجات خلال 5-9 أيام",
      body: "بناءً على معدل البيع الحالي، 8 منتجات ستشهد نفاداً في المخزون خلال 5-9 أيام. 5 منها منتجات شعبية ستؤثر على المبيعات إن نفدت. التكلفة المتوقعة من خسارة المبيعات: $18,400.",
      confidence: 89,
      severity: "high",
      metric: "inventory",
      predictedValue: 8,
      recommendation: "إرسال أمر شراء عاجل للموردين لهذه المنتجات، وزيادة الـ reorder threshold من 20 إلى 35 وحدة.",
    },
    {
      datasetId: datasetRecords[0].id,
      type: "summary",
      title: "ملخص أسبوعي: الأداء العام جيد مع فرص تحسين",
      body: "الأسبوع الماضي حقق الموقع $94K مبيعات (+12% أسبوعياً)، 1,840 زائر جديد (+8%). فرص التحسين: (1) إيقاف حملة Summer، (2) استعادة عملاء VIP المفقودين، (3) تجديد مخزون 8 منتجات. التوصية الكبرى: ركّز على الإلكترونيات قبل Black Friday.",
      confidence: 86,
      severity: "info",
      recommendation: "تنفيذ التوصيات الثلاث أعلاه قبل نهاية الأسبوع لرفع المبيعات المتوقعة بنسبة 22%.",
    },
    {
      datasetId: datasetRecords[2].id,
      type: "trend",
      title: "42% من منتجات Shopify لم تُبَع قط في آخر 90 يوم",
      body: "تحليل 2,870 منتج من Shopify كشف أن 1,206 منتج (42%) لم تسجّل أي عملية بيع في آخر 90 يوماً. هذه تشكّل عبء تخزين ومخزون بدون عائد. متوسط قيمة هذه المنتجات: $42، إجمالي تكلفة المخزون: ~$50K.",
      confidence: 90,
      severity: "medium",
      metric: "inventory",
      recommendation: "تطبيق خصم 50-70% على المنتجات الراكدة، أو تجميعها في صفحة 'Clearance'، أو إيقاف توريد ما لا يبيع.",
    },
  ];

  await Promise.all(insights.map((i) => db.insight.create({ data: i })));

  // الشذوذ المكتشَف
  const anomalies = [
    { metric: "sales", value: 89200, expectedRange: JSON.stringify([45000, 60000]), severity: "high", description: "مبيعات الأحد 2026-10-25 تجاوزت المتوقع بـ 48% — راجع سبب الارتفاع المفاجئ", notified: true },
    { metric: "cost", value: 18500, expectedRange: JSON.stringify([8000, 12000]), severity: "critical", description: "تكلفة الإعلانات الأسبوعية ارتفعت 75% فوق المتوسط دون زيادة مقابلة في المبيعات", notified: true },
    { metric: "errors", value: 142, expectedRange: JSON.stringify([20, 50]), severity: "high", description: "أخطاء 500 في الـ API ارتفعت 3x — احتمال وجود مشكلة في خوادم الموقع", notified: false },
    { metric: "latency", value: 4200, expectedRange: JSON.stringify([800, 1500]), severity: "medium", description: "زمن استجابة الـ API ارتفع إلى 4.2 ثانية (المتوقع < 1.5s)", notified: false },
    { metric: "churn", value: 142, expectedRange: JSON.stringify([30, 50]), severity: "critical", description: "معدل مغادرة العملاء VIP أعلى 3.2x من المتوسط الأسبوعي", notified: true },
    { metric: "refund", value: 38000, expectedRange: JSON.stringify([8000, 15000]), severity: "high", description: "إجمالي المرتجعات ارتفع 250% — راجع جودة المنتجات الإلكترونية", notified: true },
    { metric: "signup", value: 28, expectedRange: JSON.stringify([150, 350]), severity: "medium", description: "تسجيلات جديدة هبطت 85% — احتمال مشكلة في صفحة التسجيل", notified: false },
  ];
  await Promise.all(
    anomalies.map((a) =>
      db.anomaly.create({
        data: { ...a, detectedAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000) },
      })
    )
  );

  // إحصائيات يومية لـ Data-Nexus (آخر 14 يوم)
  const dataNow = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(dataNow.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    await db.dataDailyStat.create({
      data: {
        date: dayStart.toISOString().split("T")[0],
        datasetsProcessed: Math.floor(Math.random() * 6) + 2,
        totalRows: Math.floor(Math.random() * 50000) + 10000,
        avgQualityScore: Math.floor(Math.random() * 15) + 80,
        insightsGenerated: Math.floor(Math.random() * 8) + 2,
        anomaliesDetected: Math.floor(Math.random() * 5),
        costSavedUsd: Math.floor(Math.random() * 200) + 50,
        avgPipelineMs: Math.floor(Math.random() * 25000) + 8000,
      },
    });
  }

  console.log(`[SEED] Data-Nexus: ${datasets.length} مصدر بيانات`);
  console.log(`[SEED] Data-Nexus: ${datasetRecords.length} pipeline`);
  console.log(`[SEED] Data-Nexus: ${insights.length} رؤية AI`);
  console.log(`[SEED] Data-Nexus: ${anomalies.length} شذوذ`);
  console.log("[SEED] Data-Nexus: 14 يوم إحصائيات");

  // ============================================================
  // Spatial-ZeroBaran — بيانات تجريبية لاستوديو المجسمات ثلاثية الأبعاد
  // ============================================================
  console.log("[SEED] بدء زرع بيانات Spatial-ZeroBaran...");

  // المجسمات ثلاثية الأبعاد المُولَّدة
  const assets = [
    {
      name: "كرسي خشبي بأسلوب فايكنج",
      prompt: "viking wooden chair, ornate carved details, dark oak texture, antique furniture",
      inputType: "text",
      inputUrl: null,
      modelSource: "TripoSR",
      format: "glb",
      fileSizeBytes: 2400000,
      polygonCount: 12400,
      originalPolyCount: 85000,
      textureRes: 1024,
      hasUVMap: true,
      hasTextures: true,
      category: "furniture",
      status: "ready",
      downloadUrl: "/assets/viking_chair.glb",
      previewGifUrl: "/assets/viking_chair_preview.gif",
      rating: 5,
      usedIn: "Unity",
      costSavedUsd: 120.0,
      processingMs: 8200,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      name: "سيارة كلاسيكية 1967",
      prompt: "vintage sports car 1967, red convertible, low-poly game ready",
      inputType: "image",
      inputUrl: "/uploads/car_photo.jpg",
      modelSource: "TripoSR",
      format: "glb",
      fileSizeBytes: 5800000,
      polygonCount: 24500,
      originalPolyCount: 180000,
      textureRes: 2048,
      hasUVMap: true,
      hasTextures: true,
      category: "vehicle",
      status: "ready",
      downloadUrl: "/assets/classic_car.glb",
      rating: 5,
      usedIn: "Unreal",
      costSavedUsd: 280.0,
      processingMs: 14800,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      name: "شخصية محارب خيالي",
      prompt: "fantasy warrior character, full armor, holding sword, game character",
      inputType: "text",
      inputUrl: null,
      modelSource: "Shap-E",
      format: "fbx",
      fileSizeBytes: 4200000,
      polygonCount: 18500,
      originalPolyCount: 95000,
      textureRes: 1024,
      hasUVMap: true,
      hasTextures: true,
      category: "character",
      status: "ready",
      downloadUrl: "/assets/fantasy_warrior.fbx",
      rating: 4,
      usedIn: "Unity",
      costSavedUsd: 350.0,
      processingMs: 12400,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    },
    {
      name: "نبتة ديكور داخلية",
      prompt: "indoor decorative plant in ceramic pot, monstera leaves",
      inputType: "image",
      inputUrl: "/uploads/plant_photo.jpg",
      modelSource: "TripoSR",
      format: "glb",
      fileSizeBytes: 1200000,
      polygonCount: 8200,
      originalPolyCount: 42000,
      textureRes: 1024,
      hasUVMap: true,
      hasTextures: true,
      category: "prop",
      status: "ready",
      downloadUrl: "/assets/decor_plant.glb",
      rating: 4,
      usedIn: "Blender",
      costSavedUsd: 65.0,
      processingMs: 6800,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      name: "مبنى قلعة عصور وسطى",
      prompt: "medieval castle building, stone walls, towers, game environment",
      inputType: "text",
      inputUrl: null,
      modelSource: "TripoSR",
      format: "glb",
      fileSizeBytes: 8500000,
      polygonCount: 38000,
      originalPolyCount: 250000,
      textureRes: 2048,
      hasUVMap: true,
      hasTextures: true,
      category: "environment",
      status: "ready",
      downloadUrl: "/assets/medieval_castle.glb",
      rating: 5,
      usedIn: "Unreal",
      costSavedUsd: 450.0,
      processingMs: 18200,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
    },
    {
      name: "سيف أسطوري",
      prompt: "legendary sword with glowing runes, fantasy weapon, ornate hilt",
      inputType: "text",
      inputUrl: null,
      modelSource: "Shap-E",
      format: "obj",
      fileSizeBytes: 850000,
      polygonCount: 4800,
      originalPolyCount: 28000,
      textureRes: 1024,
      hasUVMap: true,
      hasTextures: true,
      category: "prop",
      status: "ready",
      downloadUrl: "/assets/legendary_sword.obj",
      rating: 5,
      usedIn: "Unity",
      costSavedUsd: 95.0,
      processingMs: 5400,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      name: "تنين وحشي",
      prompt: "ferocious dragon, scaly skin, spread wings, fantasy creature",
      inputType: "text",
      inputUrl: null,
      modelSource: "TripoSR",
      format: "glb",
      fileSizeBytes: 9200000,
      polygonCount: 42500,
      originalPolyCount: 320000,
      textureRes: 2048,
      hasUVMap: true,
      hasTextures: true,
      category: "character",
      status: "processing",
      costSavedUsd: 0,
      processingMs: 0,
    },
    {
      name: "طاولة قهوة عصرية",
      prompt: "modern coffee table, glass top, minimalist design, marble base",
      inputType: "image",
      inputUrl: "/uploads/coffee_table.jpg",
      modelSource: "TripoSR",
      format: "glb",
      fileSizeBytes: 1800000,
      polygonCount: 6500,
      originalPolyCount: 38000,
      textureRes: 1024,
      hasUVMap: true,
      hasTextures: true,
      category: "furniture",
      status: "ready",
      downloadUrl: "/assets/modern_coffee_table.glb",
      rating: 4,
      usedIn: "Blender",
      costSavedUsd: 75.0,
      processingMs: 7200,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
    },
    {
      name: "صخرة بيئية",
      prompt: "rock formation for game environment, weathered stone, modular",
      inputType: "text",
      inputUrl: null,
      modelSource: "Shap-E",
      format: "glb",
      fileSizeBytes: 450000,
      polygonCount: 1200,
      originalPolyCount: 8500,
      textureRes: 512,
      hasUVMap: true,
      hasTextures: true,
      category: "environment",
      status: "ready",
      downloadUrl: "/assets/rock_formation.glb",
      rating: 3,
      usedIn: "Unity",
      costSavedUsd: 25.0,
      processingMs: 3200,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
    {
      name: "سفينة فضائية",
      prompt: "spaceship cruiser, sci-fi design, low-poly game ready, glowing engines",
      inputType: "text",
      inputUrl: null,
      modelSource: "TripoSR",
      format: "fbx",
      fileSizeBytes: 6800000,
      polygonCount: 28400,
      originalPolyCount: 195000,
      textureRes: 2048,
      hasUVMap: true,
      hasTextures: true,
      category: "vehicle",
      status: "ready",
      downloadUrl: "/assets/spaceship.fbx",
      rating: 5,
      usedIn: "Unreal",
      costSavedUsd: 320.0,
      processingMs: 16400,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 60),
    },
    {
      name: "تمثال يوناني قديم",
      prompt: "ancient greek marble statue, detailed sculpture, museum piece",
      inputType: "image",
      inputUrl: "/uploads/statue.jpg",
      modelSource: "TripoSR",
      format: "glb",
      fileSizeBytes: 3200000,
      polygonCount: 16800,
      originalPolyCount: 110000,
      textureRes: 1024,
      hasUVMap: true,
      hasTextures: true,
      category: "prop",
      status: "ready",
      downloadUrl: "/assets/greek_statue.glb",
      rating: 4,
      usedIn: "Blender",
      costSavedUsd: 140.0,
      processingMs: 9800,
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    },
    {
      name: "برميل متفجرات",
      prompt: "explosive barrel, video game prop, red with warning signs",
      inputType: "text",
      inputUrl: null,
      modelSource: "Shap-E",
      format: "glb",
      fileSizeBytes: 680000,
      polygonCount: 2400,
      originalPolyCount: 12000,
      textureRes: 512,
      hasUVMap: true,
      hasTextures: true,
      category: "prop",
      status: "failed",
      finishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      errorMessage: "HuggingFace Inference API timeout — سيتم إعادة المحاولة تلقائياً",
      costSavedUsd: 0,
    },
  ];

  const assetRecords = await Promise.all(
    assets.map((a) => db.asset3D.create({ data: a }))
  );

  // إصدارات المجسمات (قبل/بعد المعالجة) — للـ 6 المجسمات الأولى الجاهزة
  for (let i = 0; i < 6; i++) {
    const asset = assetRecords[i];
    // v1 - خام
    await db.assetVersion.create({
      data: {
        assetId: asset.id,
        version: 1,
        format: "obj",
        fileSizeBytes: asset.originalPolyCount * 32, // تقدير
        polygonCount: asset.originalPolyCount,
        processingType: "raw",
      },
    });
    // v2 - بعد تنظيف
    await db.assetVersion.create({
      data: {
        assetId: asset.id,
        version: 2,
        format: "obj",
        fileSizeBytes: Math.floor(asset.originalPolyCount * 18),
        polygonCount: Math.floor(asset.originalPolyCount * 0.7),
        processingType: "cleaned",
      },
    });
    // v3 - بعد Decimation
    await db.assetVersion.create({
      data: {
        assetId: asset.id,
        version: 3,
        format: asset.format,
        fileSizeBytes: asset.fileSizeBytes,
        polygonCount: asset.polygonCount,
        downloadUrl: asset.downloadUrl,
        processingType: "decimated",
      },
    });
  }

  // إحصائيات يومية لـ Spatial (آخر 14 يوم)
  const spatialNow = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(spatialNow.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const generated = Math.floor(Math.random() * 8) + 2;
    const polyReduced = generated * 85000 + Math.floor(Math.random() * 50000);
    const sizeSaved = generated * 4500000 + Math.floor(Math.random() * 2000000);
    await db.spatialDailyStat.create({
      data: {
        date: dayStart.toISOString().split("T")[0],
        assetsGenerated: generated,
        totalPolygonsReduced: polyReduced,
        totalSizeSavedBytes: sizeSaved,
        totalCostSavedUsd: generated * 145 + Math.floor(Math.random() * 200),
        avgGenerationMs: Math.floor(Math.random() * 8000) + 6000,
        avgDecimationRatio: Math.round((85 + Math.random() * 8) * 10) / 10,
        successRate: Math.floor(85 + Math.random() * 12),
      },
    });
  }

  console.log(`[SEED] Spatial: ${assets.length} مجسم ثلاثي الأبعاد`);
  console.log(`[SEED] Spatial: 18 إصدار (6 مجسمات × 3 إصدارات)`);
  console.log("[SEED] Spatial: 14 يوم إحصائيات");

  // ============================================================
  // Lead-Sniper ZeroBaran — بيانات تجريبية لمنظومة صيد العملاء
  // ============================================================
  console.log("[SEED] بدء زرع بيانات Lead-Sniper ZeroBaran...");

  // الحملات (Campaigns)
  const campaigns = [
    {
      name: "متاجر تجارية إلكترونية ناشئة - تحسين الأمان",
      description: "استهداف متاجر Shopify صغيرة بأقل من 100 منتج تحتاج تحسين أمان الويب",
      targetIndustry: "ecommerce",
      targetLocation: "AE, SA, EG",
      targetCompanySize: "small",
      serviceOffered: "تدقيق أمان موقع + تقرير OWASP Top 10",
      value: 800,
      totalLeads: 24,
      contacted: 18,
      replied: 6,
      won: 2,
      status: "active",
      crontab: "0 9 * * 1-5",
    },
    {
      name: "شركات SaaS تحتاج تحسين SEO",
      description: "شركات SaaS عربية تراكمت لديها محتوى لكنها لا تتصدر نتائج البحث",
      targetIndustry: "saas",
      targetLocation: "global",
      targetCompanySize: "medium",
      serviceOffered: "تحليل فجوات محتوى + توليد مقالات SEO",
      value: 1500,
      totalLeads: 32,
      contacted: 22,
      replied: 9,
      won: 3,
      status: "active",
      crontab: "0 10 * * 2,4",
    },
    {
      name: "وكالات إبداعية تبحث عن تحليل بيانات",
      description: "وكالات تصميم وتسويق تحتاج لوحات تحليل أداء لعملائها",
      targetIndustry: "agency",
      targetLocation: "GCC",
      targetCompanySize: "small",
      serviceOffered: "بناء لوحة تحكم تحليلية على بياناتهم",
      value: 2500,
      totalLeads: 18,
      contacted: 12,
      replied: 4,
      won: 1,
      status: "active",
      crontab: "0 11 * * 3",
    },
    {
      name: "مطورو ألعاب يحتاجون أصول 3D",
      description: "استوديوهات ألعاب صغيرة (Unity / Unreal) تبحث عن مجسمات رخيصة",
      targetIndustry: "gaming",
      targetLocation: "global",
      targetCompanySize: "small",
      serviceOffered: "توليد أصول 3D حسب الطلب (TripoSR + Blender)",
      value: 600,
      totalLeads: 28,
      contacted: 15,
      replied: 5,
      won: 0,
      status: "paused",
      crontab: "0 8 * * 1,3,5",
    },
    {
      name: "متاجر تحتاج إزالة خلفية لمنتجاتها",
      description: "متاجر تسعى لتحسين صور منتجاتها لإعلانات احترافية",
      targetIndustry: "retail",
      targetLocation: "TR, AE",
      targetCompanySize: "small",
      serviceOffered: "إزالة خلفية + إعادة إضاءة احترافية للمنتجات",
      value: 400,
      totalLeads: 42,
      contacted: 30,
      replied: 12,
      won: 5,
      status: "completed",
    },
  ];

  const campaignRecords = await Promise.all(
    campaigns.map((c) => db.campaign.create({ data: c }))
  );

  // العملاء المحتملون (Leads) — 22 عميل
  const leads = [
    { name: "Ahmed Al-Rashid", email: "ahmed@kshop.sa", company: "KShop", title: "Founder", website: "kshop.sa", industry: "ecommerce", location: "Riyadh, SA", source: "scraper", sourceUrl: "https://kshop.sa", signals: JSON.stringify(["no_https", "weak_product_pages", "outdated_theme"]), lastActivity: "أطلق متجر Shopify جديد", score: 88, status: "interested", stage: "qualified", companySize: "small", budget: "$500-1000", notes: "يحتاج فوراً تحديث الأمان قبل حملة Black Friday", lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
    { name: "Sara Mohammed", email: "sara@nawatone.ae", company: "NawaTone", title: "Marketing Director", website: "nawatone.ae", industry: "saas", location: "Dubai, AE", source: "scraper", sourceUrl: "https://nawatone.ae", signals: JSON.stringify(["recent_funding", "hiring_content_writer", "low_seo_traffic"]), lastActivity: "جمعت تمويل $500K Series A", score: 92, status: "won", stage: "closed", companySize: "medium", budget: "$1500-3000", convertedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), notes: "أغلقت صفقة تحسين SEO بقيمة $1800" },
    { name: "Mehmet Yılmaz", email: "mehmet@istanbul-retail.tr", company: "Istanbul Retail Group", title: "CEO", website: "istanbul-retail.tr", industry: "retail", location: "Istanbul, TR", source: "scraper", sourceUrl: "https://istanbul-retail.tr", signals: JSON.stringify(["no_product_photography", "weak_meta_tags"]), lastActivity: "أطلقت 50 منتج جديد", score: 75, status: "contacted", stage: "proposal", companySize: "small", budget: "$300-500", lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) },
    { name: "Layla Hassan", email: "layla@designhub.eg", company: "DesignHub Cairo", title: "Creative Director", website: "designhub.eg", industry: "agency", location: "Cairo, EG", source: "scraper", sourceUrl: "https://designhub.eg", signals: JSON.stringify(["needs_dashboards", "client_analytics_demand"]), lastActivity: "وقعت 3 عملاء جدد", score: 82, status: "interested", stage: "qualified", companySize: "small", budget: "$1500-2500", lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
    { name: "Yusuf Khalil", email: "yusuf@gamedev.io", company: "PixelForge Studios", title: "Lead Developer", website: "gamedev.io", industry: "gaming", location: "Remote", source: "scraper", sourceUrl: "https://gamedev.io", signals: JSON.stringify(["unity_indie", "tight_budget", "needs_assets"]), lastActivity: "أصدرت demo لأحدث لعبة", score: 68, status: "new", stage: "discovery", companySize: "small", budget: "$200-400" },
    { name: "Fatima Zahra", email: "fatima@modestfashion.com", company: "Modest Fashion", title: "Owner", website: "modestfashion.com", industry: "ecommerce", location: "Doha, QA", source: "scraper", sourceUrl: "https://modestfashion.com", signals: JSON.stringify(["weak_security", "old_checkout"]), lastActivity: "نشرت collection جديد", score: 80, status: "new", stage: "discovery", companySize: "small", budget: "$500-800" },
    { name: "Omar Saleh", email: "omar@cloudstartups.io", company: "CloudStartups", title: "Co-founder", website: "cloudstartups.io", industry: "saas", location: "Amman, JO", source: "scraper", sourceUrl: "https://cloudstartups.io", signals: JSON.stringify(["hiring", "low_blog_traffic"]), lastActivity: "أضافت ميزة جديدة قبل أسبوع", score: 85, status: "contacted", stage: "qualified", companySize: "medium", budget: "$1000-2000", lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4) },
    { name: "Khalid Al-Farsi", email: "khalid@kuwaitcloud.kw", company: "KuwaitCloud", title: "CTO", website: "kuwaitcloud.kw", industry: "saas", location: "Kuwait City, KW", source: "scraper", sourceUrl: "https://kuwaitcloud.kw", signals: JSON.stringify(["expanding", "needs_security_audit"]), lastActivity: "وسّعت فريقها 2x", score: 90, status: "interested", stage: "negotiation", companySize: "medium", budget: "$2000-3500", lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
    { name: "Nadia El-Amin", email: "nadia@beirutboutique.lb", company: "Beirut Boutique", title: "Owner", website: "beirutboutique.lb", industry: "retail", location: "Beirut, LB", source: "scraper", sourceUrl: "https://beirutboutique.lb", signals: JSON.stringify(["no_https", "no_brand_photography"]), lastActivity: "أطلقت متجر أونلاين", score: 72, status: "lost", stage: "discovery", companySize: "small", budget: "$200-400", notes: "أبدى اهتماماً لكن الميزانية لا تسمح حالياً" },
    { name: "Ali Sbeiti", email: "ali@studio3d.dev", company: "Studio3D", title: "Founder", website: "studio3d.dev", industry: "gaming", location: "Remote", source: "referral", sourceUrl: "", signals: JSON.stringify(["indie_unity", "wants_custom_assets"]), lastActivity: "نشر فيديو للأصول على Twitter", score: 78, status: "contacted", stage: "qualified", companySize: "small", budget: "$300-500", lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6) },
    { name: "Reem Haddad", email: "reem@ammanapps.jo", company: "AmmanApps", title: "Product Manager", website: "ammanapps.jo", industry: "saas", location: "Amman, JO", source: "scraper", sourceUrl: "https://ammanapps.jo", signals: JSON.stringify(["product_launch", "poor_seo_content"]), lastActivity: "أطلقت app جديد", score: 84, status: "new", stage: "discovery", companySize: "medium", budget: "$1500-2500" },
    { name: "Tariq Mansour", email: "tariq@cairodevs.eg", company: "CairoDevs", title: "CEO", website: "cairodevs.eg", industry: "saas", location: "Cairo, EG", source: "scraper", sourceUrl: "https://cairodevs.eg", signals: JSON.stringify(["hiring", "expanding_services", "needs_blog"]), lastActivity: "نشرت وظائف جديدة", score: 81, status: "new", stage: "discovery", companySize: "medium", budget: "$1000-2000" },
    { name: "Hind Al-Naimi", email: "hind@qatartech.qa", company: "QatarTech", title: "VP Engineering", website: "qatartech.qa", industry: "saas", location: "Doha, QA", source: "scraper", sourceUrl: "https://qatartech.qa", signals: JSON.stringify(["enterprise", "needs_security_compliance"]), lastActivity: "أعلنت عن برنامج compliance", score: 95, status: "interested", stage: "proposal", companySize: "enterprise", budget: "$5000-10000", lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) },
    { name: "Bilal Khoury", email: "bilal@lebanonbiz.lb", company: "LebanonBiz", title: "Owner", website: "lebanonbiz.lb", industry: "retail", location: "Beirut, LB", source: "scraper", sourceUrl: "https://lebanonbiz.lb", signals: JSON.stringify(["old_website", "no_analytics"]), lastActivity: "لا نشاط واضح", score: 58, status: "new", stage: "discovery", companySize: "small", budget: "$200-300" },
    { name: "Amira Tarek", email: "amira@egyptfashion.eg", company: "EgyptFashion", title: "Marketing Head", website: "egyptfashion.eg", industry: "ecommerce", location: "Cairo, EG", source: "scraper", sourceUrl: "https://egyptfashion.eg", signals: JSON.stringify(["weak_security", "needs_product_photos"]), lastActivity: "أطلقت seasonal sale", score: 76, status: "contacted", stage: "qualified", companySize: "small", budget: "$500-1000", lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8) },
    { name: "Karim Ben Ali", email: "karim@tunissoft.tn", company: "TunisSoft", title: "CTO", website: "tunissoft.tn", industry: "saas", location: "Tunis, TN", source: "scraper", sourceUrl: "https://tunissoft.tn", signals: JSON.stringify(["low_seo", "needs_content_strategy"]), lastActivity: "نشرت مقالات تقنية", score: 79, status: "interested", stage: "qualified", companySize: "small", budget: "$800-1500", lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
    { name: "Mona Saeed", email: "mona@saudicreatives.sa", company: "SaudiCreatives", title: "Founder", website: "saudicreatives.sa", industry: "agency", location: "Riyadh, SA", source: "scraper", sourceUrl: "https://saudicreatives.sa", signals: JSON.stringify(["wants_data_viz", "client_dashboard_demand"]), lastActivity: "وقعت 5 عملاء جدد", score: 87, status: "interested", stage: "proposal", companySize: "small", budget: "$2000-4000", lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4) },
    { name: "Issa Daher", email: "issa@joapps.jo", company: "JoApps", title: "Founder", website: "joapps.jo", industry: "saas", location: "Amman, JO", source: "scraper", sourceUrl: "https://joapps.jo", signals: JSON.stringify(["early_stage", "needs_full_seo"]), lastActivity: "أطلقت MVP", score: 73, status: "new", stage: "discovery", companySize: "small", budget: "$500-1000" },
    { name: "Rania Abu Ali", email: "rania@omanstyle.om", company: "OmanStyle", title: "Owner", website: "omanstyle.om", industry: "ecommerce", location: "Muscat, OM", source: "scraper", sourceUrl: "https://omanstyle.om", signals: JSON.stringify(["weak_security", "no_product_photos"]), lastActivity: "أضافت 30 منتج جديد", score: 71, status: "new", stage: "discovery", companySize: "small", budget: "$300-600" },
    { name: "Sultan Al-Otaibi", email: "sultan@bahraindev.bh", company: "BahrainDev", title: "Tech Lead", website: "bahraindev.bh", industry: "saas", location: "Manama, BH", source: "scraper", sourceUrl: "https://bahraindev.bh", signals: JSON.stringify(["rapid_growth", "needs_security_audits"]), lastActivity: "أضافت 1000 مستخدم جديد", score: 89, status: "contacted", stage: "negotiation", companySize: "medium", budget: "$2000-3000", lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
    { name: "Zainab Hossein", email: "zainab@irantelecom.ir", company: "IranTelecom", title: "Marketing VP", website: "irantelecom.ir", industry: "saas", location: "Tehran, IR", source: "scraper", sourceUrl: "https://irantelecom.ir", signals: JSON.stringify(["enterprise", "needs_brand_content"]), lastActivity: "أطلقت علامة جديدة", score: 86, status: "interested", stage: "qualified", companySize: "large", budget: "$3000-5000", lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6) },
    { name: "Mariam Fadel", email: "mariam@kuwaitelegant.kw", company: "KuwaitElegant", title: "Founder", website: "kuwaitelegant.kw", industry: "ecommerce", location: "Kuwait City, KW", source: "scraper", sourceUrl: "https://kuwaitelegant.kw", signals: JSON.stringify(["needs_security_audit", "wants_branding"]), lastActivity: "أطلقت متجر فاخر", score: 83, status: "won", stage: "closed", companySize: "small", budget: "$1000-2000", convertedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), notes: "صفقة بناء لوحة تحكم + أمان بقيمة $1800" },
  ];

  const leadRecords = await Promise.all(
    leads.map((l) => db.lead.create({ data: l }))
  );

  // رسائل التواصل المُولَّدة (Outreaches) — لكل عميل مراسل
  const outreachSamples = [
    {
      leadIdx: 0,
      channel: "email",
      type: "cold",
      subject: "تحسين أمان متجر KShop قبل Black Friday",
      body: `مرحباً أحمد،

لاحظت أن KShop تستخدم متجر Shopify جديداً، وهناك فرصة ذهبية لتعزيز أمان متجرك قبل موسم Black Friday.

استخدمت أداة فحص أمني سريعة (Semgrep + Nuclei) واكتشفت أن متجرك عرضة لـ 3 ثغرات OWASP Top 10. أُقدّم:
- تقرير أمان شامل (PDF)
- إصلاحات المقترحة (code جاهز)
- متابعة لمدة شهر

التكلفة: $600 — مدة التسليم: 3 أيام عمل

موعد التقييم المجاني؟

تحياتي،
Baran Avisat`,
      personalizationScore: 92,
      tone: "professional",
      status: "approved",
      approved: true,
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      costSavedUsd: 200,
    },
    {
      leadIdx: 1,
      channel: "email",
      type: "cold",
      subject: "تهانينا بتمويل NawaTone $500K — مقترح SEO",
      body: `مرحباً سارة،

هنيئاً لـ NawaTone بتمويل Series A بقيمة $500K! لاحظت أنكم تستهدفون السوق العربي لكن مدونتكم لا تتصدر نتائج البحث.

حلّلت 20 كلمة مفتاحية في مجالكم ووجدت:
- 12 كلمة بمنافسة ضعيفة (< 35 صعوبة)
- إمكانية جلب 14K زيارة شهرياً خلال 3 أشهر

خدمتي: تحليل فجوات محتوى + توليد 12 مقال SEO متصدّر (كتبت عينات منها).

التكلفة: $1800 — مدة التسليم: 30 يوم

موعد مكالمة 15 دقيقة؟

تحياتي،
Baran Avisat`,
      personalizationScore: 96,
      tone: "professional",
      status: "sent",
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
      repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      replyContent: "أهلاً بران، مهتم. أرسل لنا موعداً للمكالمة الخميس الساعة 2 مساءً.",
      costSavedUsd: 350,
    },
    {
      leadIdx: 2,
      channel: "linkedin",
      type: "cold",
      body: `مرحباً مهمد،

لاحظت أن Istanbul Retail Group أطلقت 50 منتج جديد — تهانينا!

صور المنتجات الحالية تبدو جيدة لكن يمكن تحسينها لإعلانات احترافية. أُقدّم:
- إزالة الخلفية + إعادة إضاءة
- 50 صورة خلال 24 ساعة
- جودة استوديو عالمي

التكلفة: $350 — عينة مجانية متاحة

متى يناسبك رؤية عينة؟

تحياتي،
Baran`,
      personalizationScore: 88,
      tone: "casual",
      status: "approved",
      approved: true,
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      costSavedUsd: 150,
    },
    {
      leadIdx: 3,
      channel: "email",
      type: "cold",
      body: `مرحباً ليلى،

سمعت أن DesignHub وقعت 3 عملاء جدد! مبارك.

إذا كان عملاؤك يطلبون لوحات تحكم تحليلية لبياناتهم (مثل مبيعات، حملات، أداء)، أُقدّم:
- لوحة تحكم تفاعلية مخصصة (Next.js)
- ربط بـ 4-5 مصادر بيانات (Pandas + AI insights)
- لوكبك العلامة التجارية لـ DesignHub

السعر: $2200 (مشروع كامل)

أرسل لك عرضاً مفصلاً؟

تحياتي،
Baran`,
      personalizationScore: 90,
      tone: "professional",
      status: "approved",
      approved: true,
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      costSavedUsd: 250,
    },
    {
      leadIdx: 7,
      channel: "email",
      type: "follow_up",
      subject: "Re: مقترح أمان KuwaitCloud",
      body: `مرحباً خالد،

تابعت توسّع KuwaitCloud مؤخراً — فريقكم ضاعف 2x في 6 أشهر!

أرفقت تقرير أمان سريع لـ kuwaitcloud.kw — اكتشفت 5 ثغرات. اقتراحي:
- تدقيق أمان شامل (OWASP Top 10 + pentest)
- تقرير + كود إصلاح
- شهادة compliance لمستثمريكم

$2500 — تسليم خلال أسبوع

متاح اليوم لمكالمة؟

تحياتي،
Baran`,
      personalizationScore: 93,
      tone: "professional",
      status: "approved",
      approved: true,
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      costSavedUsd: 400,
    },
    {
      leadIdx: 13,
      channel: "email",
      type: "cold",
      subject: "برنامج compliance لـ QatarTech",
      body: `مرحباً هند،

رأيت إعلان QatarTech عن برنامج compliance — خطوة ممتازة!

معظم برامج compliance تتطلب تدقيقاً أمنياً معتمداً. أُقدّم:
- فحص أمني شامل (Semgrep + Nuclei + Nmap)
- تقرير OWASP Top 10 (PDF احترافي)
- إصلاحات + إعادة فحص
- شهادة موقعة

$5000 — يغطي كل متطلبات SOC2 الأساسية

موعد مكالمة 30 دقيقة؟

تحياتي،
Baran Avisat`,
      personalizationScore: 95,
      tone: "formal",
      status: "approved",
      approved: true,
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      costSavedUsd: 600,
    },
    {
      leadIdx: 5,
      channel: "email",
      type: "cold",
      subject: "تحسين أمان Modest Fashion قبل الموسم",
      body: `مرحباً فاطمة،

رأيت collection الجديد من Modest Fashion — تشكيلة أنيقة!

لاحظت أن متجرك يستخدم checkout قديم وبعض الإعدادات تحتاج تحديثاً قبل موسم رمضان. أُقدّم:
- تدقيق أمان كامل (مجاني)
- تقرير بنقاط الضعف
- إصلاحات إن رغبت

الاستجابة خلال 24 ساعة

تحياتي،
Baran`,
      personalizationScore: 86,
      tone: "professional",
      status: "draft",
      costSavedUsd: 0,
    },
    {
      leadIdx: 11,
      channel: "linkedin",
      type: "cold",
      body: `مرحباً ريم،

لاحظت إطلاق AmmanApps الجديد — فكرة رائعة!

مدونتكم الحالية لا تستفيد من إمكانيات SEO. حلّلت 15 كلمة في مجالكم ووجدت فرصاً جيدة.

عندي نظام يولّد مقالات SEO متصدّرة تلقائياً. أرسل لك عينة على فكرة المنتج الجديد بدون مقابل؟

تحياتي،
Baran`,
      personalizationScore: 84,
      tone: "casual",
      status: "draft",
      costSavedUsd: 0,
    },
    {
      leadIdx: 16,
      channel: "email",
      type: "cold",
      subject: "لوحة تحكم لعملاء SaudiCreatives",
      body: `مرحباً منى،

عملاء SaudiCreatives من 5 عملاء جدد سيحتاجون لوحات تحكم قريباً!

أُقدّم شراكة:
- بناء لوحات تحكم لعملائك (مخصص لكل عميل)
- نسبة 30% لك من كل صفقة
- جودة احترافية، تسليم سريع

عرض تجريبي على أول عميل بدون مقابل؟

تحياتي،
Baran`,
      personalizationScore: 91,
      tone: "professional",
      status: "approved",
      approved: true,
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      costSavedUsd: 300,
    },
    {
      leadIdx: 19,
      channel: "email",
      type: "cold",
      subject: "BahrainDev وصل 1000 مستخدم — وقت الأمان",
      body: `مرحباً سلطان،

بمعدل نمو 1000 مستخدم جديد، BahrainDev تحتاج الآن تدقيقاً أمنياً احترافياً.

اكتشفت بفحص سريع:
- ثغرات OWASP في 3 endpoints
- مشاكل في إعدادات CORS
- ضعف في rate limiting

عرض:
- تدقيق أمني كامل: $2500
- تقرير + إصلاحات
- متابعة شهرية شهرين

متى يناسبك مكالمة؟

تحياتي،
Baran`,
      personalizationScore: 89,
      tone: "professional",
      status: "approved",
      approved: true,
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      costSavedUsd: 350,
    },
  ];

  for (const sample of outreachSamples) {
    const lead = leadRecords[sample.leadIdx];
    if (!lead) continue;
    await db.outreach.create({
      data: {
        leadId: lead.id,
        channel: sample.channel,
        type: sample.type,
        subject: sample.subject || null,
        body: sample.body,
        personalizationScore: sample.personalizationScore,
        tone: sample.tone,
        status: sample.status,
        sentAt: sample.sentAt || null,
        repliedAt: sample.repliedAt || null,
        replyContent: sample.replyContent || null,
        approved: sample.approved || false,
        approvedAt: sample.approvedAt || null,
        costSavedUsd: sample.costSavedUsd || 0,
      },
    });
  }

  // إحصائيات يومية لـ Lead-Sniper (آخر 14 يوم)
  const leadNow = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(leadNow.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const leadsDiscovered = Math.floor(Math.random() * 6) + 2;
    const outreachesGenerated = Math.floor(leadsDiscovered * 0.85);
    const approved = Math.floor(outreachesGenerated * 0.7);
    const sent = Math.floor(approved * 0.85);
    const replies = Math.floor(sent * 0.25);
    const won = Math.floor(replies * 0.18);
    await db.leadDailyStat.create({
      data: {
        date: dayStart.toISOString().split("T")[0],
        leadsDiscovered,
        outreachesGenerated,
        outreachesApproved: approved,
        outreachesSent: sent,
        repliesReceived: replies,
        dealsWon: won,
        totalRevenueUsd: won * 1500 + Math.floor(Math.random() * 1000),
        totalCostSavedUsd: approved * 280,
        avgReplyTimeHours: Math.floor(Math.random() * 72) + 6,
      },
    });
  }

  console.log(`[SEED] Lead-Sniper: ${campaigns.length} حملة صيد`);
  console.log(`[SEED] Lead-Sniper: ${leads.length} عميل محتمل`);
  console.log(`[SEED] Lead-Sniper: ${outreachSamples.length} رسالة تواصل مُولَّدة`);
  console.log("[SEED] Lead-Sniper: 14 يوم إحصائيات");

  // ============================================================
  // AIOps-ZeroBaran — بيانات تجريبية للمهندس الرقمي الذاتي
  // ============================================================
  console.log("[SEED] بدء زرع بيانات AIOps-ZeroBaran...");

  const services = [
    { name: "API Gateway", type: "https", url: "https://api.sentinelbaran.io/health", port: 443, interval: 30, timeout: 5, expectedCode: 200, currentStatus: "up", uptimePct: 99.97, lastCheckedAt: new Date(Date.now() - 1000 * 30), responseTimeMs: 142, region: "eu", priority: "critical" },
    { name: "Web Frontend", type: "https", url: "https://sentinelbaran.io", port: 443, interval: 60, timeout: 10, expectedCode: 200, currentStatus: "up", uptimePct: 99.95, lastCheckedAt: new Date(Date.now() - 1000 * 45), responseTimeMs: 89, region: "global", priority: "high" },
    { name: "PostgreSQL Primary", type: "database", url: "db.sentinelbaran.io", port: 5432, interval: 30, timeout: 5, currentStatus: "up", uptimePct: 99.99, lastCheckedAt: new Date(Date.now() - 1000 * 20), responseTimeMs: 8, region: "eu", priority: "critical" },
    { name: "Redis Cache", type: "redis", url: "cache.sentinelbaran.io", port: 6379, interval: 30, timeout: 3, currentStatus: "degraded", uptimePct: 98.82, lastCheckedAt: new Date(Date.now() - 1000 * 25), responseTimeMs: 340, region: "eu", priority: "high" },
    { name: "CDN (Cloudflare)", type: "https", url: "https://cdn.sentinelbaran.io", port: 443, interval: 60, timeout: 5, currentStatus: "up", uptimePct: 100.0, lastCheckedAt: new Date(Date.now() - 1000 * 50), responseTimeMs: 12, region: "global", priority: "high" },
    { name: "Worker Queue (Celery)", type: "tcp", url: "worker.sentinelbaran.io", port: 5555, interval: 30, timeout: 5, currentStatus: "down", uptimePct: 95.4, lastCheckedAt: new Date(Date.now() - 1000 * 60), responseTimeMs: 0, lastDownAt: new Date(Date.now() - 1000 * 60 * 3), region: "eu", priority: "critical" },
    { name: "Telegram Bot", type: "https", url: "https://bot.sentinelbaran.io/status", port: 443, interval: 60, timeout: 10, currentStatus: "up", uptimePct: 99.88, lastCheckedAt: new Date(Date.now() - 1000 * 40), responseTimeMs: 215, region: "global", priority: "normal" },
    { name: "Backup Storage (S3)", type: "https", url: "https://s3.backups.io/health", port: 443, interval: 120, timeout: 10, currentStatus: "up", uptimePct: 100.0, lastCheckedAt: new Date(Date.now() - 1000 * 90), responseTimeMs: 45, region: "us", priority: "normal" },
    { name: "Pixel-ZeroBaran Service", type: "https", url: "https://pixel.sentinelbaran.io/health", port: 443, interval: 60, timeout: 10, currentStatus: "up", uptimePct: 99.92, lastCheckedAt: new Date(Date.now() - 1000 * 55), responseTimeMs: 178, region: "global", priority: "high" },
    { name: "SEO-GhostBaran Cron", type: "https", url: "https://seo.sentinelbaran.io/ping", port: 443, interval: 120, timeout: 15, currentStatus: "up", uptimePct: 99.78, lastCheckedAt: new Date(Date.now() - 1000 * 100), responseTimeMs: 320, region: "global", priority: "normal" },
  ];

  const serviceRecords = await Promise.all(
    services.map((s) => db.monitoredService.create({ data: s }))
  );

  const incidentsData = [
    { serviceId: serviceRecords[5].id, severity: "critical", status: "open", type: "crash", title: "Worker Queue (Celery) تعطّل بالكامل", description: "توقّف Celery Worker عن الاستجابة. جميع مهام المعالجة في قائمة الانتظار علّقت.", logs: "[2026-10-30 02:14:32] ERROR: celery worker crashed with OOM\\n[2026-10-30 02:14:35] ERROR: Connection to Redis lost\\n[2026-10-30 02:14:40] CRITICAL: Worker process died (exit code 137)", rootCause: "نفاد الذاكرة (OOM) بسبب مهمة معالجة بيانات ضخمة (2.4M صف) استهلكت 16GB RAM بالكامل", startedAt: new Date(Date.now() - 1000 * 60 * 5), detectedAt: new Date(Date.now() - 1000 * 60 * 5), diagnosedAt: new Date(Date.now() - 1000 * 60 * 4), durationSec: 300, affectedUsers: 1240, costImpactUsd: 850 },
    { serviceId: serviceRecords[3].id, severity: "high", status: "resolved", type: "high_memory", title: "Redis Cache: استخدام ذاكرة 94%", description: "Redis Cache اقترب من حد الذاكرة. زمن الاستجابة ارتفع من 8ms إلى 340ms.", logs: "[2026-10-30 01:45:00] WARNING: Redis memory usage at 94%", rootCause: "تراكم بيانات الجلسات المنتهية في Redis بدون تنظيف تلقائي", startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), diagnosedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 30000), healedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 90000), resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 120000), durationSec: 120, affectedUsers: 540, costImpactUsd: 120 },
    { serviceId: serviceRecords[0].id, severity: "critical", status: "resolved", type: "error_rate", title: "API Gateway: معدل أخطاء 500 ارتفع إلى 12%", description: "بدأ API Gateway يرجع 500 على 12% من الطلبات.", logs: "[2026-10-29 14:22:00] ERROR: Connection pool exhausted\\n[2026-10-29 14:22:05] WARNING: Error rate 12%", rootCause: "Connection pool exhausting بسبب استعلامات بطيئة بدون timeout", startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), diagnosedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 15000), healedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 20000), resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 25000), durationSec: 1500, affectedUsers: 3200, costImpactUsd: 2400 },
    { serviceId: serviceRecords[1].id, severity: "medium", status: "resolved", type: "slow_response", title: "Web Frontend: زمن الاستجابة 3.2 ثانية", description: "زمن استجابة الموقع ارتفع من 89ms إلى 3200ms.", logs: "[2026-10-29 10:30:00] WARNING: Response time 3200ms", rootCause: "ارتفاع مفاجئ في الزيارات 5x بسبب حملة تسويقية", startedAt: new Date(Date.now() - 1000 * 60 * 60 * 28), detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 28), diagnosedAt: new Date(Date.now() - 1000 * 60 * 60 * 28 + 60000), healedAt: new Date(Date.now() - 1000 * 60 * 60 * 28 + 90000), resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 28 + 120000), durationSec: 7200, affectedUsers: 8500, costImpactUsd: 450 },
    { serviceId: serviceRecords[2].id, severity: "high", status: "resolved", type: "disk_full", title: "PostgreSQL: امتلاء القرص 94%", description: "قرص PostgreSQL امتلى بنسبة 94%. تبقّى 1.2GB فقط.", logs: "[2026-10-28 03:00:00] WARNING: Disk usage 94%", rootCause: "تراكم ملفات WAL (240 ملف = 15.4GB)", startedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), diagnosedAt: new Date(Date.now() - 1000 * 60 * 60 * 48 + 45000), healedAt: new Date(Date.now() - 1000 * 60 * 60 * 48 + 120000), resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 48 + 180000), durationSec: 10800, affectedUsers: 0, costImpactUsd: 0 },
    { serviceId: serviceRecords[8].id, severity: "low", status: "resolved", type: "timeout", title: "Pixel-ZeroBaran: بطء معالجة الصور", description: "زمن معالجة الصور ارتفع من 5s إلى 18s.", logs: "[2026-10-27 16:00:00] WARNING: Processing time 18s", rootCause: "HuggingFace API rate limit تجاوز (120 req/min)", startedAt: new Date(Date.now() - 1000 * 60 * 60 * 72), detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 72), diagnosedAt: new Date(Date.now() - 1000 * 60 * 60 * 72 + 30000), healedAt: new Date(Date.now() - 1000 * 60 * 60 * 72 + 60000), resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 72 + 90000), durationSec: 5400, affectedUsers: 45, costImpactUsd: 80 },
    { serviceId: serviceRecords[0].id, severity: "medium", status: "resolved", type: "high_cpu", title: "API Gateway: CPU 87% لمدة 10 دقائق", description: "استخدام CPU ارتفع إلى 87% بسبب backup يتزامن مع الذروة.", logs: "[2026-10-26 02:00:00] WARNING: CPU usage 87%", rootCause: "نسخ احتياطي مجدول في وقت الذروة (02:00 UTC بدلاً من 03:00)", startedAt: new Date(Date.now() - 1000 * 60 * 60 * 96), detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 96), diagnosedAt: new Date(Date.now() - 1000 * 60 * 60 * 96 + 20000), healedAt: new Date(Date.now() - 1000 * 60 * 60 * 96 + 30000), resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 96 + 60000), durationSec: 600, affectedUsers: 1200, costImpactUsd: 60 },
  ];

  const incidentRecords = await Promise.all(
    incidentsData.map((i) => db.incident.create({ data: i }))
  );

  const remediationsData = [
    { incidentId: incidentRecords[0].id, type: "kill_process", action: "kill -9 $(pgrep -f 'celery worker') && systemctl restart celery-worker", aiSuggested: true, aiReasoning: "AI حلّل سجلات OOM واكتشف أن عملية celery استهلكت 16GB RAM. القتل وإعادة التشغيل يحل المشكلة الفورية.", status: "executing", createdAt: new Date(Date.now() - 1000 * 60 * 3) },
    { incidentId: incidentRecords[0].id, type: "scale_up", action: "docker-compose up -d --scale worker=3", aiSuggested: true, aiReasoning: "AI يوصى بزيادة عدد workers من 1 إلى 3 لتفادي OOM مستقبلاً.", status: "pending" },
    { incidentId: incidentRecords[1].id, type: "clear_cache", action: "redis-cli FLUSHDB --async", aiSuggested: true, aiReasoning: "AI اكتشف أن 6.2GB من البيانات هي جلسات منتهية. FLUSHDB يحرّر الذاكرة دون توقف.", status: "success", executedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 90000), durationMs: 1200, output: "OK (memory freed: 6.2GB)", costSavedUsd: 500 },
    { incidentId: incidentRecords[2].id, type: "auto_restart", action: "systemctl restart gunicorn && pgbouncer -R", aiSuggested: true, aiReasoning: "AI حلّل أن connection pool exhausted. إعادة تشغيل Gunicorn + PgBouncer تعيد كل الاتصالات.", status: "success", executedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 20000), durationMs: 3400, output: "Error rate: 12% → 0.1% in 8s", costSavedUsd: 1500 },
    { incidentId: incidentRecords[3].id, type: "scale_up", action: "kubectl scale deployment frontend --replicas=5", aiSuggested: true, aiReasoning: "AI اكتشف traffic spike 5x. Scale up من 2 إلى 5 replicas يستوعب الزيادة.", status: "success", executedAt: new Date(Date.now() - 1000 * 60 * 60 * 28 + 90000), durationMs: 8500, output: "Response time: 3200ms → 120ms", costSavedUsd: 800 },
    { incidentId: incidentRecords[4].id, type: "clear_cache", action: "pg_archivecleanup /var/lib/postgresql/wal && VACUUM FULL", aiSuggested: true, aiReasoning: "AI اكتشف 240 WAL files (15.4GB). pg_archivecleanup يحذف الملفات المؤرشفة.", status: "success", executedAt: new Date(Date.now() - 1000 * 60 * 60 * 48 + 120000), durationMs: 45000, output: "Cleaned 238 WAL files (15.3GB freed). Disk: 94% → 38%", costSavedUsd: 1200 },
    { incidentId: incidentRecords[5].id, type: "custom", action: "Add rate limiter (60 req/min) + queue priority", aiSuggested: true, aiReasoning: "AI يوصى بإضافة rate limiter على HuggingFace API + أولوية للعملاء المدفوعين.", status: "success", executedAt: new Date(Date.now() - 1000 * 60 * 60 * 72 + 60000), durationMs: 3000, output: "Processing time: 18s → 6s", costSavedUsd: 200 },
    { incidentId: incidentRecords[6].id, type: "custom", action: "Reschedule pg_dump cron from 02:00 to 03:00 UTC", aiSuggested: true, aiReasoning: "AI اكتشف أن backup يعمل في وقت الذروة. إعادة جدولته لـ 03:00 UTC يحل المشكلة جذرياً.", status: "success", executedAt: new Date(Date.now() - 1000 * 60 * 60 * 96 + 30000), durationMs: 500, output: "Cron updated: 02:00 → 03:00 UTC", costSavedUsd: 100 },
  ];

  await Promise.all(remediationsData.map((r) => db.remediation.create({ data: r })));

  const aiopsNow = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(aiopsNow.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const incidentsDetected = Math.floor(Math.random() * 4) + 1;
    const incidentsResolved = Math.floor(incidentsDetected * (0.8 + Math.random() * 0.2));
    const autoHealed = Math.floor(incidentsResolved * (0.7 + Math.random() * 0.3));
    await db.aiopsDailyStat.create({
      data: {
        date: dayStart.toISOString().split("T")[0],
        totalChecks: Math.floor(Math.random() * 1200) + 800,
        incidentsDetected,
        incidentsResolved,
        autoHealed,
        avgUptimePct: Math.round((99.5 + Math.random() * 0.5) * 100) / 100,
        avgResponseMs: Math.floor(Math.random() * 200) + 50,
        totalDowntimeSec: Math.floor(Math.random() * 300),
        costSavedUsd: autoHealed * 450 + Math.floor(Math.random() * 200),
        costImpactUsd: incidentsDetected * 180 + Math.floor(Math.random() * 100),
      },
    });
  }

  console.log(`[SEED] AIOps: ${services.length} خدمة مراقَبة`);
  console.log(`[SEED] AIOps: ${incidentsData.length} حادثة`);
  console.log(`[SEED] AIOps: ${remediationsData.length} إجراء إصلاح (AI)`);
  console.log("[SEED] AIOps: 14 يوم إحصائيات");

  // ============================================================
  // Omni-Sales ZeroBaran — بيانات تجريبية للوكيل التجاري الذاتي
  // ============================================================
  console.log("[SEED] بدء زرع بيانات Omni-Sales ZeroBaran...");

  // قاعدة المعرفة (Knowledge Base - RAG)
  const kbItems = [
    { title: "Cyber-SentinelBaran - باقة الفحص الأساسي", category: "product", content: "باقة فحص أمني شامل: Semgrep + Nuclei + Nmap. تحليل AI للنتائج وتوليد كود الإصلاح. تنبيهات Telegram فورية. التكلفة: $600 شهرياً. مدة التسليم: 24 ساعة. يشمل: تقرير PDF، إصلاحات code، متابعة شهر.", tags: JSON.stringify(["security", "scan", "owasp"]), price: 600, currency: "USD", sku: "CSB-BASIC", stock: -1 },
    { title: "Pixel-ZeroBaran - باقة معالجة الصور", category: "product", content: "إزالة خلفية + إعادة إضاءة + دمج في خلفية تسويقية. 50 صورة شهرياً. تنسيقات PNG/JPG/WebP. جودة 4K. التكلفة: $400 شهرياً.", tags: JSON.stringify(["image", "rembg", "editing"]), price: 400, currency: "USD", sku: "PXB-50", stock: -1 },
    { title: "SEO-GhostBaran - باقة SEO المتكاملة", category: "service", content: "تتبع 50 كلمة مفتاحية + تحليل 10 منافسين + توليد 20 مقال SEO شهرياً + تقارير أسبوعية. التكلفة: $1200 شهرياً.", tags: JSON.stringify(["seo", "content", "keywords"]), price: 1200, currency: "USD", sku: "SEO-PRO", stock: -1 },
    { title: "Data-Nexus ZeroBaran - تحليل بيانات", category: "service", content: "ETL Pipeline + تحليل AI + كشف شذوذ + توصيات. دعم CSV/JSON/SQL/API. التكلفة: $800 شهرياً.", tags: JSON.stringify(["data", "etl", "analytics"]), price: 800, currency: "USD", sku: "DNX-MONTHLY", stock: -1 },
    { title: "Spatial-ZeroBaran - توليد مجسمات 3D", category: "product", content: "توليد مجسمات 3D من نص أو صورة. TripoSR + Shap-E + Blender. صيغ GLB/FBX/OBJ. 20 مجسم شهرياً. التكلفة: $500 شهرياً.", tags: JSON.stringify(["3d", "blender", "triposr"]), price: 500, currency: "USD", sku: "SPT-20", stock: -1 },
    { title: "AIOps-ZeroBaran - مراقبة الخوادم", category: "service", content: "مراقبة 24/7 + إصلاح ذاتي + تشخيص AI. حتى 20 خدمة. تنبيهات Telegram. تقارير يومية. التكلفة: $700 شهرياً.", tags: JSON.stringify(["monitoring", "self-healing", "devops"]), price: 700, currency: "USD", sku: "AIO-PRO", stock: -1 },
    { title: "Lead-Sniper ZeroBaran - صيد عملاء", category: "service", content: "صيد آلي + رسائل AI مخصصة + إدارة Pipeline. حتى 100 عميل شهرياً. التكلفة: $900 شهرياً.", tags: JSON.stringify(["leads", "outreach", "sales"]), price: 900, currency: "USD", sku: "LSN-100", stock: -1 },
    { title: "سؤال شائع: كيف أبدأ؟", category: "faq", content: "يمكنك البدأ بالاشتراك في أي باقة عبر إرسال كلمة 'اشتراك' في المحادثة. سنتواصل معك خلال 24 ساعة لإتمام التسجيل والدفع.", tags: JSON.stringify(["faq", "start", "subscribe"]) },
    { title: "سياسة الاسترجاع", category: "policy", content: "نضمن استرجاع كامل المبلغ خلال 14 يوم من الاشتراك إذا لم تكن راضياً. لا حاجة لتبرير.", tags: JSON.stringify(["policy", "refund"]) },
    { title: "طرق الدفع المتاحة", category: "pricing", content: "نقبل: بطاقات Visa/Mastercard عبر Stripe، تحويل بنكي (IBAN تركي/dولاري)، Bitcoin (BTC)، USDT (TRC20). للتفاصيل راسلنا: baranavisat@gmail.com", tags: JSON.stringify(["payment", "pricing", "iban"]) },
  ];
  await Promise.all(kbItems.map((kb) => db.knowledgeBase.create({ data: kb })));

  // المحادثات (Conversations)
  const conversations = [
    { channel: "telegram", customerName: "أحمد الراشد", customerEmail: "ahmed@example.com", customerPhone: "+966501234567", subject: "استفسار عن باقة الأمان", status: "active", intent: "sales", sentiment: "positive", satisfactionScore: 85, productInterest: "Cyber-SentinelBaran", leadScore: 88, totalMessages: 8, aiHandled: true, responseTimeMs: 1200, conversionValue: 600, converted: true, startedAt: new Date(Date.now() - 1000 * 60 * 30), lastMessageAt: new Date(Date.now() - 1000 * 60 * 5) },
    { channel: "whatsapp", customerName: "سارة محمد", customerEmail: "sara@example.com", customerPhone: "+971501234567", subject: "سعر باقة الصور", status: "active", intent: "pricing", sentiment: "positive", satisfactionScore: 90, productInterest: "Pixel-ZeroBaran", leadScore: 82, totalMessages: 6, aiHandled: true, responseTimeMs: 800, conversionValue: 0, startedAt: new Date(Date.now() - 1000 * 60 * 15), lastMessageAt: new Date(Date.now() - 1000 * 60 * 2) },
    { channel: "web", customerName: "Khalid Al-Farsi", customerEmail: "khalid@example.com", customerPhone: "+96598765432", subject: "مشكلة في الاشتراك", status: "waiting_human", intent: "complaint", sentiment: "negative", satisfactionScore: 35, productInterest: "SEO-GhostBaran", leadScore: 40, escalated: true, escalatedAt: new Date(Date.now() - 1000 * 60 * 10), totalMessages: 12, aiHandled: false, responseTimeMs: 0, startedAt: new Date(Date.now() - 1000 * 60 * 45), lastMessageAt: new Date(Date.now() - 1000 * 60 * 10) },
    { channel: "telegram", customerName: "Layla Hassan", customerEmail: "layla@example.com", customerPhone: "+20122345678", subject: "حجز موعد استشارة", status: "closed", intent: "booking", sentiment: "positive", satisfactionScore: 95, productInterest: "Data-Nexus ZeroBaran", leadScore: 90, totalMessages: 10, aiHandled: true, responseTimeMs: 950, conversionValue: 800, converted: true, closedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3) },
    { channel: "email", customerName: "Omar Saleh", customerEmail: "omar@example.com", customerPhone: "+96271234567", subject: "استفسار عن المجسمات 3D", status: "active", intent: "info", sentiment: "neutral", satisfactionScore: 70, productInterest: "Spatial-ZeroBaran", leadScore: 65, totalMessages: 4, aiHandled: true, responseTimeMs: 1500, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), lastMessageAt: new Date(Date.now() - 1000 * 60 * 30) },
    { channel: "whatsapp", customerName: "Mona Saeed", customerEmail: "mona@example.com", customerPhone: "+966551234567", subject: "سعر باقة صيد العملاء", status: "closed", intent: "sales", sentiment: "positive", satisfactionScore: 88, productInterest: "Lead-Sniper ZeroBaran", leadScore: 85, totalMessages: 14, aiHandled: true, responseTimeMs: 1100, conversionValue: 900, converted: true, closedAt: new Date(Date.now() - 1000 * 60 * 60 * 6), startedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 6) },
    { channel: "web", customerName: "Yusuf Khalil", customerEmail: "yusuf@example.com", subject: "كيف أبدأ مع الأمان السيبراني؟", status: "active", intent: "info", sentiment: "neutral", satisfactionScore: 75, productInterest: "Cyber-SentinelBaran", leadScore: 72, totalMessages: 5, aiHandled: true, responseTimeMs: 1300, startedAt: new Date(Date.now() - 1000 * 60 * 8), lastMessageAt: new Date(Date.now() - 1000 * 60 * 3) },
    { channel: "telegram", customerName: "Reem Haddad", customerEmail: "reem@example.com", customerPhone: "+96391234567", subject: "استفسار عن المراقبة", status: "closed", intent: "support", sentiment: "positive", satisfactionScore: 92, productInterest: "AIOps-ZeroBaran", leadScore: 78, totalMessages: 9, aiHandled: true, responseTimeMs: 1000, conversionValue: 700, converted: true, closedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), startedAt: new Date(Date.now() - 1000 * 60 * 60 * 14), lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 12) },
    { channel: "instagram", customerName: "Tariq Mansour", customerEmail: "tariq@example.com", subject: "هل تدعم اللغة العربية؟", status: "abandoned", intent: "info", sentiment: "neutral", satisfactionScore: 0, leadScore: 30, totalMessages: 2, aiHandled: true, responseTimeMs: 900, startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 23) },
    { channel: "telegram", customerName: "Hind Al-Naimi", customerEmail: "hind@example.com", customerPhone: "+97431234567", subject: "دفع عبر Bitcoin", status: "active", intent: "sales", sentiment: "positive", satisfactionScore: 87, productInterest: "SEO-GhostBaran", leadScore: 84, totalMessages: 7, aiHandled: true, responseTimeMs: 1100, conversionValue: 1200, converted: true, startedAt: new Date(Date.now() - 1000 * 60 * 20), lastMessageAt: new Date(Date.now() - 1000 * 60 * 1) },
  ];

  const conversationRecords = await Promise.all(
    conversations.map((c) => db.conversation.create({ data: c }))
  );

  // رسائل المحادثة (لأول 4 محادثات)
  const messageSets = [
    // Conversation 0: Ahmed - Cyber security sale
    [
      { role: "customer", content: "مرحباً، هل لديكم باقة فحص أمني؟", type: "text", aiModel: null, sentiment: "neutral", confidence: 0, tokens: 0 },
      { role: "agent", content: "أهلاً وسهلاً أحمد! 👋 نعم، لدينا باقة Cyber-SentinelBaran: فحص شامل بـ Semgrep + Nuclei + Nmap مع تحليل AI وتنبيهات Telegram فورية. التكلفة $600 شهرياً. هل تريد التفاصيل الكاملة؟", type: "text", aiModel: "gemini", sentiment: "positive", confidence: 95, tokens: 145, ragSources: JSON.stringify(["kb-0"]) },
      { role: "customer", content: "نعم، ماذا يشمل بالضبط؟", type: "text", aiModel: null, sentiment: "neutral", confidence: 0, tokens: 0 },
      { role: "agent", content: "تشمل الباقة:\n✅ فحص SAST للكود (Semgrep)\n✅ فحص DAST للويب (Nuclei)\n✅ مسح المنافذ (Nmap)\n✅ تحليل النتائج بـ Gemini AI\n✅ كود الإصلاح المقترح\n✅ تنبيهات Telegram فورية\n✅ تقرير PDF احترافي\n✅ متابعة شهرية\n\nمدة التسليم: 24 ساعة.", type: "text", aiModel: "gemini", sentiment: "positive", confidence: 93, tokens: 280, ragSources: JSON.stringify(["kb-0"]) },
      { role: "customer", content: "ممتاز! كيف أشترك؟", type: "text", aiModel: null, sentiment: "positive", confidence: 0, tokens: 0 },
      { role: "agent", content: "رائع! 🎉 للاشتراك:\n1️⃣ اختر طريقة الدفع (بطاقة، IBAN، BTC، USDT)\n2️⃣ أرسل $600\n3️⃣ ستفصل الباقة خلال 24 ساعة\n\nطرق الدفع: Visa/Mastercard عبر Stripe، IBAN تركي/dولاري، Bitcoin، USDT.\nأي طريقة تفضّل؟", type: "payment_link", aiModel: "gemini", sentiment: "positive", confidence: 91, tokens: 200, ragSources: JSON.stringify(["kb-0", "kb-9"]) },
      { role: "customer", content: "أريد الدفع عبر IBAN التركي", type: "text", aiModel: null, sentiment: "positive", confidence: 0, tokens: 0 },
      { role: "agent", content: "تمام! 🏦 تفاصيل IBAN التركي (TRY):\nالاسم: Baran Avisat\nIBAN: TR10 0001 0090 1008 4013 0050 01\n\nأرسل $600 ثم أرسل إيصال التحويل إلى baranavisat@gmail.com أو واتساب 00905313263722. سيتم تفعيل الباقة خلال 24 ساعة. ✅", type: "payment_link", aiModel: "gemini", sentiment: "positive", confidence: 96, tokens: 180, ragSources: JSON.stringify(["kb-9"]) },
    ],
    // Conversation 1: Sara - Pixel pricing
    [
      { role: "customer", content: "السلام عليكم، كم سعر معالجة الصور؟", type: "text", aiModel: null, sentiment: "neutral", confidence: 0, tokens: 0 },
      { role: "agent", content: "وعليكم السلام سارة! 🌟 لدينا باقة Pixel-ZeroBaran: $400 شهرياً لـ 50 صورة. تشمل إزالة الخلفية + إعادة الإضاءة + دمج في خلفية تسويقية. جودة 4K. تنسيقات PNG/JPG/WebP.", type: "text", aiModel: "gemini", sentiment: "positive", confidence: 94, tokens: 160, ragSources: JSON.stringify(["kb-1"]) },
      { role: "customer", content: "وهل يوجد تجربة مجانية؟", type: "text", aiModel: null, sentiment: "neutral", confidence: 0, tokens: 0 },
      { role: "agent", content: "نعم! ✨ نوفّر أول 5 صور مجاناً لتجربة الجودة. إذا كنت راضية، اشتركي في الباقة الكاملة ($400/شهر). كذلك نضمن استرجاع كامل المبلغ خلال 14 يوم إن لم تكوني راضية.", type: "text", aiModel: "gemini", sentiment: "positive", confidence: 92, tokens: 190, ragSources: JSON.stringify(["kb-1", "kb-8"]) },
      { role: "customer", content: "ممتاز، سأجرب!", type: "text", aiModel: null, sentiment: "positive", confidence: 0, tokens: 0 },
      { role: "agent", content: "رائع! 🎉 أرسلي لي صورك (حتى 5 صور) وسأعالجها لك مجاناً خلال دقائق. يمكنك إرسالها هنا مباشرة أو عبر واتساب 00905313263722.", type: "text", aiModel: "gemini", sentiment: "positive", confidence: 95, tokens: 120 },
    ],
    // Conversation 2: Khalid - Complaint (escalated)
    [
      { role: "customer", content: "الخدمة سيئة جداً! اشتركت في باقة SEO ولم أرَ أي نتائج!", type: "text", aiModel: null, sentiment: "negative", confidence: 0, tokens: 0 },
      { role: "agent", content: "أعتذر بشدة عن تجربتك خالد. 😔 هذا ليس مستوى الخدمة الذي نسعى له. دعني أساعدك فوراً. متى اشتركت في الباقة؟", type: "text", aiModel: "gemini", sentiment: "mixed", confidence: 88, tokens: 100 },
      { role: "customer", content: "منذ 3 أسابيع ولم أرَ أي تقرير!", type: "text", aiModel: null, sentiment: "negative", confidence: 0, tokens: 0 },
      { role: "agent", content: "أفهم إحباطك. هذا غير مقبول. سأحوّلك الآن لموظف بشري لمعالجة مشكلتك فوراً. 🔔 تم تنبيه فريق الدعم وسيتواصل معك خلال 5 دقائق.", type: "text", aiModel: "gemini", sentiment: "mixed", confidence: 85, tokens: 130 },
    ],
    // Conversation 3: Layla - Booking (converted)
    [
      { role: "customer", content: "مرحباً، أريد حجز استشارة لتحليل بيانات", type: "text", aiModel: null, sentiment: "neutral", confidence: 0, tokens: 0 },
      { role: "agent", content: "أهلاً ليلى! 📊 يسعدنا مساعدتك. لدينا باقة Data-Nexus ZeroBaran: ETL + تحليل AI + كشف شذوذ + توصيات. $800 شهرياً. هل تريدين استشارة مجانية 15 دقيقة أولاً؟", type: "text", aiModel: "gemini", sentiment: "positive", confidence: 93, tokens: 170, ragSources: JSON.stringify(["kb-3"]) },
      { role: "customer", content: "نعم، متى يمكنني الحجز؟", type: "text", aiModel: null, sentiment: "positive", confidence: 0, tokens: 0 },
      { role: "agent", content: "متاحة الأوقات التالية:\n📅 الإثنين 10:00 ص\n📅 الثلاثاء 2:00 م\n📅 الأربعاء 4:00 م\n\nأي موعد يناسبك؟", type: "booking", aiModel: "gemini", sentiment: "positive", confidence: 90, tokens: 140 },
      { role: "customer", content: "الثلاثاء 2:00 م", type: "text", aiModel: null, sentiment: "positive", confidence: 0, tokens: 0 },
      { role: "agent", content: "تم الحجز! ✅ الثلاثاء 2:00 م. سأرسل لك رابط Google Meet قبل الموعد بـ 15 دقيقة. هل لديك ملفات بيانات تودّين مشاركتها مسبقاً؟", type: "booking", aiModel: "gemini", sentiment: "positive", confidence: 96, tokens: 130 },
    ],
  ];

  for (let convIdx = 0; convIdx < Math.min(messageSets.length, conversationRecords.length); convIdx++) {
    const conv = conversationRecords[convIdx];
    for (const msg of messageSets[convIdx]) {
      await db.chatMessage.create({
        data: {
          conversationId: conv.id,
          role: msg.role,
          content: msg.content,
          type: msg.type,
          tokens: msg.tokens,
          aiModel: msg.aiModel,
          ragSources: msg.ragSources || null,
          sentiment: msg.sentiment,
          confidence: msg.confidence,
        },
      });
    }
  }

  // إحصائيات يومية للمبيعات (14 يوم)
  const salesNow = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(salesNow.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const totalConvos = Math.floor(Math.random() * 8) + 3;
    const aiHandled = Math.floor(totalConvos * (0.85 + Math.random() * 0.1));
    const escalated = totalConvos - aiHandled;
    const resolved = Math.floor(totalConvos * (0.7 + Math.random() * 0.15));
    const converted = Math.floor(resolved * (0.35 + Math.random() * 0.15));
    await db.salesDailyStat.create({
      data: {
        date: dayStart.toISOString().split("T")[0],
        totalConversations: totalConvos,
        aiHandled,
        humanEscalated: escalated,
        resolvedConvos: resolved,
        converted,
        totalRevenueUsd: converted * 750 + Math.floor(Math.random() * 500),
        avgSatisfaction: Math.round((75 + Math.random() * 20) * 10) / 10,
        avgResponseMs: Math.floor(Math.random() * 800) + 400,
        totalMessages: totalConvos * (6 + Math.floor(Math.random() * 8)),
        costSavedUsd: aiHandled * 35,
      },
    });
  }

  console.log(`[SEED] Omni-Sales: ${kbItems.length} عنصر في قاعدة المعرفة`);
  console.log(`[SEED] Omni-Sales: ${conversations.length} محادثة`);
  console.log(`[SEED] Omni-Sales: ${messageSets.reduce((s, m) => s + m.length, 0)} رسالة`);
  console.log("[SEED] Omni-Sales: 14 يوم إحصائيات");
}
seed()
  .catch((e) => {
    console.error("[SEED] فشل:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
