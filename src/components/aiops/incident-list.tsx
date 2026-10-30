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
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Loader2,
  Wrench,
  Clock,
  Brain,
  Copy,
  Terminal,
  RefreshCw,
  Server,
  Users,
  DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Remediation = {
  id: string;
  type: string;
  action: string;
  aiSuggested: boolean;
  aiReasoning: string | null;
  status: string;
  output: string | null;
  executedAt: string | null;
  durationMs: number;
  costSavedUsd: number;
  createdAt: string;
};

type Incident = {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceType: string;
  servicePriority: string;
  severity: string;
  status: string;
  type: string;
  title: string;
  description: string;
  logs: string | null;
  rootCause: string | null;
  startedAt: string;
  detectedAt: string | null;
  diagnosedAt: string | null;
  healedAt: string | null;
  resolvedAt: string | null;
  durationSec: number;
  affectedUsers: number;
  costImpactUsd: number;
  remediations: Remediation[];
};

const severityConfig: Record<
  string,
  { label: string; class: string; icon: typeof AlertTriangle }
> = {
  critical: { label: "حرج", class: "severity-critical", icon: XCircle },
  high: { label: "عالي", class: "severity-high", icon: AlertTriangle },
  medium: { label: "متوسط", class: "severity-medium", icon: AlertTriangle },
  low: { label: "منخفض", class: "severity-low", icon: CheckCircle2 },
};

const statusConfig: Record<
  string,
  { label: string; class: string; icon: typeof Clock }
