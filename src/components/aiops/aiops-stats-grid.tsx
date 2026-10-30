"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Activity,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AiopsOverview = {
  totalServices: number;
  upServices: number;
  downServices: number;
  degradedServices: number;
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  autoHealedCount: number;
  avgUptime: number;
  avgResponseMs: number;
  totalCostSaved: number;
};

type AiopsStats = {
  overview: AiopsOverview;
};

const cards = [
  { key: "totalServices", label: "خدمات مراقَبة", icon: Server, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "upServices", label: "تعمل بسلاسة", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "openIncidents", label: "حوادث مفتوحة", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
  { key: "autoHealedCount", label: "إصلاح ذاتي", icon: Wrench, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { key: "avgUptime", label: "متوسط Uptime", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10", suffix: "%" },
  { key: "totalCostSaved", label: "توفير $", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", prefix: "$" },
];

export function AiopsStatsGrid() {
  const [data, setData] = useState<AiopsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchInitial = async () => {
      try {
        const r = await fetch("/api/aiops/stats");
        const d = await r.json();
        if (mounted) {
          setData(d);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };
    fetchInitial();
    const t = setInterval(async () => {
      try {
        const r = await fetch("/api/aiops/stats");
        const d = await r.json();
        if (mounted) setData(d);
      } catch {
        /* ignore */
      }
    }, 30000);
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
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <Card className="relative overflow-hidden border-border/60 hover:border-blue-500/40 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {c.label}
                </CardTitle>
                <div className={`p-1.5 rounded-md ${c.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${c.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold tabular-nums">
                  {c.prefix && <span className="text-base text-muted-foreground">{c.prefix}</span>}
                  {raw}
                  {c.suffix && <span className="text-sm text-muted-foreground">{c.suffix}</span>}
                </div>
                {c.key === "openIncidents" && data.overview.downServices > 0 && (
                  <Badge className="mt-1.5 text-xs severity-critical">
                    {data.overview.downServices} متوقف
                  </Badge>
                )}
                {c.key === "autoHealedCount" && data.overview.totalIncidents > 0 && (
                  <Badge variant="outline" className="mt-1.5 text-xs severity-low">
                    {Math.round((data.overview.autoHealedCount / data.overview.totalIncidents) * 100)}% آلي
                  </Badge>
                )}
                {c.key === "avgUptime" && data.overview.avgResponseMs > 0 && (
                  <Badge variant="outline" className="mt-1.5 text-xs">
                    {data.overview.avgResponseMs}ms استجابة
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
