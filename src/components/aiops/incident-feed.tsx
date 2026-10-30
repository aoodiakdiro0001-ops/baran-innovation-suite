"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertTriangle, XCircle, CheckCircle2, Loader2, Wrench,
  Clock, Brain, Copy, Terminal,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Incident = {
  id: string; severity: string; type: string; title: string; description: string;
  logs: string | null; rootCause: string | null; suggestedFix: string | null;
  status: string; detectedAt: string; resolvedAt: string | null; durationSec: number;
  affectedUsers: number; costImpactUsd: number; autoHealed: boolean;
  falsePositive: boolean; remediationCmd: string | null; aiModel: string | null;
  aiConfidence: number;
  server?: { name: string; hostname: string };
  remediations?: { id: string; type: string; status: string; command: string; description: string; successRate: boolean }[];
};

const severityConfig: Record<string, { label: string; class: string; icon: typeof AlertTriangle }> = {
  emergency: { label: "طوارئ", class: "severity-critical", icon: XCircle },
  critical: { label: "حرج", class: "severity-critical", icon: AlertTriangle },
  warning: { label: "تحذير", class: "severity-high", icon: AlertTriangle },
  info: { label: "معلومة", class: "severity-info", icon: CheckCircle2 },
};

const statusConfig: Record<string, { label: string; class: string; icon: typeof Clock }> = {
  open: { label: "مفتوح", class: "bg-red-500/15 text-red-500 border-red-500/30", icon: XCircle },
  diagnosing: { label: "تشخيص", class: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30", icon: Loader2 },
  healing: { label: "إصلاح", class: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30", icon: Wrench },
  resolved: { label: "حُلّ", class: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30", icon: CheckCircle2 },
  false_positive: { label: "false+", class: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
};

const typeLabel: Record<string, string> = {
  downtime: "انقطاع", high_cpu: "CPU عالٍ", high_memory: "ذاكرة عالية",
  high_disk: "قرص ممتلئ", error_500: "أخطاء 500", slow_response: "استجابة بطيئة",
  crash: "انهيار", oom: "نفاد ذاكرة",
};

export function IncidentFeed() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Incident | null>(null);

  const load = async () => {
    try {
      const r = await fetch("/api/aiops/incidents?limit=20");
      const d = await r.json();
      setIncidents(d.incidents || []);
      setLoading(false);
    } catch { setLoading(false); }
  };

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const r = await fetch("/api/aiops/incidents?limit=20");
        const d = await r.json();
        setIncidents(d.incidents || []);
        setLoading(false);
      } catch { setLoading(false); }
    };
    fetchInitial();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/aiops/incidents?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`تم تحديث: ${statusConfig[status]?.label || status}`);
        load();
      }
    } catch { toast.error("فشل التحديث"); }
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <CardTitle className="text-sm">سجل الحوادث (Incidents)</CardTitle>
          <Badge variant="outline" className="text-xs">{incidents.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[480px] custom-scroll pr-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-md bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {incidents.map((inc, idx) => {
                const sevCfg = severityConfig[inc.severity] || severityConfig.warning;
                const stCfg = statusConfig[inc.status] || statusConfig.open;
                const SevIcon = sevCfg.icon;
                const StIcon = stCfg.icon;
                return (
                  <motion.div
                    key={inc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelected(inc)}
                    className="group p-3 rounded-md border border-border bg-card/50 hover:border-orange-500/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <SevIcon className={`h-3.5 w-3.5 ${sevCfg.class.includes("critical") ? "text-red-500" : "text-orange-500"} shrink-0`} />
                        <div className="min-w-0">
                          <div className="text-xs font-medium line-clamp-1">{inc.title}</div>
                          <div className="text-[10px] text-muted-foreground">{inc.server?.name || "—"}</div>
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
                      <span>⚡ {typeLabel[inc.type] || inc.type}</span>
                      {inc.aiConfidence > 0 && (
                        <><span>•</span><span className="text-purple-600 dark:text-purple-400">🧠 {inc.aiConfidence}%</span></>
                      )}
                      {inc.autoHealed && (
                        <><span>•</span><span className="text-emerald-600 dark:text-emerald-400">✅ auto-healed</span></>
                      )}
                      {inc.durationSec > 0 && (
                        <><span>•</span><span>⏱ {inc.durationSec}s</span></>
                      )}
                      {inc.affectedUsers > 0 && (
                        <><span>•</span><span className="text-orange-600 dark:text-orange-400">👥 {inc.affectedUsers.toLocaleString()}</span></>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scroll">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
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
                    <Badge variant="outline" className="text-xs">{typeLabel[selected.type] || selected.type}</Badge>
                    {selected.server && <Badge variant="outline" className="text-xs">{selected.server.name}</Badge>}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold mb-1">الوصف</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
                </div>

                {/* Logs */}
                {selected.logs && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold flex items-center gap-1.5">
                        <Terminal className="h-4 w-4 text-orange-500" />
                        سجلات الأخطاء
                      </h4>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(selected.logs || ""); toast.success("تم نسخ السجلات"); }}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <pre className="bg-zinc-900 text-orange-300 rounded-md p-3 text-xs font-mono overflow-x-auto border border-orange-500/30 max-h-[200px] overflow-y-auto custom-scroll" dir="ltr">
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
                      <Badge variant="outline" className="text-[10px] ml-auto">{selected.aiModel}</Badge>
                      <Badge variant="outline" className="text-[10px]">ثقة: {selected.aiConfidence}%</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selected.rootCause}</p>
                  </div>
                )}

                {/* Suggested Fix */}
                {selected.suggestedFix && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                      <Wrench className="h-4 w-4 text-emerald-500" />
                      الإصلاح المقترح
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{selected.suggestedFix}</p>
                  </div>
                )}

                {/* Remediation Command */}
                {selected.remediationCmd && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold">أمر الإصلاح المُنفَّذ</h4>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(selected.remediationCmd || ""); toast.success("تم نسخ الأمر"); }}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <pre className="bg-zinc-900 text-emerald-300 rounded-md p-3 text-xs font-mono overflow-x-auto border border-emerald-500/30" dir="ltr">
                      <code>{selected.remediationCmd}</code>
                    </pre>
                  </div>
                )}

                {/* Impact */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-md bg-muted/20">
                    <Clock className="h-3.5 w-3.5 mx-auto text-cyan-500 mb-1" />
                    <div className="text-[10px] text-muted-foreground">المدة</div>
                    <div className="text-xs font-bold">{selected.durationSec}s</div>
                  </div>
                  <div className="p-2 rounded-md bg-muted/20">
                    <span className="text-sm">👥</span>
                    <div className="text-[10px] text-muted-foreground mt-1">المتأثرون</div>
                    <div className="text-xs font-bold">{selected.affectedUsers.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded-md bg-muted/20">
                    <span className="text-sm">💰</span>
                    <div className="text-[10px] text-muted-foreground mt-1">التكلفة</div>
                    <div className="text-xs font-bold text-orange-600">${selected.costImpactUsd}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  {selected.status === "open" && (
                    <Button size="sm" className="text-xs bg-gradient-to-r from-sky-500 to-cyan-500 text-white" onClick={() => updateStatus(selected.id, "healing")}>
                      <Wrench className="h-3.5 w-3.5 ml-1.5" />
                      ابدأ الإصلاح
                    </Button>
                  )}
                  {selected.status !== "resolved" && selected.status !== "false_positive" && (
                    <>
                      <Button size="sm" variant="outline" className="text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => updateStatus(selected.id, "resolved")}>
                        <CheckCircle2 className="h-3.5 w-3.5 ml-1.5" />
                        تم الحل
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => updateStatus(selected.id, "false_positive")}>
                        False Positive
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
