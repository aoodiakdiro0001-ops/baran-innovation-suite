"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Brain,
  Database,
  Send,
  Workflow,
  Terminal,
  Users,
  Sparkles,
} from "lucide-react";

const layers = [
  {
    icon: Target,
    title: "1. طبقة التنقيب والبحث (Discovery & Scraping)",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    tools: ["Python", "BeautifulSoup", "Playwright", "GitHub Actions"],
    description:
      "سكريبت بايثون يعمل داخل GitHub Actions. يبحث تلقائياً عن الشركات أو الأفراد المطابقين لمعاييرك (الصناعة، الموقع، حجم الشركة). يستخرج أسماءهم، مواقعهم، بريدهم الإلكتروني المتاح علناً، وآخر نشاط لهم.",
  },
  {
    icon: Brain,
    title: "2. العقل الذكي والتخصيص (AI Personalization)",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    tools: ["Gemini API", "Groq API", "Z.ai SDK"],
    description:
      "يأخذ بيانات العميل (آخر نشاط، صناعة، إشارات فرصة) ويُدخلها لـ Gemini مع توجيه دقيق: \"اكتب رسالة تواصل قصيرة واحترافية تعرض عليه حلاً لمشكلته بطريقة لا تُقاوم\". يخرج بنسبة تخصيص 85-95%.",
  },
  {
    icon: Database,
    title: "3. طبقة خط المبيعات والذاكرة (Pipeline Persistence)",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    tools: ["Supabase", "PostgreSQL"],
    description:
      "جدول منظّم في Supabase يحفظ حالة كل عميل (جديد، تمت مراسلته، مهتم، عميل حالي، فقد) لتمكين تتبع مسار المبيعات بوضوح تام. تشمل المراحل: discovery → qualified → proposal → negotiation → closed.",
  },
  {
    icon: Send,
    title: "4. طبقة التنبيه والتسليم (Delivery & Action)",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    tools: ["Telegram Bot", "Vercel Dashboard"],
    description:
      "يأتيك إشعار فوري على هاتفك عبر تليجرام: \"🎯 صيد جديد: تم العثور على عميل محتمل\". يعرض الرسالة المقترحة المخصصة مع زرّين: \"إرسال فوري\" و \"تعديل\". يمكنك الموافقة أو الرفض بضغطة واحدة.",
  },
];

const workflow = [
  { step: "التحديد", icon: Target, text: "تحدد معايير العميل (الصناعة، الموقع، الخدمة)" },
  { step: "البحث", icon: Users, text: "GitHub Actions يبحث تلقائياً عن عملاء مطابقين" },
  { step: "التحليل", icon: Brain, text: "AI يحلل بيانات كل عميل وآخر نشاطه" },
  { step: "التخصيص", icon: Sparkles, text: "Gemini يكتب رسالة مخصصة لكل عميل" },
  { step: "الموافقة", icon: Send, text: "تأتيك الرسالة على تليجرام للاعتماد" },
  { step: "الإرسال", icon: Workflow, text: "تُرسل الرسالة أو تُعدّلها قبل الإرسال" },
];

export function LeadArchitectureDocs() {
  return (
    <div className="space-y-4">
      <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-background to-purple-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-rose-500" />
            ما هو Lead-Sniper ZeroBaran؟
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Lead-Sniper ZeroBaran</strong> هو نظام ذكي متكامل
            لاكتشاف العملاء المحتملين، جمع بياناتهم، صياغة رسائل تواصل مخصصة للغاية بناءً على نشاطهم،
            وإدارة خط المبيعات (Sales Pipeline). يقوم بالبحث عن الشركات أو الأفراد المستهدفين وفق معاييرك،
            تحليل خلفيتهم ومشاريعهم الأخيرة، كتابة رسالة تواصل باردة (Cold Outreach) شديدة الاحترافية والتخصيص،
            وإرسالها أو تنبيهك بها في الوقت المثالي — دون دفع دولار واحد لأي منصة مدفوعة، وبموارد مجانية بالكامل.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-xs font-semibold mb-1 text-emerald-600 dark:text-emerald-400">💰 توفير مال فلكي</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                أدوات البحث عن العملاء (Apollo $99/مستخدم/شهر، Outreach.io $130/مستخدم/شهر) تكلف مبالغ باهظة؛ هذا النظام يؤدي نفس الغرض بتكلفة صفر.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5">
              <div className="text-xs font-semibold mb-1 text-purple-600 dark:text-purple-400">🎯 تخصيص فائق</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                بدلاً من إرسال رسائل عشوائية مملة، يستخدم AI لقراءة نشاط العميل المستهدف وكتابة رسالة تخاطبه شخصياً، مما يرفع نسبة الاستجابة (Reply Rate) بشكل جنوني.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
              <div className="text-xs font-semibold mb-1 text-cyan-600 dark:text-cyan-400">🔒 السيادة والتحكم التام</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                قاعدة بيانات عملائك وسجلات التواصل تبقى تحت سيطرتك المطلقة دون بيعها أو مشاركتها مع أي شركات تسويق خارجية.
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

      {/* Workflow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Workflow className="h-4 w-4 text-rose-500" />
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
                      <div className="p-3 rounded-full bg-card border border-rose-500/30">
                        <Icon className="h-5 w-5 text-rose-500" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
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

      {/* Free Tech Stack */}
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
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">محرّك البحث والجمع</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">BeautifulSoup</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Playwright</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Actions</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">زيارة منصات العمل الحر ومواقع الشركات لجمع بيانات العملاء</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">العقل التحليلي</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Gemini API</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Groq API</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">تحليل بيانات العميل وصياغة رسالة تواصل فريدة وشديدة الجاذبية</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">قاعدة البيانات (Pipeline)</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Supabase</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">PostgreSQL</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">تخزين العملاء، حالة التواصل، وسجلات الحملات</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">محرّك الجدولة</td>
                  <td className="py-2.5"><Badge variant="outline" className="font-mono text-[10px]">GitHub Actions</Badge></td>
                  <td className="py-2.5 text-muted-foreground">تنفيذ البحث والتنقيب وإرسال الحملات في أوقات مجدولة</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">قناة التنبيهات</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Telegram Bot</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Vercel Dashboard</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">إشعارات فورية بالعميل الجديد ورسالته الجاهزة</td>
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
            { cmd: "python scanner/leads/lead_scraper.py --industry=ecommerce --location=SA --count=20", desc: "صيد 20 عميل متجر إلكتروني في السعودية" },
            { cmd: "python scanner/leads/ai_outreach.py --lead-id=abc --tone=professional", desc: "توليد رسالة مخصصة للعميل بأسلوب احترافي" },
            { cmd: "python scanner/leads/ai_outreach.py --lead=John --signal=funding --service=SEO", desc: "رسالة ترتكز على إشارة تمويل" },
            { cmd: "python scanner/leads/telegram_notifier.py --lead-id=latest", desc: "إرسال آخر عميل + رسالته عبر تليجرام للموافقة" },
            { cmd: "python scanner/leads/pipeline_manager.py --update --id=abc --status=won", desc: "تحديث حالة عميل لمغلقة" },
            { cmd: "gh workflow run lead-pipeline.yml -f industry=saas -f count=10", desc: "إطلاق صيد SaaS عبر GitHub Actions" },
          ].map((c, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2 rounded-md bg-muted/20 border border-border">
              <Target className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <code className="text-xs font-mono text-rose-600 dark:text-rose-400 block" dir="ltr">
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
