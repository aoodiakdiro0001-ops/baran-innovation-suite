"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Scissors,
  Brain,
  Database,
  Send,
  Workflow,
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Terminal,
} from "lucide-react";

const layers = [
  {
    icon: Upload,
    title: "1. طبقة الالتقاط (Ingestion)",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    tools: ["Telegram Bot", "Web Dashboard", "REST API"],
    description:
      "ترفع صورة للمنتج (حتى بهاتف عادي على طاولة منزلية) عبر تليجرام أو واجهة الويب أو API. الصورة تُخزَّن مؤقتاً وتُنشأ مهمة معالجة جديدة في قاعدة البيانات.",
  },
  {
    icon: Scissors,
    title: "2. طبقة العزل (Isolation)",
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-500/10",
    tools: ["rembg", "Pillow", "OpenCV"],
    description:
      "سكربت بايثون يستخدم rembg (مفتوح المصدر) لعزل المنتج تماماً عن الخلفية خلال ثانية واحدة. يعطي PNG شفاف بدقة فائقة مع تحسين الحواف.",
  },
  {
    icon: Brain,
    title: "3. العقل البصري (AI Relighting)",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    tools: ["Hugging Face", "Gemini API", "Stable Diffusion"],
    description:
      "يختار النظام أو يولّد خلفية تسويقية فاخرة (ستوديو، خشب، شاطئ، مكتب) ويدمج المنتج فيها مع ضبط الظلال والإضاءة لتظهر طبيعية 100% كأنها صُوّرت في استوديو عالمي.",
  },
  {
    icon: Database,
    title: "4. طبقة الأرشيف (Persistence)",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    tools: ["Supabase Storage", "PostgreSQL"],
    description:
      "الصور الأصلية والمعالجة تُحفظ في Supabase Storage مع ربطها بسجل المستخدم. يمكنك الرجوع لأي نتيجة سابقة وتنزيلها بأي دقة في أي وقت.",
  },
  {
    icon: Send,
    title: "5. طبقة التسليم (Delivery)",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    tools: ["Telegram Bot", "Webhook", "Direct Download"],
    description:
      "تُرسل الصورة النهائية عبر تليجرام بصيغة PNG عالية الدقة فور الانتهاء، أو تكون جاهزة للتنزيل المباشر من لوحة التحكم — جاهزة للاستخدام في إعلاناتك أو متجرك الإلكتروني.",
  },
];

const workflow = [
  { step: "الرفع", icon: Upload, text: "ترفع صورة المنتج الخام عبر تليجرام أو الويب" },
  { step: "العزل", icon: Scissors, text: "rembg يزيل الخلفية بدقة خلال ثانية" },
  { step: "التحليل", icon: Brain, text: "AI يحدد نوع المنتج ويختار الخلفية المناسبة" },
  { step: "الدمج", icon: Wand2, text: "يُدمج المنتج في الخلفية مع ظلال واقعية" },
  { step: "الأرشفة", icon: Database, text: "تُحفظ النتيجة في Supabase Storage" },
  { step: "التسليم", icon: Send, text: "تليجرام يُرسل الصورة النهائية فوراً" },
];

export function PixelArchitectureDocs() {
  return (
    <div className="space-y-4">
      <Card className="border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/5 via-background to-purple-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-fuchsia-500" />
            ما هو Pixel-ZeroBaran؟
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Pixel-ZeroBaran</strong> هو نظام ذكي متكامل لتعديل الصور،
            إزالة الخلفيات بدقة متناهية، إعادة إضاءة المنتجات (Relighting)، وتوليد لقطات تسويقية احترافية
            للمنتجات أو الأشخاص. يقوم بمعالجة الصور الخام بضغطة زر واحدة، دمجها في خلفيات واقعية تناسب
            الهوية التجارية، وتصديرها بدقة عالية جاهزة للإعلانات — دون دفع دولار واحد لأي أداة مدفوعة،
            وبموارد مجانية بالكامل.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-xs font-semibold mb-1 text-emerald-600 dark:text-emerald-400">💰 توفير فلكي</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                استئجار استوديو تصوير أو اشتراك أدوات احترافية يكلف مئات الدولارات شهرياً؛ هذا النظام يؤدي نفس الغرض بتكلفة صفر.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
              <div className="text-xs font-semibold mb-1 text-cyan-600 dark:text-cyan-400">⚡ سرعة وإنتاج فوري</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                معالجة عشرات صور المنتجات خلال ثوانٍ معدودة دون خبرة في برامج التصميم المعقدة (Bulk Processing).
              </p>
            </div>
            <div className="p-3 rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5">
              <div className="text-xs font-semibold mb-1 text-fuchsia-600 dark:text-fuchsia-400">✨ جودة وواقعية</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                يدمج المنتجات في بيئات بصرية طبيعية مع ظلال وإضاءة متوافقة تماماً كأنها صُوّرت في استوديو عالمي.
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
            <Workflow className="h-4 w-4 text-fuchsia-500" />
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
                      <div className="p-3 rounded-full bg-card border border-fuchsia-500/30">
                        <Icon className="h-5 w-5 text-fuchsia-500" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-fuchsia-500 text-white text-[10px] font-bold flex items-center justify-center">
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
            <ImageIcon className="h-4 w-4 text-emerald-500" />
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
                  <td className="py-2.5">محرّك التشغيل</td>
                  <td className="py-2.5"><Badge variant="outline" className="font-mono text-[10px]">GitHub Actions</Badge></td>
                  <td className="py-2.5 text-muted-foreground">تنفيذ المعالجة المجدولة والآلية</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">محرّك العزل والتعديل</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">rembg</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Pillow</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">OpenCV</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">عزل الخلفيات بدقة، تعديل الأبعاد، تجهيز الصور</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">العقل البصري</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Hugging Face</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Gemini API</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">تحليل الصور، توليد خلفيات واقعية، ضبط الإضاءة والظلال</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">قاعدة البيانات والتخزين</td>
                  <td className="py-2.5"><Badge variant="outline" className="font-mono text-[10px]">Supabase Storage</Badge></td>
                  <td className="py-2.5 text-muted-foreground">حفظ الصور الأصلية والنهائية وربطها بسجلات المستخدمين</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">قناة الاستقبال والتسليم</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Telegram Bot</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Streamlit Dashboard</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">استلام الصور وإرسال النتيجة الفاخرة في ثوانٍ</td>
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
            { cmd: "python scanner/pixel/rembg_processor.py --input=img.jpg --output=out.png", desc: "عزل خلفية صورة واحدة" },
            { cmd: "python scanner/pixel/ai_relighter.py --subject=cutout.png --style=studio", desc: "إعادة إضاءة ودمج في خلفية ستوديو" },
            { cmd: "python scanner/pixel/batch_processor.py --folder=products/ --style=lifestyle", desc: "معالجة دفعة صور بالجملة" },
            { cmd: "python scanner/pixel/telegram_delivery.py --job-id=latest", desc: "إرسال آخر نتيجة عبر تليجرام" },
            { cmd: "python scanner/pixel/supabase_storage.py --upload=out.png", desc: "رفع النتيجة لـ Supabase Storage" },
            { cmd: "gh workflow run pixel-processing.yml -f image_url=...", desc: "إطلاق معالجة عبر GitHub Actions" },
          ].map((c, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2 rounded-md bg-muted/20 border border-border">
              <ImageIcon className="h-4 w-4 text-fuchsia-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <code className="text-xs font-mono text-fuchsia-600 dark:text-fuchsia-400 block" dir="ltr">
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
