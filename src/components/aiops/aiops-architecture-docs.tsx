"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Brain,
  Wrench,
  Send,
  Database,
  Workflow,
  Terminal,
  Server,
  Shield,
  Sparkles,
  Cloud,
  Zap,
  DollarSign,
} from "lucide-react";

const layers = [
  {
    icon: Activity,
    title: "1. طبقة المراقبة المستمرة (Uptime Monitoring)",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    tools: ["GitHub Actions", "Cloudflare Workers", "Cron"],
    description:
      "إرسال طلبات فحص (Ping / HTTP GET / TCP) كل بضع دقائق لكل الخدمات المسجّلة. إذا استجابت الخدمة بكود 200 OK ضمن المهلة، يستمر النظام في المراقبة الصامتة؛ وإذا ظهر كود خطأ (5xx) أو انتهت المهلة (timeout) تبدأ خطة الطوارئ تلقائياً.",
  },
  {
    icon: Brain,
    title: "2. طبقة التشخيص الذكي (AI Diagnosis)",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    tools: ["Gemini API", "Groq API", "Z.ai SDK"],
    description:
      "سحب آخر 100 سطر من سجل الأخطاء (Error Logs) وإرسالها إلى نموذج الذكاء الاصطناعي مع تعليمات تشخيصية: اقرأ السجلات، حدد المشكلة بدقة، واستخرج الأمر البرمجي اللازم لإعادة تشغيل الخدمة. يُرجع root_cause + suggested_action + confidence (0-100).",
  },
  {
    icon: Wrench,
    title: "3. طبقة الاستعادة الذاتية (Self-Healing)",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    tools: ["SSH", "systemd", "PM2", "Webhooks"],
    description:
      "تنفيذ إجراءات التصحيح التلقائي المبرمجة: إعادة تشغيل خادم Web (systemctl restart nginx)، تفريغ الذاكرة المؤقتة Redis (FLUSHDB)، إغلاق عملية مستهلكة للـ CPU (kill -9)، أو توجيه الحركة لخادم احتياطي (failover). كل إجراء يُسجّل بالكامل.",
  },
  {
    icon: Send,
    title: "4. طبقة التقارير والتنبيه (Reporting & Alerts)",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    tools: ["Telegram Bot", "Supabase", "Web Dashboard"],
    description:
      "تسجيل الحادثة في Supabase (للحفظ والاسترجاع) وإرسال إشعار فوري على هاتفك عبر تليجرام: ⚠️ تنبيه حادثة + 🛠️ الإجراء المتخذ + ✅ الحالة. يمكنك تنفيذ أوامر إصلاح يدوي عبر أزرار تليجرام.",
  },
];

const workflow = [
  { step: "الرصد", icon: Activity, text: "GitHub Actions يفحص الخوادم كل 5 دقائق" },
  { step: "الكشف", icon: Server, text: "عند خطأ 500/502 أو timeout → ابدأ خطة الطوارئ" },
  { step: "السجلات", icon: Terminal, text: "سحب آخر 100 سطر من error logs" },
  { step: "التحليل", icon: Brain, text: "Gemini يحلل السجلات ويحدد السبب الجذري" },
  { step: "الإصلاح", icon: Wrench, text: "تنفيذ أوامر الإصلاح آلياً (auto-remediation)" },
  { step: "التنبيه", icon: Send, text: "تقرير كامل يُرسل لتليجرام ويُحفظ في Supabase" },
];

const techStack = [
  {
    comp: "محرّك الرصد",
    tech: ["GitHub Actions", "Cloudflare Workers", "Cron"],
    role: "فحص دوري لصحة الخوادم والـ APIs (HTTP / TCP / ICMP)",
  },
  {
    comp: "العقل التشخيصي",
    tech: ["Gemini API", "Groq API", "Z.ai SDK"],
    role: "تحليل السجلات، اكتشاف السبب الجذري، توليد أوامر الإصلاح",
  },
  {
    comp: "محرّك التنفيذ الذاتي",
    tech: ["SSH", "systemd", "PM2", "Docker"],
    role: "تنفيذ أوامر الإصلاح (restart / kill / failover) بأمان",
  },
  {
    comp: "قاعدة البيانات",
    tech: ["Supabase", "Turso", "SQLite"],
    role: "سجلات Uptime، الأعطال، والإجراءات المتخذة + التقارير اليومية",
  },
  {
    comp: "التنبيهات والأوامر",
    tech: ["Telegram Bot", "Web Dashboard"],
    role: "تقارير الحوادث الفورية + أوامر إصلاح يدوية عبر الأزرار",
  },
];

