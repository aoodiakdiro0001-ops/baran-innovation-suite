"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Bell, BellOff, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

type Anomaly = {
  id: string;
  metric: string;
  value: number;
  expectedRange: string;
  severity: string;
  description: string;
  detectedAt: string;
  notified: boolean;
};

const severityClass: Record<string, string> = {
  critical: "severity-critical",
  high: "severity-high",
  medium: "severity-medium",
  low: "severity-low",
};

const severityLabel: Record<string, string> = {
  critical: "حرج",
  high: "عالٍ",
  medium: "متوسط",
  low: "منخفض",
};

const metricLabel: Record<string, string> = {
  sales: "المبيعات",
  cost: "التكاليف",
  errors: "الأخطاء",
  latency: "زمن الاستجابة",
  churn: "هجرة العملاء",
  refund: "المرتجعات",
  signup: "التسجيلات",
};

const metricIcon: Record<string, string> = {
  sales: "💰",
  cost: "💸",
  errors: "⚠️",
  latency: "⏱️",
  churn: "🚪",
  refund: "↩️",
  signup: "✍️",
};

export function AnomaliesList() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch("/api/data/anomalies?limit=20");
        const d = await r.json();
        if (mounted) {
          setAnomalies(d.anomalies || []);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  const parseRange = (rangeStr: string) => {
    try {
      const arr = JSON.parse(rangeStr) as [number, number];
      return arr;
    } catch {
      return [0, 0] as [number, number];
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <CardTitle className="text-sm">الشذوذ المكتشَف</CardTitle>
          <Badge variant="outline" className="text-xs">{anomalies.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[360px] custom-scroll pr-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-md bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : anomalies.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500 opacity-50" />
              لا توجد شذوذ — كل المقاييس ضمن النطاق المتوقع
            </div>
          ) : (
            <div className="space-y-2">
              {anomalies.map((an, idx) => {
                const range = parseRange(an.expectedRange);
                const ratio = range[1] > 0 ? an.value / range[1] : 0;
                return (
                  <motion.div
                    key={an.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`p-3 rounded-lg border ${
                      an.severity === "critical"
                        ? "border-red-500/30 bg-red-500/5"
                        : an.severity === "high"
                        ? "border-orange-500/30 bg-orange-500/5"
                        : "border-yellow-500/20 bg-yellow-500/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-base shrink-0">{metricIcon[an.metric] || "⚠️"}</span>
                        <span className="text-xs font-medium truncate">
                          {metricLabel[an.metric] || an.metric}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge className={`text-xs ${severityClass[an.severity] || severityClass.low}`}>
                          {severityLabel[an.severity] || an.severity}
                        </Badge>
                        {an.notified ? (
                          <Bell className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <BellOff className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">{an.description}</p>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">
                        المتوقع: <span className="font-mono">{range[0].toLocaleString()} - {range[1].toLocaleString()}</span>
                      </span>
                      <span className={`font-mono font-bold ${
                        ratio > 1 ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"
                      }`}>
                        القيمة: {an.value.toLocaleString()} ({ratio.toFixed(1)}x)
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
