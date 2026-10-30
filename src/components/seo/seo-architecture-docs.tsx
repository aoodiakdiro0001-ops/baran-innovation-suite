"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Brain,
  Database,
  Send,
  Workflow,
  PenLine,
  Eye,
  Terminal,
  TrendingUp,
} from "lucide-react";

const layers = [
  {
    icon: Search,
    title: "1. طبقة التتبع والرصد (Rank Tracking)",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    tools: ["Python", "BeautifulSoup", "SerpApi Free", "GitHub Actions"],
    description:
      "سكربت بايثون خفيف يعمل داخل GitHub Actions في أوقات مجدولة. يفحص موقعك ومواقع المنافسين في نتائج البحث لكلمات مفتاحية محددة، ويُسجّل الترتيب التاريخي للمراكز عبر الزمن. يكشف الكلمات الصاعدة والكلمات المفقودة تلقائياً.",
  },
  {
    icon: Brain,
    title: "2. العقل التحليلي وصانع المحتوى (AI SEO Core)",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    tools: ["Gemini API", "Groq API", "Z.ai SDK"],
    description:
      "يحلل نصوص المنافسين الذين يتصدرون نتائج البحث، يكتشف فجوات المحتوى (ما ينقصهم)، ثم يكتب مقالاً متكاملاً يحتوي على الكلمات المفتاحية بدقة، التوزيع الصحيح للعناوين H1/H2/H3، والروابط الداخلية المقترحة ليتصدر موقعك مكانهم.",
  },
  {
    icon: Database,
    title: "3. طبقة الأرشيف التاريخي (Time-Series Persistence)",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    tools: ["Supabase", "PostgreSQL"],
    description:
      "يحفظ لقطات يومية للترتيب لكل كلمة مفتاحية، مما يتيح عرض رسوم بيانية توضح صعود وهبوط موقعك عبر الأسابيع والأشهر. يمكنك مقارنة أدائك الحالي بالأداء السابق وتحديد الاتجاهات البعيدة المدى.",
  },
  {
    icon: Send,
    title: "4. طبقة التقارير والتنبيه (Reporting & Delivery)",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    tools: ["Telegram Bot", "Next.js Dashboard"],
    description:
      "يرسل تقريراً أسبوعياً على هاتفك عبر تليجرام: تقدّم الكلمات، الكلمات المفقودة، الفرص الجديدة، والمحتوى المقترح للنشر. لوحة التحكم الويب تعرض كل ذلك برسوم بيانية تفاعلية وتفاصيل دقيقة.",
  },
];

const workflow = [
  { step: "التحديد", icon: Search, text: "تزوّد النظام بقائمة الكلمات المفتاحية المستهدفة" },
  { step: "الرصد", icon: Eye, text: "GitHub Actions يفحص الترتيب في أوقات مجدولة" },
  { step: "المقارنة", icon: TrendingUp, text: "يقارن موقعك بالمنافسين ويكشف الفجوات" },
  { step: "التحليل", icon: Brain, text: "Gemini يحلل محتوى المنافسين المتصدرين" },
  { step: "التوليد", icon: PenLine, text: "يكتب مقالاً متكاملاً متوافقاً مع SEO" },
  { step: "التسليم", icon: Send, text: "يأتيك التقرير والمقال على تليجرام" },
];

export function SeoArchitectureDocs() {
  return (
    <div className="space-y-4">
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-background to-purple-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            ما هو SEO-GhostBaran؟
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">SEO-GhostBaran</strong> هو نظام ذكي متكامل لمراقبة ترتيب
            الكلمات المفتاحية، تتبع ظهور موقعك وموقع منافسيك في محركات البحث، تحليل محتوى المنافسين الأكثر
            رواجاً، وتوليد مقالات ومحتوى محسَّن بالكامل ليتصدّر نتائج البحث (SEO-Optimized Content).
            يقوم بفحص الكلمات المفتاحية دورياً، كشف الثغرات التي تتيح لك التفوق على منافسيك، وصياغة مقالات
            أو صفحات هبوط جاهزة للنشر — دون دفع دولار واحد لأي أداة مدفوعة، وبموارد مجانية بالكامل.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-xs font-semibold mb-1 text-emerald-600 dark:text-emerald-400">💰 توفير مالي فلكي</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                أدوات تتبع الـ SEO وتحليل الكلمات المفتاحية (Ahrefs, SEMrush) تكلف الشركات مئات الدولارات شهرياً؛
                هذا النظام يؤدي نفس الغرض بتكلفة صفر.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
              <div className="text-xs font-semibold mb-1 text-cyan-600 dark:text-cyan-400">🎯 استباقية وتفوق</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                يخبرك يومياً بتحركات ترتيب موقعك، ويحدد الكلمات المفتاحية السهلة التي يمكنك تصدّرها بسهولة لزيادة زوار موقعك مجاناً.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5">
              <div className="text-xs font-semibold mb-1 text-purple-600 dark:text-purple-400">✍️ صناعة المحتوى المتصدّر</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                لا يكتفي بالمراقبة، بل يكتب محتوى متوافقاً 100% مع معايير خوارزميات البحث لجلب عملاء جدد بلا توقف.
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
            <Workflow className="h-4 w-4 text-emerald-500" />
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
                      <div className="p-3 rounded-full bg-card border border-emerald-500/30">
                        <Icon className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
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
            <TrendingUp className="h-4 w-4 text-emerald-500" />
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
                  <td className="py-2.5">محرّك الجدولة</td>
                  <td className="py-2.5"><Badge variant="outline" className="font-mono text-[10px]">GitHub Actions</Badge></td>
                  <td className="py-2.5 text-muted-foreground">فحص ترتيب الكلمات وزيارة المنافسين دورياً</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">محرّك البحث والـ Scraping</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">BeautifulSoup</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">SerpApi Free</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">تتبّع مراكز المواقع واستخراج الكلمات الأكثر بحثاً</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">العقل التحليلي</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Gemini API</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Groq API</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">تحليل فجوات المحتوى وصياغة المقالات المتصدّرة</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">قاعدة البيانات</td>
                  <td className="py-2.5"><Badge variant="outline" className="font-mono text-[10px]">Supabase</Badge></td>
                  <td className="py-2.5 text-muted-foreground">تخزين سجلات الترتيب التاريخية ومقارنة الأداء</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">قناة التقارير</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Telegram Bot</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Next.js Dashboard</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">إرسال تقارير الأداء والمحتوى المقترح للهاتف</td>
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
            { cmd: "python scanner/seo/rank_tracker.py --keywords=keywords.txt", desc: "فحص ترتيب كل الكلمات المفتاحية" },
            { cmd: "python scanner/seo/content_generator.py --keyword='فحص أمني تلقائي' --type=article", desc: "توليد مقال SEO لمنافسة منافس متصدّر" },
            { cmd: "python scanner/seo/competitor_analyzer.py --domain=ahrefs.com", desc: "تحليل منافس واكتشاف نقاط قوته" },
            { cmd: "python scanner/seo/telegram_reporter.py --weekly", desc: "إرسال تقرير SEO أسبوعي عبر تليجرام" },
            { cmd: "python scanner/seo/supabase_persistence.py --sync", desc: "مزامنة سجلات الترتيب مع Supabase" },
            { cmd: "gh workflow run seo-tracking.yml", desc: "إطلاق فحص SEO كامل عبر GitHub Actions" },
          ].map((c, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2 rounded-md bg-muted/20 border border-border">
              <Search className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <code className="text-xs font-mono text-emerald-600 dark:text-emerald-400 block" dir="ltr">
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