> = {
  open: { label: "مفتوح", class: "bg-red-500/15 text-red-500 border-red-500/30", icon: XCircle },
  investigating: { label: "تحقيق", class: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30", icon: Loader2 },
  diagnosed: { label: "مُشخّص", class: "bg-purple-500/15 text-purple-500 border-purple-500/30", icon: Brain },
  healing: { label: "إصلاح", class: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30", icon: Wrench },
  resolved: { label: "حُلّ", class: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30", icon: CheckCircle2 },
  failed: { label: "فشل", class: "bg-muted text-muted-foreground border-border", icon: XCircle },
};

const typeLabel: Record<string, string> = {
  downtime: "انقطاع",
  high_cpu: "CPU عالٍ",
  high_memory: "ذاكرة عالية",
  error_rate: "معدل أخطاء",
  timeout: "انتهاء مهلة",
  crash: "انهيار",
  disk_full: "قرص ممتلئ",
  slow_response: "استجابة بطيئة",
};

const remediationTypeLabel: Record<string, string> = {
  auto_restart: "إعادة تشغيل",
  clear_cache: "مسح الذاكرة",
  kill_process: "إيقاف عملية",
  scale_up: "توسيع",
  failover: "تجاوز الفشل",
  notify: "تنبيه",
  custom: "مخصّص",
};

const remediationStatus: Record<string, { label: string; class: string }> = {
  pending: { label: "مُعلَّق", class: "bg-muted text-muted-foreground border-border" },
  executing: { label: "قيد التنفيذ", class: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30" },
  success: { label: "نجح", class: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  failed: { label: "فشل", class: "bg-red-500/15 text-red-500 border-red-500/30" },
  skipped: { label: "تجاوز", class: "bg-muted text-muted-foreground border-border" },
};

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}d ${sec % 60}s`;
  return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}d`;
}

export function IncidentList() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Incident | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchInitial = async () => {
      try {
        const r = await fetch("/api/aiops/incidents?limit=30");
        const d = await r.json();
        if (mounted) {
          setIncidents(d.incidents || []);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };
    fetchInitial();
    const t = setInterval(async () => {
      if (mounted) setRefreshing(true);
      try {
        const r = await fetch("/api/aiops/incidents?limit=30");
        const d = await r.json();
        if (mounted) setIncidents(d.incidents || []);
      } catch {
        /* ignore */
      } finally {
        if (mounted) setRefreshing(false);
      }
    }, 15000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-blue-500/20">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-sm">سجل الحوادث (Incidents)</CardTitle>
            <Badge variant="outline" className="text-xs">
              {incidents.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <RefreshCw
              className={`h-3 w-3 ${refreshing ? "animate-spin text-blue-500" : ""}`}
            />
            تحديث تلقائي كل 15s
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[520px] custom-scroll pr-2">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 rounded-md bg-muted/20 animate-pulse"
                  />
                ))}
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                لا توجد حوادث.
              </div>
            ) : (
              <div className="space-y-2">
                {incidents.map((inc, idx) => {
                  const sevCfg = severityConfig[inc.severity] || severityConfig.medium;
                  const stCfg = statusConfig[inc.status] || statusConfig.open;
                  const SevIcon = sevCfg.icon;
                  const StIcon = stCfg.icon;
                  const openRemediations = inc.remediations.filter(
                    (r) => r.status === "success"
                  ).length;
                  return (
                    <motion.div
                      key={inc.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => setSelected(inc)}
                      className="group p-3 rounded-md border border-border bg-card/50 hover:border-blue-500/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <SevIcon
                            className={`h-3.5 w-3.5 ${
                              inc.severity === "critical" || inc.severity === "high"
                                ? "text-red-500"
                                : "text-yellow-500"
                            } shrink-0`}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-medium line-clamp-1">{inc.title}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Server className="h-2.5 w-2.5" />
                              {inc.serviceName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge className={`text-[10px] ${sevCfg.class}`}>{sevCfg.label}</Badge>
                          <Badge className={`text-[10px] ${stCfg.class}`}>
                            <StIcon className="h-2.5 w-2.5 ml-0.5" />
                            {stCfg.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">
                          {typeLabel[inc.type] || inc.type}
                        </Badge>
                        {inc.durationSec > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {formatDuration(inc.durationSec)}
                            </span>
                          </>
                        )}
                        {inc.affectedUsers > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-orange-600 dark:text-orange-400">
                              <Users className="h-2.5 w-2.5" />
                              {inc.affectedUsers.toLocaleString()}
                            </span>
                          </>
                        )}
                        {inc.remediations.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400">
                              <Wrench className="h-2.5 w-2.5" />
                              {inc.remediations.length} إصلاح ({openRemediations} نجح)
                            </span>
                          </>
                        )}
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scroll">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-blue-500" />
                    {selected.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    <span className="inline-flex items-center gap-2 mt-1 flex-wrap">
                      <Badge className={`text-xs ${severityConfig[selected.severity]?.class || ""}`}>
                        {severityConfig[selected.severity]?.label || selected.severity}
                      </Badge>
                      <Badge className={`text-xs ${statusConfig[selected.status]?.class || ""}`}>
                        {statusConfig[selected.status]?.label || selected.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {typeLabel[selected.type] || selected.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Server className="h-2.5 w-2.5 ml-0.5" />
                        {selected.serviceName}
                      </Badge>
                    </span>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-semibold mb-1">الوصف</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selected.description}
                    </p>
                  </div>

                  {/* Error Logs */}
                  {selected.logs && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold flex items-center gap-1.5">
                          <Terminal className="h-4 w-4 text-orange-500" />
                          سجلات الأخطاء
                        </h4>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => {
                            navigator.clipboard.writeText(selected.logs || "");
                            toast.success("تم نسخ السجلات");
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <pre
                        className="bg-zinc-900 text-orange-300 rounded-md p-3 text-xs font-mono overflow-x-auto border border-orange-500/30 max-h-[200px] overflow-y-auto custom-scroll"
                        dir="ltr"
                      >
                        <code>{selected.logs}</code>
                      </pre>
                    </div>
                  )}

                  {/* AI Root Cause */}
                  {selected.rootCause && (
                    <div className="p-3 rounded-md bg-purple-500/10 border border-purple-500/30">
                      <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                        <Brain className="h-4 w-4 text-purple-500" />
                        تحليل AI للسبب الجذري
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selected.rootCause}
                      </p>
                    </div>
                  )}

                  {/* Remediations list */}
                  {selected.remediations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                        <Wrench className="h-4 w-4 text-emerald-500" />
                        إجراءات الإصلاح ({selected.remediations.length})
                      </h4>
                      <div className="space-y-2">
                        {selected.remediations.map((r) => {
                          const rmCfg = remediationStatus[r.status] || remediationStatus.pending;
                          return (
                            <div
                              key={r.id}
                              className="p-3 rounded-md bg-muted/20 border border-border"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Badge variant="outline" className="text-[10px]">
                                    {remediationTypeLabel[r.type] || r.type}
                                  </Badge>
                                  <Badge className={`text-[10px] ${rmCfg.class}`}>
                                    {rmCfg.label}
                                  </Badge>
                                  {r.aiSuggested && (
                                    <Badge variant="outline" className="text-[10px] severity-low">
                                      <Brain className="h-2.5 w-2.5 ml-0.5" />
                                      AI
                                    </Badge>
                                  )}
                                  {r.durationMs > 0 && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {r.durationMs}ms
                                    </span>
                                  )}
                                  {r.costSavedUsd > 0 && (
                                    <Badge variant="outline" className="text-[10px] text-emerald-500">
                                      <DollarSign className="h-2.5 w-2.5 ml-0.5" />$
                                      {r.costSavedUsd}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <pre
                                className="bg-zinc-900 text-emerald-300 rounded p-2 text-[11px] font-mono overflow-x-auto border border-emerald-500/20"
                                dir="ltr"
                              >
                                <code>{r.action}</code>
                              </pre>
                              {r.aiReasoning && (
                                <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1">
                                  <Brain className="h-3 w-3 mt-0.5 text-purple-500 shrink-0" />
                                  <span>{r.aiReasoning}</span>
                                </div>
                              )}
                              {r.output && (
                                <div className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                                  <span className="text-muted-foreground">→ </span>
                                  {r.output}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Impact */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-md bg-muted/20">
                      <Clock className="h-3.5 w-3.5 mx-auto text-cyan-500 mb-1" />
                      <div className="text-[10px] text-muted-foreground">المدة</div>
                      <div className="text-xs font-bold">
                        {formatDuration(selected.durationSec)}
                      </div>
                    </div>
                    <div className="p-2 rounded-md bg-muted/20">
                      <Users className="h-3.5 w-3.5 mx-auto text-orange-500 mb-1" />
                      <div className="text-[10px] text-muted-foreground">المتأثرون</div>
                      <div className="text-xs font-bold">
                        {selected.affectedUsers.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2 rounded-md bg-muted/20">
                      <DollarSign className="h-3.5 w-3.5 mx-auto text-red-500 mb-1" />
                      <div className="text-[10px] text-muted-foreground">التكلفة</div>
                      <div className="text-xs font-bold text-orange-600">
                        ${selected.costImpactUsd}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </motion.div>
  );
}
