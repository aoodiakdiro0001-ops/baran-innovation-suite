"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  CheckCircle2,
  Loader2,
  Brain,
  AlertTriangle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DataStats = {
  overview: {
    totalDatasets: number;
    analyzedDatasets: number;
    cleanedDatasets: number;
    processingDatasets: number;
    rawDatasets: number;
    totalRows: number;
    totalSize: number;
    avgQuality: number;
    completedPipelines: number;
    avgPipelineMs: number;
    totalInsights: number;
    criticalInsights: number;
    highInsights: number;
    mediumInsights: number;
    totalAnomalies: number;
    criticalAnomalies: number;
    highAnomalies: number;
    notifiedAnomalies: number;
  };
};

const cards = [
  { key: "totalDatasets", label: "مصادر البيانات", icon: Database, color: "text-amber-500", bg: "bg-amber-500/10" },
  { key: "totalRows", label: "إجمالي الصفوف", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "avgQuality", label: "متوسط جودة البيانات", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", suffix: "%" },
  { key: "totalInsights", label: "رؤى AI مُستخرَجة", icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
  { key: "totalAnomalies", label: "شذوذ مكتشَف", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
  { key: "processingDatasets", label: "قيد المعالجة", icon: Loader2, color: "text-yellow-500", bg: "bg-yellow-500/10", spin: true },
];

export function DataStatsGrid() {
  const [data, setData] = useState<DataStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch("/api/data/stats");
        const d = await r.json();
        if (mounted) {
          setData(d);
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

  const formatNum = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 h-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        const raw = (data.overview as Record<string, number>)[c.key] ?? 0;
        const display = c.key === "totalRows" ? formatNum(raw) : raw;
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <Card className="relative overflow-hidden border-border/60 hover:border-amber-500/40 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {c.label}
                </CardTitle>
                <div className={`p-1.5 rounded-md ${c.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${c.color} ${c.spin ? "animate-spin" : ""}`} />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold tabular-nums">
                  {display}
                  {c.suffix && <span className="text-sm text-muted-foreground">{c.suffix}</span>}
                </div>
                {c.key === "totalAnomalies" && data.overview.criticalAnomalies > 0 && (
                  <Badge className="severity-critical text-xs mt-1.5">
                    {data.overview.criticalAnomalies} حرج
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
