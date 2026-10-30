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
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  FileText,
  Send,
  Copy,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Insight = {
  id: string;
  type: string;
  title: string;
  body: string;
  confidence: number;
  severity: string;
  metric: string | null;
  predictedValue: number | null;
  actualValue: number | null;
  recommendation: string | null;
  createdAt: string;
  dataset?: { name: string } | null;
};

const typeConfig: Record<string, { label: string; icon: typeof Brain; color: string; bg: string }> = {
  trend: { label: "اتجاه", icon: TrendingUp, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  anomaly: { label: "شذوذ", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
  prediction: { label: "تنبؤ", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10" },
  recommendation: { label: "توصية", icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  summary: { label: "ملخص", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10" },
};

const severityClass: Record<string, string> = {
  critical: "severity-critical",
  high: "severity-high",
  medium: "severity-medium",
  low: "severity-low",
  info: "severity-info",
};

const severityLabel: Record<string, string> = {
  critical: "حرج",
  high: "عالي",
  medium: "متوسط",
  low: "منخفض",
  info: "معلومة",
};

export function InsightsList() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Insight | null>(null);

  const load = async () => {
    try {
      const r = await fetch("/api/data/insights?limit=30");
      const d = await r.json();
      setInsights(d.insights || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const r = await fetch("/api/data/insights?limit=30");
        const d = await r.json();
        setInsights(d.insights || []);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchInitial();
    const handler = () => load();
    window.addEventListener("data-dataset-created", handler);
    return () => window.removeEventListener("data-dataset-created", handler);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-500" />
          <CardTitle className="text-sm">رؤى AI المُستخرَجة</CardTitle>
          <Badge variant="outline" className="text-xs">{insights.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[480px] custom-scroll pr-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-md bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {insights.map((ins, idx) => {
                const cfg = typeConfig[ins.type] || typeConfig.summary;
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={ins.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelected(ins)}
                    className="group p-3 rounded-md border border-border bg-card/50 hover:border-purple-500/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2 mb-1.5">
                      <div className={`p-1.5 rounded-md ${cfg.bg} shrink-0`}>
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant="outline" className="text-[10px]">{cfg.label}</Badge>
                          <Badge className={`text-[10px] ${severityClass[ins.severity] || severityClass.info}`}>
                            {severityLabel[ins.severity] || ins.severity}
                          </Badge>
                          {ins.confidence > 0 && (
                            <Badge variant="outline" className="text-[10px]">ثقة: {ins.confidence}%</Badge>
                          )}
                        </div>
                        <div className="text-sm font-medium line-clamp-2">{ins.title}</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{ins.body}</p>
                    {ins.dataset?.name && (
                      <div className="mt-1.5 text-[10px] text-muted-foreground">
                        📊 المصدر: <span className="font-mono">{ins.dataset.name}</span>
                      </div>
                    )}
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
                  <Brain className="h-5 w-5 text-purple-500" />
                  {selected.title}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  <span className="inline-flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">{typeConfig[selected.type]?.label || selected.type}</Badge>
                    <Badge className={`text-xs ${severityClass[selected.severity] || severityClass.info}`}>
                      {severityLabel[selected.severity] || selected.severity}
                    </Badge>
                    {selected.confidence > 0 && (
                      <Badge variant="outline" className="text-xs">درجة الثقة: {selected.confidence}%</Badge>
                    )}
                    {selected.metric && (
                      <Badge variant="outline" className="text-xs font-mono">{selected.metric}</Badge>
                    )}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Body */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">التحليل</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selected.body}</p>
                </div>

                {/* Values */}
                {(selected.predictedValue !== null || selected.actualValue !== null) && (
                  <div className="grid grid-cols-2 gap-3">
                    {selected.actualValue !== null && (
                      <div className="p-3 rounded-md bg-muted/20 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">القيمة الفعلية</div>
                        <div className="text-lg font-bold">{selected.actualValue.toLocaleString()}</div>
                      </div>
                    )}
                    {selected.predictedValue !== null && (
                      <div className="p-3 rounded-md bg-purple-500/10 border border-purple-500/30">
                        <div className="text-xs text-muted-foreground mb-1">القيمة المتوقعة</div>
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{selected.predictedValue.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendation */}
                {selected.recommendation && (
                  <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30">
                    <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4 text-emerald-500" />
                      التوصية العملية
                    </h4>
                    <p className="text-sm leading-relaxed">{selected.recommendation}</p>
                  </div>
                )}

                {/* Source */}
                {selected.dataset?.name && (
                  <div className="text-[10px] text-muted-foreground">
                    📊 مصدر البيانات: <span className="font-mono">{selected.dataset.name}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(`${selected.title}\n\n${selected.body}\n\nالتوصية: ${selected.recommendation || "—"}`);
                      toast.success("تم نسخ الرؤية");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 ml-1.5" />
                    نسخ الرؤية
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => toast.success("تم إرسال الرؤية عبر تليجرام (محاكاة)")}
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
