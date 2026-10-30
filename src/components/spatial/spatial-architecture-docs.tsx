"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Box,
  Brain,
  Database,
  Send,
  Workflow,
  Terminal,
  Upload,
  Wand2,
  Layers,
  Sparkles,
} from "lucide-react";

const layers = [
  {
    icon: Upload,
    title: "1. طبقة استقبال الفكرة أو الرسم (Input)",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    tools: ["Telegram Bot", "Web UI", "Streamlit"],
    description:
      "ترسل صورة لكرسي أثري أو كائن خيالي، أو تكتب وصفاً نصياً مثل: \"كرسي خشبي قديم بأسلوب فايكنج\". البوت أو واجهة الويب تستقبل المُدخل وتُنشئ مهمة توليد جديدة.",
  },
  {
    icon: Brain,
    title: "2. العقل المولِّد للأنماط ثلاثية الأبعاد (Generative Core)",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    tools: ["TripoSR", "Shap-E", "DreamGaussian"],
    description:
      "استغلال النماذج مفتوحة المصدر المتاحة على Hugging Face عبر الـ Inference APIs المجانية. تحويل الصورة أو الوصف النصي إلى شبكة مجسم (3D Mesh) خام مع الخرائط اللونية الأولية خلال أقل من 10 ثوانٍ.",
  },
  {
    icon: Layers,
    title: "3. محرك المعالجة والتنظيف الآلي (Post-Processing)",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    tools: ["Blender Headless", "Python", "Decimation", "UV Mapping"],
    description:
      "سكربت بايثون يشغّل Blender في الخلفية بدون واجهة (Headless Mode). ينفذ عملية Decimation لتخفيض عدد المضلعات (من 200K إلى 12K مثلاً)، يُنشئ الخرائط الضوئية (UV Mapping)، ويصدّر بصيغة .GLB أو .FBX مضغوطة.",
  },
  {
    icon: Database,
    title: "4. طبقة التخزين والتسليم (Persistence & Delivery)",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    tools: ["Supabase Storage", "GitHub LFS", "Telegram Bot"],
    description:
      "يرفع الملف النهائي إلى قاعدة بيانات Supabase Storage، ويأتيك زر مباشر على تليجرام لتنزيل المجسم جاهزاً للسحب والإسقاط (Drag & Drop) في مشاريع Unity/Unreal/Blender. مع GIF معاينة متحركة.",
  },
];

const workflow = [
  { step: "الإرسال", icon: Upload, text: "ترسل صورة أو وصف للمجسم المراد" },
  { step: "التوليد", icon: Brain, text: "TripoSR يحوّل الصورة إلى مجسم خام" },
  { step: "التنظيف", icon: Layers, text: "Blender يقلّل المضلعات + UV Mapping" },
  { step: "الإكساء", icon: Wand2, text: "توليد الإكساءات (Textures) عالية الجودة" },
  { step: "التصدير", icon: Box, text: "تصدير بصيغة GLB/FBX/OBJ مضغوطة" },
  { step: "التسليم", icon: Send, text: "رابط تنزيل + GIF معاينة عبر تليجرام" },
];

export function SpatialArchitectureDocs() {
  return (
    <div className="space-y-4">
      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-background to-purple-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Box className="h-5 w-5 text-violet-500" />
            ما هو Spatial-ZeroBaran؟
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Spatial-ZeroBaran</strong> هو منظومة أتمتة لإنتاج وتجميع
            وتنظيف المجسمات ثلاثية الأبعاد (3D Assets) فورياً. تحوّل النصوص أو الصور ثنائية الأبعاد (2D)
            إلى مجسمات جاهزة للضغط والاستخدام مباشرة داخل محركات الألعاب (Unreal Engine / Unity) أو
            برامج التصميم (Blender) مع أتمتة عمليات تقليل المضلعات (Decimation) وتوليد الإكساءات (Texturing)
            — دون دفع دولار واحد لأي منصة مدفوعة، وبموارد مجانية بالكامل.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-xs font-semibold mb-1 text-emerald-600 dark:text-emerald-400">💰 توفير مالي هائل</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                بناء مكتبة مجسمات احترافية يكلف آلاف الدولارات؛ هذا النظام يولّدها وفق الطلب (On-Demand) بتكلفة صفر.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
              <div className="text-xs font-semibold mb-1 text-cyan-600 dark:text-cyan-400">⚡ تسريع خطوط الإنتاج</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                اختصار أسابيع من النمذجة اليدوية (3D Modeling) إلى دقائق معدودة لتجهيز البيئات والشخصيات والمجسمات.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-violet-500/20 bg-violet-500/5">
              <div className="text-xs font-semibold mb-1 text-violet-600 dark:text-violet-400">🔧 أتمتة التنظيف والتجهيز</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                لا يكتفي بتوليد المجسم، بل ينظف هيكليته البرمجية ويحسّن أداءه ليعمل بسلاسة على الأجهزة الهوائية والسحابية.
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
            <Workflow className="h-4 w-4 text-violet-500" />
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
                      <div className="p-3 rounded-full bg-card border border-violet-500/30">
                        <Icon className="h-5 w-5 text-violet-500" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">
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
                  <td className="py-2.5">محرّك التشغيل (GPU/CPU)</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">GitHub Actions</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">HF Spaces</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">خوادم مجانية تعالج خوارزميات التحويل إلى 3D</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">محرّك التوليد الذكي</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">TripoSR</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Shap-E</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">DreamGaussian</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">نماذج مفتوحة المصدر لتحويل الصورة/النص إلى .OBJ/.GLB</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">محرّك التعديل والتحسين</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Python</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Blender Headless</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">تشغيل Blender كخلفية لمعالجة المضلعات وخفض الحجم</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">التخزين وأرشيف المكتبة</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Supabase</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">GitHub LFS</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">حفظ ملفات المجسمات والوصلات للرجوع إليها</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">واجهة التحكم والطلب</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Telegram Bot</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Streamlit</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">استقبال الأوامر النصية وروابط تنزيل الأصول الجاهزة</td>
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
            { cmd: "python scanner/spatial/triposr_generator.py --input=chair.jpg --output=raw.obj", desc: "توليد مجسم خام من صورة عبر TripoSR" },
            { cmd: "python scanner/spatial/triposr_generator.py --prompt='viking chair' --output=raw.obj", desc: "توليد من نص" },
            { cmd: "python scanner/spatial/blender_processor.py --input=raw.obj --output=final.glb --decimate=0.15", desc: "تنظيف وتقليل المضلعات بنسبة 85%" },
            { cmd: "python scanner/spatial/blender_processor.py --input=raw.obj --output=final.fbx --uv-maps --textures", desc: "إنشاء UV Map + توليد الإكساءات" },
            { cmd: "python scanner/spatial/telegram_delivery.py --asset-id=latest", desc: "إرسال آخر مجسم عبر تليجرام" },
            { cmd: "gh workflow run spatial-3d-pipeline.yml -f prompt='ancient greek statue'", desc: "إطلاق توليد 3D عبر GitHub Actions" },
          ].map((c, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2 rounded-md bg-muted/20 border border-border">
              <Box className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <code className="text-xs font-mono text-violet-600 dark:text-violet-400 block" dir="ltr">
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
