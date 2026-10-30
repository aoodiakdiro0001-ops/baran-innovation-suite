"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Box, Loader2, Sparkles, Wand2, ImageIcon, Type, Layers } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type InputType = "text" | "image" | "sketch";
type ModelSource = "TripoSR" | "Shap-E" | "DreamGaussian";
type Category = "furniture" | "character" | "vehicle" | "prop" | "environment" | "generic";
type Format = "glb" | "obj" | "fbx" | "ply";

const modelOptions: { value: ModelSource; label: string; desc: string }[] = [
  { value: "TripoSR", label: "TripoSR (Stability AI)", desc: "الأفضل للصور الواقعية، جودة عالية" },
  { value: "Shap-E", label: "Shap-E (OpenAI)", desc: "أسرع، يدعم النص والصورة" },
  { value: "DreamGaussian", label: "DreamGaussian", desc: "تنعيم عالي، نسيج PBR" },
];

const categoryOptions: { value: Category; label: string; emoji: string }[] = [
  { value: "furniture", label: "أثاث", emoji: "🪑" },
  { value: "character", label: "شخصية", emoji: "🧝" },
  { value: "vehicle", label: "مركبة", emoji: "🚗" },
  { value: "prop", label: "أغراض", emoji: "⚔️" },
  { value: "environment", label: "بيئة", emoji: "🏰" },
  { value: "generic", label: "أخرى", emoji: "📦" },
];

const formatOptions: { value: Format; label: string; compat: string }[] = [
  { value: "glb", label: "GLB (موصى به)", compat: "Unity, Unreal, Three.js, Web" },
  { value: "obj", label: "OBJ", compat: "Blender, Maya, 3ds Max" },
  { value: "fbx", label: "FBX", compat: "Unity, Unreal, MotionBuilder" },
  { value: "ply", label: "PLY", compat: "MeshLab, CloudCompare" },
];

export function AssetGenerator() {
  const [inputType, setInputType] = useState<InputType>("text");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [modelSource, setModelSource] = useState<ModelSource>("TripoSR");
  const [category, setCategory] = useState<Category>("furniture");
  const [format, setFormat] = useState<Format>("glb");
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (inputType === "text" && !prompt.trim()) {
      toast.error("أدخل وصفاً نصياً للمجسم");
      return;
    }
    if (inputType === "image" && !imageUrl.trim()) {
      toast.error("أدخل رابط الصورة أو ارفع صورة");
      return;
    }
    setGenerating(true);
    try {
      const finalPrompt = inputType === "text" ? prompt.trim() : `Image to 3D: ${imageUrl || "uploaded image"}`;
      const res = await fetch("/api/spatial/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          inputType,
          inputUrl: inputType === "image" ? imageUrl : null,
          modelSource,
          category,
          format,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success("🚀 بدأ توليد المجسم! سيظهر في المعرض خلال 6-18 ثانية");
        setPrompt("");
        setImageUrl("");
        setTimeout(() => window.dispatchEvent(new CustomEvent("spatial-asset-created")), 500);
      } else {
        toast.error("فشل بدء التوليد");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-violet-500/30 cyber-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-violet-500/10">
            <Wand2 className="h-4 w-4 text-violet-500" />
          </div>
          مُولِّد المجسمات ثلاثية الأبعاد
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Input Type selector */}
        <div>
          <Label className="text-xs mb-1.5 block">نوع المُدخل</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "text" as InputType, label: "وصف نصي", icon: Type },
              { value: "image" as InputType, label: "صورة 2D", icon: ImageIcon },
              { value: "sketch" as InputType, label: "رسم تخطيطي", icon: Layers },
            ].map((opt) => {
              const Icon = opt.icon;
              const isActive = inputType === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setInputType(opt.value)}
                  className={`p-2.5 rounded-md border text-center transition-colors ${
                    isActive
                      ? "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      : "border-border hover:border-violet-500/20"
                  }`}
                >
                  <Icon className={`h-4 w-4 mx-auto mb-1 ${isActive ? "text-violet-500" : "text-muted-foreground"}`} />
                  <div className="text-[10px] font-medium">{opt.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt or Image URL */}
        {inputType === "text" ? (
          <div>
            <Label htmlFor="prompt" className="text-xs mb-1.5 block">
              وصف المجسم (Prompt)
            </Label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="كرسي خشبي بأسلوب فايكنج بتفاصيل منقوشة، نسيج بلوطي داكن"
              className="w-full px-3 py-2 text-xs border border-border rounded-md bg-card focus:outline-none focus:border-violet-500/50 min-h-[80px] resize-y"
              dir="rtl"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              كلما كان الوصف تفصيلياً، كان التوليد أدق
            </p>
          </div>
        ) : (
          <div>
            <Label htmlFor="image-url" className="text-xs mb-1.5 block">
              رابط الصورة (URL)
            </Label>
            <Input
              id="image-url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/object.jpg"
              className="text-xs font-mono"
              dir="ltr"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              الصورة يجب أن تكون واضحة للكائن من زاوية واحدة على الأقل
            </p>
          </div>
        )}

        {/* Model Source */}
        <div>
          <Label className="text-xs mb-1.5 block">نموذج التوليد</Label>
          <Select value={modelSource} onValueChange={(v) => setModelSource(v as ModelSource)}>
            <SelectTrigger className="text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modelOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  <div className="flex flex-col">
                    <span>{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category & Format */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block">فئة المجسم</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    <span className="ml-1">{opt.emoji}</span>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">صيغة التصدير</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    <div className="flex flex-col">
                      <span>{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground">{opt.compat}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estimated savings */}
        <div className="p-2.5 rounded-md bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs text-emerald-700 dark:text-emerald-400">
            التوفير المتوقع مقابل شراء مجسم جاهز:{" "}
            <strong>$80 - $400</strong> — سيتضمن: UV Map + Textures + Decimation (تقليل 85%+)
          </span>
        </div>

        {/* Action button */}
        <Button
          onClick={generate}
          disabled={generating}
          className="w-full text-xs h-9 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
        >
          {generating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full ml-1.5"
            />
          ) : (
            <Sparkles className="h-3.5 w-3.5 ml-1.5" />
          )}
          {generating ? "جارٍ توليد المجسم..." : "توليد مجسم ثلاثي الأبعاد"}
        </Button>
      </CardContent>
    </Card>
  );
}
