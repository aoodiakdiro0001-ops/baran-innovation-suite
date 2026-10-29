"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Wand2,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Job = {
  id: string;
  fileName: string;
  processType: string;
  backgroundStyle: string | null;
  status: string;
  resultUrl: string | null;
  resultSize: number | null;
  costSavedUsd: number;
  processingTimeMs: number | null;
  finishedAt: string | null;
};

const processLabel: Record<string, string> = {
  rembg: "إزالة خلفية",
  relight: "إعادة إضاءة",
  composite: "دمج في خلفية",
  full: "معالجة كاملة",
};

export function ResultsGallery() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Job | null>(null);

  const load = async () => {
    try {
      const r = await fetch("/api/pixel/jobs?status=completed&limit=20");
      const d = await r.json();
      setJobs(d.jobs || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const r = await fetch("/api/pixel/jobs?status=completed&limit=20");
        const d = await r.json();
        setJobs(d.jobs || []);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchInitial();
    const t = setInterval(load, 10000);
    const handler = () => load();
    window.addEventListener("pixel-job-created", handler);
    return () => {
      clearInterval(t);
      window.removeEventListener("pixel-job-created", handler);
    };
  }, []);

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-fuchsia-500" />
          <CardTitle className="text-sm">معرض النتائج الاحترافية</CardTitle>
          <Badge variant="outline" className="text-xs">{jobs.length} صورة جاهزة</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[420px] custom-scroll pr-2">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
              لا توجد نتائج معالجة بعد
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {jobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ y: -2 }}
                  className="group relative rounded-lg overflow-hidden border border-border bg-card/40 hover:border-fuchsia-500/40 transition-colors cursor-pointer"
                  onClick={() => setSelected(job)}
                >
                  {/* Placeholder visual */}
                  <div className="aspect-square bg-gradient-to-br from-fuchsia-500/10 via-purple-500/10 to-cyan-500/10 flex items-center justify-center relative">
                    <ImageIcon className="h-12 w-12 text-fuchsia-500/30 group-hover:scale-110 transition-transform" />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <Button size="sm" variant="secondary" className="h-7 text-xs">
                        <Eye className="h-3.5 w-3.5 ml-1" />
                        عرض
                      </Button>
                    </div>
                    {/* Status badge */}
                    <div className="absolute top-1.5 right-1.5">
                      <Badge className="severity-low text-[10px]">
                        <CheckCircle2 className="h-2.5 w-2.5 ml-1" />
                        جاهز
                      </Badge>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2.5 space-y-1">
                    <div className="text-xs font-mono truncate" title={job.fileName}>
                      {job.fileName.replace("_raw", "_processed")}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{processLabel[job.processType]}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ${job.costSavedUsd}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-fuchsia-500" />
                  النتيجة المعالجة
                </DialogTitle>
                <DialogDescription className="text-xs">
                  <span className="inline-flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs font-mono">
                      {selected.fileName.replace("_raw", "_processed")}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {processLabel[selected.processType]}
                    </Badge>
                    {selected.processingTimeMs && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 ml-1" />
                        {(selected.processingTimeMs / 1000).toFixed(1)}s
                      </Badge>
                    )}
                    <Badge className="severity-low text-xs">
                      ${selected.costSavedUsd} توفير
                    </Badge>
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Visual placeholder */}
                <div className="aspect-video bg-gradient-to-br from-fuchsia-500/10 via-purple-500/10 to-cyan-500/10 rounded-lg flex items-center justify-center relative border border-fuchsia-500/20">
                  <div className="text-center">
                    <Wand2 className="h-16 w-16 text-fuchsia-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      معاينة النتيجة ستظهر هنا في الإنتاج الفعلي
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-md bg-muted/20">
                    <div className="text-xs text-muted-foreground mb-1">حجم النتيجة</div>
                    <div className="text-sm font-semibold font-mono">
                      {formatBytes(selected.resultSize)}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-muted/20">
                    <div className="text-xs text-muted-foreground mb-1">زمن المعالجة</div>
                    <div className="text-sm font-semibold font-mono">
                      {selected.processingTimeMs ? `${(selected.processingTimeMs / 1000).toFixed(1)}s` : "—"}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-emerald-500/10">
                    <div className="text-xs text-muted-foreground mb-1">التوفير</div>
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      ${selected.costSavedUsd}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 text-xs bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white"
                    onClick={() => {
                      toast.success("بدأ تنزيل الصورة (محاكاة)");
                    }}
                  >
                    <Download className="h-3.5 w-3.5 ml-1.5" />
                    تنزيل PNG عالي الدقة
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => toast.success("تم إرسال الصورة عبر تليجرام (محاكاة)")}
                  >
                    <Send className="h-3.5 w-3.5 ml-1.5" />
                    إرسال لتليجرام
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
