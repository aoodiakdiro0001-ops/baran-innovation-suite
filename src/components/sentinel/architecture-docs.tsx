"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  ScanLine,
  Brain,
  Database,
  Send,
  Workflow,
  Code2,
  ShieldCheck,
  Terminal,
  GitCommit,
} from "lucide-react";

const layers = [
  {
    icon: GitBranch,
    title: "1. طبقة الفحص والمسح (Scanning Layer)",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    tools: ["GitHub Actions", "Semgrep", "Nuclei", "Nmap", "Python"],
    description:
      "سكربت بايثون يدمج أدوات الفحص المفتوحة القوية. تُشغَّل تلقائياً مع كل push أو PR أو وفق جدول زمني عبر GitHub Actions. تفحص الأكواد البرمجية، الويب، والمنافذ بحثاً عن ثغرات OWASP Top 10.",
  },
  {
    icon: Brain,
    title: "2. العقل الذكي (AI Security Core)",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    tools: ["Gemini API", "Groq API", "z-ai-web-dev-sdk"],
    description:
      "يأخذ نتائج الفحص الخام من Semgrep/Nuclei، يحللها، يحدد درجة الخطورة بدقة (0-100)، ويكتب كود الإصلاح الآمن البديل تلقائياً. يشرح الثغرة بالعربية ويُولّد توصيات قابلة للتنفيذ.",
  },
  {
    icon: Database,
    title: "3. طبقة الأرشيف (Persistence Layer)",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    tools: ["Supabase", "PostgreSQL", "SQLite (dev)"],
    description:
      "قاعدة بيانات Supabase تُخزّن سجلات الفحص الأمني التاريخية، حالة كل ثغرة (مفتوحة، قيد المعالجة، مُصلَحة، متجاهلة)، ومقارنة الوضع الأمني عبر الزمن. تدعم CRUD كامل عبر REST API.",
  },
  {
    icon: Send,
    title: "4. طبقة التوصيل الفوري (Alerts Layer)",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    tools: ["Telegram Bot", "Webhook", "Email (SMTP)"],
    description:
      "يُرسل تنبيهاً فورياً على هاتفك فور اكتشاف أي ثغرة حرجة. التنبيه يتضمن: اسم الثغرة، درجة خطورتها، الملف والسطر، وكود الإصلاح المقترح جاهزاً للنسخ. تكامل مباشر مع Telegram Bot API.",
  },
];

const workflow = [
  { step: "الحدث", icon: GitCommit, text: "GitHub Actions يبدأ فحصاً مجدولاً أو يُطلق عبر push/PR" },
  { step: "الفحص", icon: ScanLine, text: "Semgrep + Nuclei + Nmap تفحص الكود والخوادم في ثوانٍ" },
  { step: "التحليل", icon: Brain, text: "Gemini يحلل، يصنّف، ويقترح كود الإصلاح الآمن" },
  { step: "الأرشفة", icon: Database, text: "يُحفظ التقرير في Supabase مع مقارنة تاريخية" },
  { step: "التنبيه", icon: Send, text: "تليجرام يُرسل التنبيه العاجل مع كود الإصلاح" },
];

export function ArchitectureDocs() {
  return (
    <div className="space-y-4">
      {/* Architecture Layers */}
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
                <p className="text-xs text-muted-foreground leading-relaxed">{layer.description}</p>
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

      {/* Workflow End-to-End */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Workflow className="h-4 w-4 text-cyan-500" />
            مسار العمل من البداية للنهاية (End-to-End)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative grid grid-cols-1 md:grid-cols-5 gap-3 pt-3">
            {workflow.map((w, idx) => {
              const Icon = w.icon;
              return (
                <div key={idx} className="relative">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="relative">
                      <div className="p-3 rounded-full bg-card border border-cyan-500/30">
                        <Icon className="h-5 w-5 text-cyan-500" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">{w.step}</Badge>
                    <p className="text-[11px] text-muted-foreground leading-snug">{w.text}</p>
                  </div>
                  {idx < workflow.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -left-2 transform -translate-y-1/2 text-cyan-500/40">
                      ←
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Free Tech Stack */}
      <Card className="border-emerald-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            الموارد المجانية البحتة المستخدمة (Free Tech Stack)
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
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">محرّك الجدولة</td>
                  <td className="py-2.5"><Badge variant="outline" className="font-mono text-[10px]">GitHub Actions</Badge></td>
                  <td className="py-2.5 text-muted-foreground">تشغيل الفحص المجدول مع كل push أو PR</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">محرّك الفحص</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Semgrep</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Nuclei</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Nmap</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">فحص الكود، الويب، والمنافذ بحثاً عن الثغرات</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">العقل الذكي</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Gemini API</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Groq API</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">تحليل الثغرات، تقييم الخطورة، توليد كود الإصلاح</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">قاعدة البيانات</td>
                  <td className="py-2.5"><Badge variant="outline" className="font-mono text-[10px]">Supabase (Free Tier)</Badge></td>
                  <td className="py-2.5 text-muted-foreground">تخزين السجلات التاريخية ومقارنة الوضع الأمني</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">قناة التنبيه</td>
                  <td className="py-2.5"><Badge variant="outline" className="font-mono text-[10px]">Telegram Bot API</Badge></td>
                  <td className="py-2.5 text-muted-foreground">تنبيه فوري عاجل على الهاتف مع تفاصيل الإصلاح</td>
                </tr>
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
          {[
            { cmd: "bun run scripts/seed.ts", desc: "إعادة زرع البيانات التجريبية" },
            { cmd: "python scripts/scanner.py --target=github.com/user/repo", desc: "تشغيل فحص كامل على مستودع" },
            { cmd: "python scripts/ai_analyzer.py --scan-id=latest", desc: "تحليل آخر فحص بواسطة AI" },
            { cmd: "python scripts/telegram_notifier.py --test", desc: "اختبار إرسال تنبيه Telegram" },
            { cmd: "gh workflow run security-scan.yml", desc: "إطلاق فحص عبر GitHub Actions" },
          ].map((c, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2 rounded-md bg-muted/20 border border-border">
              <Code2 className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <code className="text-xs font-mono text-cyan-600 dark:text-cyan-400 block" dir="ltr">
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
