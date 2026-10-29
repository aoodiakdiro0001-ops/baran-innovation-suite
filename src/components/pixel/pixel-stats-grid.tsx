"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  DollarSign,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PixelStats = {
  overview: {
    totalJobs: number;
    completedJobs: number;
    processingJobs: number;
    failedJobs: number;
    totalCostSaved: number;
    avgProcessingMs: number;
    successRate: number;
    totalTemplates: number;
  };
};

const cards = [
  { key: "totalJobs", label: "إجمالي الصور المعالجة", icon: ImageIcon, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
  { key: "completedJobs", label: "مكتملة بنجاح", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "processingJobs", label: "قيد المعالجة الآن", icon: Loader2, color: "text-yellow-500", bg: "bg-yellow-500/10", spin: true },
  { key: "totalCostSaved", label: "توفير بالدولار", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10", prefix: "$" },
  { key: "avgProcessingMs", label: "متوسط زمن المعالجة", icon: Clock, color: "text-cyan-500", bg: "bg-cyan-500/10", suffix: "ms" },
  { key: "totalTemplates", label: "قوالب الخلفيات", icon: Layers, color: "text-purple-500", bg: "bg-purple-500/10" },
];

export function PixelStatsGrid() {
  const [data, setData] = useState<PixelStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch("/api/pixel/stats");
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
    const t = setInterval(load, 15000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

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
        const value = c.key === "totalCostSaved" ? Math.round(raw).toLocaleString() : raw;
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <Card className="relative overflow-hidden border-border/60 hover:border-fuchsia-500/40 transition-colors">
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
                  {value}
                  {c.suffix && <span className="text-sm text-muted-foreground">{c.suffix}</span>}
                </div>
                {c.key === "completedJobs" && (
                  <Badge variant="outline" className="mt-1.5 text-xs severity-low">
                    {data.overview.successRate}% نجاح
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
