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
import { Upload, Loader2, Database, Sparkles, FileSpreadsheet, Globe, Database as SqlIcon } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type DataSource = "csv" | "json" | "sql" | "api";

const sourceConfig: Record<DataSource, { label: string; icon: typeof Upload; desc: string }> = {
  csv: { label: "ملف CSV", icon: FileSpreadsheet, desc: "ملف بيانات بفواصل" },
  json: { label: "ملف JSON", icon: FileSpreadsheet, desc: "ملف JSON مهيكَل" },
  sql: { label: "تصدير SQL", icon: SqlIcon, desc: "تصدير قاعدة بيانات" },
  api: { label: "API خارجي", icon: Globe, desc: "ربط API مباشر" },
};

export function DatasetUploader() {
  const [source, setSource] = useState<DataSource>("csv");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    setFileName(file.name);
    setFileSize(file.size);
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

  const startETL = async () => {
    if (!fileName) {
      toast.error("اختر ملفاً أولاً");
      return;
    }
    setUploading(true);
    try {
      const res = await fetch("/api/data/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          fileSize,
          source,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`🚀 تم رفع ${fileName}! بدأ ETL Pipeline تلقائياً (${data.estimatedRows.toLocaleString()} صف تقريباً)`);
        setFileName("");
        setFileSize(0);
        setTimeout(() => window.dispatchEvent(new CustomEvent("data-dataset-created")), 500);
      } else {
        toast.error("فشل الرفع");
      }
    } catch {
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

  const Icon = sourceConfig[source].icon;

  return (
    <Card className="border-amber-500/30 cyber-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/10">
            <Upload className="h-4 w-4 text-amber-500" />
          </div>
          رفع مصدر بيانات جديد
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Source selector */}
        <div>
          <Label className="text-xs mb-1.5 block">نوع المصدر</Label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(sourceConfig) as DataSource[]).map((s) => {
              const SIcon = sourceConfig[s].icon;
              const isActive = source === s;
              return (
                <button
                  key={s}
                  onClick={() => setSource(s)}
                  className={`p-2 rounded-md border text-center transition-colors ${
                    isActive
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border-border hover:border-amber-500/20"
                  }`}
                >
                  <SIcon className={`h-4 w-4 mx-auto mb-1 ${isActive ? "text-amber-500" : "text-muted-foreground"}`} />
                  <div className="text-[10px] font-medium">{sourceConfig[s].label}</div>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">{sourceConfig[source].desc}</p>
        </div>

        {/* Drop zone (only for file-based sources) */}
        {source !== "api" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              dragOver
                ? "border-amber-500 bg-amber-500/10"
                : "border-border hover:border-amber-500/40 hover:bg-muted/20"
            }`}
          >
            <input
              type="file"
              accept={source === "csv" ? ".csv" : source === "json" ? ".json" : source === "sql" ? ".sql" : "*"}
              onChange={handleFileInput}
              className="hidden"
              id="data-upload"
            />
            <label htmlFor="data-upload" className="cursor-pointer block">
              {fileName ? (
                <div className="space-y-2">
                  <Icon className="h-10 w-10 text-amber-500 mx-auto" />
                  <div className="text-sm font-medium">{fileName}</div>
                  <div className="text-xs text-muted-foreground">{formatBytes(fileSize)}</div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7"
                    onClick={(e) => {
                      e.preventDefault();
                      setFileName("");
                      setFileSize(0);
                    }}
                  >
                    إزالة
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
                  <div className="text-sm font-medium">اسحب وأفلت {sourceConfig[source].label}</div>
                  <div className="text-xs text-muted-foreground">أو اضغط للاختيار من الجهاز</div>
                </div>
              )}
            </label>
          </div>
        )}

        {/* API URL (only for api source) */}
        {source === "api" && (
          <div>
            <Label htmlFor="api-endpoint" className="text-xs mb-1.5 block">
              رابط الـ API
            </Label>
            <input
              id="api-endpoint"
              type="text"
              value={fileName}
              onChange={(e) => {
                setFileName(e.target.value);
                setFileSize(e.target.value.length * 2);
              }}
              placeholder="https://api.example.com/data"
              className="w-full h-9 px-3 text-xs font-mono border border-border rounded-md bg-card focus:outline-none focus:border-amber-500/50"
              dir="ltr"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              سيقوم النظام بجلب البيانات من الـ API مباشرة في الـ ETL Pipeline
            </p>
          </div>
        )}

        {/* Action button */}
        <Button
          onClick={startETL}
          disabled={!fileName || uploading}
          className="w-full text-xs h-9 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          {uploading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full ml-1.5"
            />
          ) : (
            <Sparkles className="h-3.5 w-3.5 ml-1.5" />
          )}
          {uploading ? "جارٍ بدء ETL..." : "ابدأ ETL Pipeline تلقائياً"}
        </Button>

        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 pt-1">
          <Database className="h-3 w-3" />
          <span>سيتم: drop NA → dedupe → type cast → schema validation → outlier detection</span>
        </div>
      </CardContent>
    </Card>
  );
}
