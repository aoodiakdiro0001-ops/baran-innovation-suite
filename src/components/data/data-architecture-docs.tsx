"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Brain,
  AlertTriangle,
  Workflow,
  Terminal,
  Upload,
  TrendingUp,
  Activity,
} from "lucide-react";

const layers = [
  {
    icon: Database,
    title: "1. طبقة الجلب والمعالجة (ETL Pipeline)",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    tools: ["Python", "Pandas", "Polars", "GitHub Actions"],
    description:
      "سكربت بايثون باستخدام مكتبة Pandas يعمل داخل خادم GitHub Actions. يجلب البيانات من مصادر متعددة (CSV, JSON, SQL, APIs)، يدمجها، يزيل القيم التالفة أو المكررة، وينظّمها في جداول نظيفة جاهزة للتحليل.",
  },
  {
    icon: Brain,
    title: "2. العقل التنبؤي والتحليلي (AI Insights)",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    tools: ["Gemini API", "Groq API", "Z.ai SDK"],
    description:
      "يمرّر النظام خلاصة الأرقام والإحصائيات إلى نموذج الذكاء الاصطناعي مع توجيه دقيق: حلّل الأرقام، حدد أسباب الارتفاع/الانخفاض، قدّر الاتجاهات المستقبلية، واعطِ 3 توصيات عملية واضحة لتحسين الأداء.",
  },
  {
    icon: Database,
    title: "3. طبقة التخزين الذكي (Data Lakehouse)",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    tools: ["Supabase", "PostgreSQL"],
    description:
      "يخزّن النتائج والسجلات التاريخية في Supabase لتمكين النظام من تتبع التغيرات عبر الزمن ومقارنة أداء الأسابيع والأشهر ببعضها. الجداول الزمنية تدعم Time-Series Analytics.",
  },
  {
    icon: AlertTriangle,
    title: "4. كشف الشذوذ والتنبيه (Anomaly Detection)",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    tools: ["Statistical Models", "Z-score", "IQR Method"],
    description:
      "بوت تليجرام يرسل ملخصاً أسبوعياً أو تنبيهاً فورياً عند رصد أرقام غير طبيعية (مثل ارتفاع مفاجئ في التكاليف أو هبوط في الأداء). يستخدم Z-score وIQR للكشف الإحصائي.",
  },
];

const workflow = [
  { step: "الرفع", icon: Upload, text: "ترفع ملف CSV / JSON / SQL أو تربط API" },
  { step: "ETL", icon: Database, text: "Python ينظّف البيانات ويزيل الشوائب" },
  { step: "التحليل", icon: Brain, text: "Gemini يحلّل الأرقام ويستخرج الرؤى" },
  { step: "التنبؤ", icon: TrendingUp, text: "نماذج ARIMA للتنبؤ بالمبيعات/الأداء" },
  { step: "الرصد", icon: AlertTriangle, text: "كشف الشذوذ والمقاييس غير الطبيعية" },
  { step: "التسليم", icon: Activity, text: "تليجرام + Dashboard يعرضان النتائج" },
];

export function DataArchitectureDocs() {
  return (
    <div className="space-y-4">
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background to-purple-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-5 w-5 text-amber-500" />
            ما هو Data-Nexus ZeroBaran؟
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Data-Nexus ZeroBaran</strong> هو نظام ذكي متكامل لجمع،
            تنظيف، تحليل، واستخراج الرؤى من قواعد البيانات الضخمة والملفات المتعددة (CSV, JSON, SQL, APIs)
            أوتوماتيكياً. يقوم بربط مصادر البيانات المتباينة، معالجة القيم المفقودة والشوائب برمجياً،
            توليد لوحات تحكم تفاعلية فورية، وإرسال تقارير تنبؤية دقيقة عن حالة عملك أو مشروعك — دون دفع
            دولار واحد لأي منصة تحليل مدفوعة، وبموارد مجانية بالكامل.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-xs font-semibold mb-1 text-emerald-600 dark:text-emerald-400">💰 توفير مالي فلكي</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                أدوات هندسة وتحليل البيانات (Tableau $70/مستخدم/شهر، Power BI $20/مستخدم/شهر، Looker $30K+/سنة) تكلف الشركات ثروات؛ هذا النظام يؤدي نفس الغرض باحترافية وبتكلفة صفر.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
              <div className="text-xs font-semibold mb-1 text-cyan-600 dark:text-cyan-400">📊 تحليل تنبؤي فوري</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                لا يقتصر على عرض الأرقام السابقة فحسب، بل يستخدم الذكاء الاصطناعي لتوقع الاتجاهات المستقبلية، مثل المبيعات المتوقعة أو تراجع الأداء المحتمل.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5">
              <div className="text-xs font-semibold mb-1 text-purple-600 dark:text-purple-400">🔒 السيادة المطلقة للبيانات</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                حماية بياناتك الحساسة أو المالية وعدم تسريبها لشركات التحليل الخارجية. كل شيء يبقى تحت سيطرتك المباشرة على Supabase الخاص بك.
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
            <Workflow className="h-4 w-4 text-amber-500" />
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
                      <div className="p-3 rounded-full bg-card border border-amber-500/30">
                        <Icon className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
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
            <Database className="h-4 w-4 text-emerald-500" />
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
                  <td className="py-2.5">محرّك المعالجة (Pipeline)</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Pandas</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Polars</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Actions</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">سحب البيانات، تنظيفها، تنفيذ العمليات الحسابية دورياً</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">العقل التحليلي</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Gemini</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Groq</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">قراءة البيانات واستخراج القصة وراء الأرقام</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">قاعدة البيانات (Lakehouse)</td>
                  <td className="py-2.5"><Badge variant="outline" className="font-mono text-[10px]">Supabase</Badge></td>
                  <td className="py-2.5 text-muted-foreground">تخزين الجداول الضخمة والبيانات المعالجة تاريخياً</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">لوحة التحكم التفاعلية</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Streamlit</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Next.js</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">استضافة مجانية لرسوم بيانية تفاعلية مبهرة</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">قناة التنبيهات والتقارير</td>
                  <td className="py-2.5"><Badge variant="outline" className="font-mono text-[10px]">Telegram Bot</Badge></td>
                  <td className="py-2.5 text-muted-foreground">تقارير صباحية وتنبيهات فورية عند الشذوذ</td>
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
            { cmd: "python scanner/data/etl_pipeline.py --input=sales.csv --output=clean.parquet", desc: "تنظيف ملف CSV بالكامل" },
            { cmd: "python scanner/data/ai_insights.py --dataset=sales --summary='...' --metrics=sales,cost", desc: "استخراج رؤى AI من البيانات" },
            { cmd: "python scanner/data/anomaly_detector.py --metric=sales --threshold=3", desc: "كشف الشذوذ في مقياس معين" },
            { cmd: "python scanner/data/telegram_alerts.py --weekly", desc: "تقرير أسبوعي عبر تليجرام" },
            { cmd: "python scanner/data/supabase_persistence.py --upload=clean.parquet", desc: "رفع البيانات المعالَجة لـ Supabase" },
            { cmd: "gh workflow run data-pipeline.yml -f source=sales.csv", desc: "إطلاق ETL عبر GitHub Actions" },
          ].map((c, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2 rounded-md bg-muted/20 border border-border">
              <Database className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <code className="text-xs font-mono text-amber-600 dark:text-amber-400 block" dir="ltr">
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
