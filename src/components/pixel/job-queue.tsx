"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Image as ImageIcon, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

type Job = {
  id: string;
  source: string;
  fileName: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  processType: string;
  backgroundStyle: string | null;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  processingTimeMs: number | null;
  resultUrl: string | null;
  costSavedUsd: number;
  errorMessage: string | null;
};

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string; spin?: boolean }> = {
  completed: { label: "مكتمل", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  processing: { label: "قيد المعالجة", icon: Loader2, color: "text-yellow-500", bg: "bg-yellow-500/10", spin: true },
  failed: { label: "فشل", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  pending: { label: "مُعلّق", icon: RefreshCw, color: "text-muted-foreground", bg: "bg-muted/10" },
};

const processLabel: Record<string, string> = {
  rembg: "إزالة خلفية",
  relight: "إعادة إضاءة",
  composite: "دمج في خلفية",
  full: "معالجة كاملة",
};

const sourceLabel: Record<string, string> = {
  telegram: "تليجرام",
  web: "الويب",
  api: "API",
  github: "GitHub",
};

const styleLabel: Record<string, string> = {
  studio: "ستوديو",
  lifestyle: "بيئة",
  nature: "طبيعة",
  industrial: "صناعي",
  minimal: "بسيط",
};

export function JobQueue() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await fetch("/api/pixel/jobs?limit=30");
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
        const r = await fetch("/api/pixel/jobs?limit=30");
        const d = await r.json();
        setJobs(d.jobs || []);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchInitial();
    const t = setInterval(load, 5000);
    const handler = () => load();
    window.addEventListener("pixel-job-created", handler);
    return () => {
      clearInterval(t);
      window.removeEventListener("pixel-job-created", handler);
    };
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-fuchsia-500" />
          <CardTitle className="text-sm">قائمة مهام المعالجة</CardTitle>
          <Badge variant="outline" className="text-xs">{jobs.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[480px] custom-scroll">
          <Table>
            <TableHeader className="sticky top-0 bg-card/95 backdrop-blur z-10">
              <TableRow>
                <TableHead className="text-xs">الملف</TableHead>
                <TableHead className="text-xs">الحجم</TableHead>
                <TableHead className="text-xs">المعالجة</TableHead>
                <TableHead className="text-xs">الخلفية</TableHead>
                <TableHead className="text-xs">المصدر</TableHead>
                <TableHead className="text-xs">الحالة</TableHead>
                <TableHead className="text-xs">الزمن</TableHead>
                <TableHead className="text-xs text-center">توفير $</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8} className="h-12 animate-pulse bg-muted/20" />
                    </TableRow>
                  ))
                : jobs.map((job, idx) => {
                    const cfg = statusConfig[job.status] || statusConfig.pending;
                    const Icon = cfg.icon;
                    const date = new Date(job.startedAt);
                    const dateStr = date.toLocaleDateString("ar", { day: "numeric", month: "short" }) +
                      " " + date.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <motion.tr
                        key={job.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-xs font-mono max-w-[160px] truncate" title={job.fileName}>
                          {job.fileName}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatBytes(job.fileSize)}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="text-xs">
                            {processLabel[job.processType] || job.processType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {job.backgroundStyle ? styleLabel[job.backgroundStyle] || job.backgroundStyle : "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="text-xs">
                            {sourceLabel[job.source] || job.source}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                            <Icon className={`h-3 w-3 ${cfg.spin ? "animate-spin" : ""}`} />
                            {cfg.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                          {job.processingTimeMs ? `${(job.processingTimeMs / 1000).toFixed(1)}s` : dateStr}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {job.costSavedUsd > 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              ${job.costSavedUsd}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </motion.tr>
                    );
                  })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