const commands = [
  {
    cmd: "python scanner/aiops/health_monitor.py --url=https://api.sentinelbaran.io/health --timeout=10 --expected-code=200 --interval=60",
    desc: "مراقبة خادم كل 60 ثانية بكود 200 متوقع",
  },
  {
    cmd: "python scanner/aiops/ai_diagnostic.py --logs=error.log --incident-type=high_cpu",
    desc: "تشخيص AI لسجلات الأخطاء وتحديد السبب الجذري",
  },
  {
    cmd: "python scanner/aiops/auto_remediation.py --incident-id=INC-014 --action=restart_service",
    desc: "تنفيذ إصلاح ذاتي (إعادة تشغيل) على حادثة معينة",
  },
  {
    cmd: "python scanner/aiops/telegram_alerts.py --incident-id=INC-014 --report=full",
    desc: "إرسال تقرير حادثة كامل لتليجرام",
  },
  {
    cmd: "gh workflow run aiops-monitoring.yml -f check_all=true -f auto_heal=true",
    desc: "إطلاق دورة AIOps الشاملة عبر GitHub Actions",
  },
];

export function AiopsArchitectureDocs() {
  return (
    <div className="space-y-4">
      {/* Intro Card */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-background to-cyan-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            ما هو AIOps-ZeroBaran؟
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">AIOps-ZeroBaran</strong> هو نظام ذكي متكامل ومستقل لمراقبة صحة الخوادم،
            اكتشاف الأعطال، وإصلاحها ذاتياً (Self-Healing Operations). يقوم بمراقبة خوادمك ومواقعك على مدار الساعة،
            وعند حدوث أي انقطاع أو ارتفاع مفاجئ في استهلاك الموارد أو ظهور أخطاء برمجية، لا يكتفي بإرسال تنبيه،
            بل يقوم آلياً بتشخيص السبب الجذري (Root Cause Analysis)، وتنفيذ أوامر الإصلاح التلقائي (مثل إعادة تشغيل
            الخدمات المنهارة أو تنظيف الذاكرة)، مع إرسال تقرير تشخيصي شامل — دون دفع دولار واحد لأي منصة مراقبة
            مدفوعة، وبموارد مجانية بالكامل.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-xs font-semibold mb-1 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                توفير مالي فلكي
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                أدوات إدارة الخوادم (Datadog $15/host/mo، New Relic $99/mo) تكلف مبالغ طائلة؛ هذا النظام يؤدي نفس الغرض بتكلفة صفر.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
              <div className="text-xs font-semibold mb-1 text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" />
                استجابة فورية
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                يتصرّف فور حدوث الخلل لإعادة الموقع أو الخدمة للعمل قبل أن يلاحظ العملاء أي انقطاع. MTTR من 15-120 ثانية.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5">
              <div className="text-xs font-semibold mb-1 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <Cloud className="h-3.5 w-3.5" />
                مهندس سحابي 24/7
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                يمنحك مهندس سحابي (Cloud Engineer) يعمل على مدار 24 ساعة دون أي مصاريف تشغيلية. يقلل الاعتماد على العنصر البشري.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {layers.map((layer, idx) => {
          const Icon = layer.icon;
          return (
            <Card key={idx} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${layer.bg}`}>
                    <Icon className={`h-4 w-4 ${layer.color}`} />
                  </div>
                  {layer.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {layer.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {layer.tools.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px] font-mono">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Workflow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Workflow className="h-4 w-4 text-blue-500" />
            مسار العمل من البداية للنهاية (End-to-End Workflow)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3">
            {workflow.map((w, idx) => {
              const Icon = w.icon;
              return (
                <div key={idx} className="relative">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="relative">
                      <div className="p-3 rounded-full bg-card border border-blue-500/30">
                        <Icon className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">{w.step}</Badge>
                    <p className="text-[11px] text-muted-foreground leading-snug">{w.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Free Tech Stack Table */}
      <Card className="border-emerald-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            الموارد المجانية البحتة (Free Tech Stack)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground border-b">
                <tr>
                  <th className="text-right py-2 font-medium">المكوّن</th>
                  <th className="text-right py-2 font-medium">التقنية المجانية</th>
                  <th className="text-right py-2 font-medium">الدور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {techStack.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/30">
                    <td className="py-2.5">{row.comp}</td>
                    <td className="py-2.5">
                      {row.tech.map((t) => (
                        <Badge key={t} variant="outline" className="font-mono text-[10px] ml-1">
                          {t}
                        </Badge>
                      ))}
                    </td>
                    <td className="py-2.5 text-muted-foreground">{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Commands */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Terminal className="h-4 w-4 text-orange-500" />
            أوامر التشغيل السريعة
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {commands.map((c, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-2 rounded-md bg-muted/20 border border-border"
            >
              <Server className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <code
                  className="text-xs font-mono text-blue-600 dark:text-blue-400 block"
                  dir="ltr"
                >
                  $ {c.cmd}
                </code>
                <p className="text-[10px] text-muted-foreground mt-1">{c.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
