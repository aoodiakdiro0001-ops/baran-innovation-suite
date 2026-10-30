"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Database,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileSpreadsheet,
  Globe,
  Database as SqlIcon,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Pipeline = {
  id: string;
  type: string;
  status: string;
  durationMs: number | null;
  rowsAffected: number;
  operations: string | null;
};

type Dataset = {
  id: string;
  name: string;
  source: string;
  fileName: string | null;
  rowCount: number;
  columnCount: number;
  sizeBytes: number;
  qualityScore: number;
  missingValues: number;
  duplicates: number;
  status: string;
  uploadedAt: string;
  processedAt: string | null;
  pipelines: Pipeline[];
  insights: { id: string; type: string; title: string; severity: string; confidence: number }[];
};

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string; spin?: boolean }> = {
  analyzed: { label: "تم تحليله", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  cleaned: { label: "تم تنظيفه", icon: CheckCircle2, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  processing: { label: "قيد المعالجة", icon: Loader2, color: "text-yellow-500", bg: "bg-yellow-500/10", spin: true },
  raw: { label: "خام", icon: RefreshCw, color: "text-muted-foreground", bg: "bg-muted/10" },
  failed: { label: "فشل", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

const sourceIcon: Record<string, typeof Database> = {
  csv: FileSpreadsheet,
  json: FileSpreadsheet,
  sql: SqlIcon,
  api: Globe,
  manual: Database,
};

const sourceLabel: Record<string, string> = {
  csv: "CSV",
  json: "JSON",
  sql: "SQL",
  api: "API",
  manual: "يدوي",
};

export function DatasetsList() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Dataset | null>(null);

  const load = async () => {
    try {
      const r = await fetch("/api/data/datasets?limit=30");
      const d = await r.json();
      setDatasets(d.datasets || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const r = await fetch("/api/data/datasets?limit=30");
        const d = await r.json();
        setDatasets(d.datasets || []);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchInitial();
    const t = setInterval(load, 5000);
    const handler = () => load();
    window.addEventListener("data-dataset-created", handler);
    return () => {
      clearInterval(t);
      window.removeEventListener("data-dataset-created", handler);
    };
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const parseOps = (opsStr: string | null) => {
    if (!opsStr) return [];
    try {
      return JSON.parse(opsStr) as string[];
    } catch {
      return [];
    }
  };

  const runAnalyze = async (dataset: Dataset) => {
    toast.success(`🧠 بدأ التحليل الذكي لـ "${dataset.name}" بواسطة Gemini AI...`);
    try {
      // محاكاة استدعاء /api/data/analyze
      const summary = `مجموعة بيانات ${dataset.name}: ${dataset.rowCount} صف، ${dataset.columnCount} عمود، جودة ${dataset.qualityScore}%، ${dataset.missingValues} قيمة مفقودة، ${dataset.duplicates} مكرر.`;
      const res = await fetch("/api/data/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetName: dataset.name,
          summary,
          metrics: ["rows", "quality", "missing", "duplicates"],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success("✨ تم استخراج رؤى AI بنجاح!");
        load();
      }
    } catch {
      toast.error("خطأ في التحليل");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-amber-500" />
          <CardTitle className="text-sm">مصادر البيانات</CardTitle>
          <Badge variant="outline" className="text-xs">{datasets.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[480px] custom-scroll">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 rounded-md bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {datasets.map((ds, idx) => {
                const cfg = statusConfig[ds.status] || statusConfig.raw;
                const SIcon = sourceIcon[ds.source] || Database;
                const StatusIcon = cfg.icon;
                return (
                  <motion.div
                    key={ds.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelected(ds)}
                    className="group p-3 rounded-md border border-border bg-card/50 hover:border-amber-500/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-1.5 rounded-md bg-amber-500/10 shrink-0">
                          <SIcon className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{ds.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {sourceLabel[ds.source]} • {ds.rowCount.toLocaleString()} صف • {ds.columnCount} عمود • {formatBytes(ds.sizeBytes)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon className={`h-3 w-3 ${cfg.spin ? "animate-spin" : ""}`} />
                          {cfg.label}
                        </span>
                        <Badge variant="outline" className={`text-xs ${
                          ds.qualityScore >= 85 ? "severity-low" : ds.qualityScore >= 70 ? "severity-medium" : "severity-high"
                        }`}>
                          جودة: {ds.qualityScore}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                      <span>❌ {ds.missingValues} مفقود</span>
                      <span>•</span>
                      <span>♻️ {ds.duplicates} مكرر</span>
                      <span>•</span>
                      <span className="text-purple-600 dark:text-purple-400">{ds.insights.length} رؤية AI</span>
                      <span>•</span>
                      <span className="text-cyan-600 dark:text-cyan-400">{ds.pipelines.length} pipeline</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <Database className="h-5 w-5 text-amber-500" />
                  {selected.name}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  <span className="inline-flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">{sourceLabel[selected.source]}</Badge>
                    <Badge variant="outline" className="text-xs">{selected.rowCount.toLocaleString()} صف</Badge>
                    <Badge variant="outline" className="text-xs">{selected.columnCount} عمود</Badge>
                    <Badge variant="outline" className="text-xs">{formatBytes(selected.sizeBytes)}</Badge>
                    <Badge className={`text-xs ${
                      selected.qualityScore >= 85 ? "severity-low" : selected.qualityScore >= 70 ? "severity-medium" : "severity-high"
                    }`}>
                      جودة {selected.qualityScore}%
                    </Badge>
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-md bg-muted/20">
                    <div className="text-[10px] text-muted-foreground mb-0.5">قيم مفقودة</div>
                    <div className="text-sm font-semibold text-red-600 dark:text-red-400">{selected.missingValues}</div>
                  </div>
                  <div className="p-2 rounded-md bg-muted/20">
                    <div className="text-[10px] text-muted-foreground mb-0.5">صفوف مكررة</div>
                    <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">{selected.duplicates}</div>
                  </div>
                  <div className="p-2 rounded-md bg-muted/20">
                    <div className="text-[10px] text-muted-foreground mb-0.5">Pipelines</div>
                    <div className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">{selected.pipelines.length}</div>
                  </div>
                  <div className="p-2 rounded-md bg-muted/20">
                    <div className="text-[10px] text-muted-foreground mb-0.5">رؤى AI</div>
                    <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">{selected.insights.length}</div>
                  </div>
                </div>

                {/* Pipelines */}
                {selected.pipelines.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-cyan-500" />
                      عمليات ETL المُنفَّذة
                    </h4>
                    <div className="space-y-2">
                      {selected.pipelines.map((p) => {
                        const ops = parseOps(p.operations);
                        return (
                          <div key={p.id} className="p-2.5 rounded-md bg-muted/20 border border-border">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className="text-xs">{p.type}</Badge>
                              <Badge className={`text-xs ${
                                p.status === "completed" ? "severity-low" :
                                p.status === "running" ? "severity-medium" : "severity-high"
                              }`}>
                                {p.status === "completed" ? "مكتمل" : p.status === "running" ? "جارٍ" : "فشل"}
                              </Badge>
                            </div>
                            {p.durationMs && (
                              <div className="text-[10px] text-muted-foreground mb-1">
                                المدة: {(p.durationMs / 1000).toFixed(1)}s • الصفوف المتأثرة: {p.rowsAffected.toLocaleString()}
                              </div>
                            )}
                            {ops.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {ops.map((op, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] font-mono">
                                    {op}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Insights */}
                {selected.insights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">الرؤى المُستخرَجة</h4>
                    <div className="space-y-1.5">
                      {selected.insights.map((ins) => (
                        <div key={ins.id} className="text-xs p-2 rounded-md bg-muted/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`text-xs ${
                              ins.severity === "critical" ? "severity-critical" :
                              ins.severity === "high" ? "severity-high" :
                              ins.severity === "medium" ? "severity-medium" : "severity-low"
                            }`}>
                              {ins.severity}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">ثقة: {ins.confidence}%</span>
                          </div>
                          <div className="text-xs">{ins.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action */}
                <Button
                  size="sm"
                  className="w-full text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  onClick={() => runAnalyze(selected)}
                >
                  🧠 تشغيل التحليل الذكي بواسطة Gemini
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
