"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, ImagePlus, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type ProcessType = "rembg" | "relight" | "composite" | "full";
type BackgroundStyle = "studio" | "lifestyle" | "nature" | "industrial" | "minimal";

const processOptions: { value: ProcessType; label: string; desc: string; savings: number }[] = [
  { value: "rembg", label: "إزالة الخلفية فقط", desc: "عزل المنتج بخلفية شفافة PNG — الأسرع", savings: 25 },
  { value: "relight", label: "إعادة إضاءة المنتج", desc: "ضبط الإضاءة والظلال على خلفية بيضاء", savings: 50 },
  { value: "composite", label: "دمج في خلفية تسويقية", desc: "وضع المنتج في بيئة إعلانية احترافية", savings: 80 },
  { value: "full", label: "معالجة كاملة", desc: "إزالة + إضاءة + دمج في خلفية فاخرة", savings: 65 },
];

const bgOptions: { value: BackgroundStyle; label: string; emoji: string }[] = [
  { value: "studio", label: "ستوديو إضاءة ناعمة", emoji: "💡" },
  { value: "lifestyle", label: "بيئة منزلية أنيقة", emoji: "🏠" },
  { value: "nature", label: "طبيعة وشاطئ", emoji: "🏖️" },
  { value: "industrial", label: "تصنيع ومعدن", emoji: "🏭" },
  { value: "minimal", label: "بسيط وجرادينت", emoji: "🎨" },
];

export function ImageUploader() {
  const [processType, setProcessType] = useState<ProcessType>("full");
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>("studio");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number } | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("الملف المختار ليس صورة");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الصورة يتجاوز 10 ميجابايت");
      return;
    }
    setSelectedFile({ name: file.name, size: file.size });
    toast.success(`تم اختيار: ${file.name}`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const startProcessing = async () => {
    if (!selectedFile) {
      toast.error("اختر صورة أولاً");
      return;
    }
    setUploading(true);
    try {
      // محاكاة معلومات الصورة
      const width = 4000;
      const height = 3000;

      const res = await fetch("/api/pixel/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          width,
          height,
          processType,
          backgroundStyle: processType === "rembg" ? null : backgroundStyle,
          source: "web",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`🚀 بدأت المعالجة! التوفير المتوقع: $${data.job.costSavedUsd}`);
        setSelectedFile(null);
        // إعادة تحميل المهام
        setTimeout(() => window.dispatchEvent(new CustomEvent("pixel-job-created")), 500);
      } else {
        toast.error("فشل بدء المعالجة");
      }
    } catch (e) {
      toast.error("خطأ في الاتصال");
    } finally {
      setUploading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <Card className="border-fuchsia-500/30 cyber-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-fuchsia-500/10">
            <Upload className="h-4 w-4 text-fuchsia-500" />
          </div>
          رفع صورة ومعالجتها
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-fuchsia-500 bg-fuchsia-500/10"
              : "border-border hover:border-fuchsia-500/40 hover:bg-muted/20"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer block">
            {selectedFile ? (
              <div className="space-y-2">
                <ImagePlus className="h-10 w-10 text-fuchsia-500 mx-auto" />
                <div className="text-sm font-medium">{selectedFile.name}</div>
                <div className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedFile(null);
                  }}
                >
                  إزالة
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <ImagePlus className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
                <div className="text-sm font-medium">اسحب وأفلت الصورة هنا</div>
                <div className="text-xs text-muted-foreground">أو اضغط للاختيار من الجهاز (حتى 10MB)</div>
              </div>
            )}
          </label>
        </div>

        {/* Process type */}
        <div>
          <Label className="text-xs mb-1.5 block">نوع المعالجة</Label>
          <Select value={processType} onValueChange={(v) => setProcessType(v as ProcessType)}>
            <SelectTrigger className="text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {processOptions.map((opt) => (
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

        {/* Background style (only if not rembg) */}
        {processType !== "rembg" && (
          <div>
            <Label className="text-xs mb-1.5 block">نوع الخلفية التسويقية</Label>
            <Select value={backgroundStyle} onValueChange={(v) => setBackgroundStyle(v as BackgroundStyle)}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bgOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    <span className="ml-1">{opt.emoji}</span>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Estimated savings */}
        <div className="p-2 rounded-md bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs text-emerald-700 dark:text-emerald-400">
            التوفير المتوقع مقابل استوديو حقيقي:{" "}
            <strong>
              $
              {
                processOptions.find((p) => p.value === processType)?.savings
              }
            </strong>
          </span>
        </div>

        {/* Action button */}
        <Button
          onClick={startProcessing}
          disabled={!selectedFile || uploading}
          className="w-full text-xs h-9 bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-600 hover:to-purple-600 text-white"
        >
          {uploading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full ml-1.5"
            />
          ) : (
            <Wand2 className="h-3.5 w-3.5 ml-1.5" />
          )}
          {uploading ? "جارٍ المعالجة..." : "ابدأ المعالجة الذكية"}
        </Button>
      </CardContent>
    </Card>
  );
}
