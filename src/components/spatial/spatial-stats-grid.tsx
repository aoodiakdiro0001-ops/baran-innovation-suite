"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  CheckCircle2,
  Loader2,
  XCircle,
  TrendingDown,
  DollarSign,
  Clock,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SpatialStats = {
  overview: {
    totalAssets: number;
    readyAssets: number;
    processingAssets: number;
    failedAssets: number;
    totalPolygonsReduced: number;
    totalSizeBytes: number;
    totalCostSaved: number;
    avgDecimationRatio: number;
    avgGenerationMs: number;
  };
};

const cards = [
  { key: "totalAssets", label: "مجسمات مُولَّدة", icon: Box, color: "text-violet-500", bg: "bg-violet-500/10" },
  { key: "readyAssets", label: "جاهزة للتنزيل", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "processingAssets", label: "قيد التوليد", icon: Loader2, color: "text-yellow-500", bg: "bg-yellow-500/10", spin: true },
  { key: "totalPolygonsReduced", label: "مضلعات مُقلَّصة", icon: TrendingDown, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { key: "totalCostSaved", label: "توفير بالدولار", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10", prefix: "$" },
  { key: "avgDecimationRatio", label: "نسبة الـ Decimation", icon: Layers, color: "text-orange-500", bg: "bg-orange-500/10", suffix: "%" },
];

export function SpatialStatsGrid() {
  const [data, setData] = useState<SpatialStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch("/api/spatial/stats");
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
        const display = c.key === "totalPolygonsReduced" ? formatNum(raw) : raw;
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <Card className="relative overflow-hidden border-border/60 hover:border-violet-500/40 transition-colors">
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
                  {c.prefix && <span className="text-base text-muted-foreground">{c.prefix}</span>}
                  {display}
                  {c.suffix && <span className="text-sm text-muted-foreground">{c.suffix}</span>}
                </div>
                {c.key === "readyAssets" && data.overview.failedAssets > 0 && (
                  <Badge className="severity-high text-xs mt-1.5">
                    {data.overview.failedAssets} فشل
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
