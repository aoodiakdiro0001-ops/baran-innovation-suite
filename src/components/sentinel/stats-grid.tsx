"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  Bug,
  Bell,
  Radar,
  Zap,
  Cpu,
  TrendingDown,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type StatsData = {
  overview: {
    totalScans: number;
    completedScans: number;
    runningScans: number;
    failedScans: number;
    openVulns: number;
    fixedVulns: number;
    inProgressVulns: number;
    ignoredVulns: number;
    totalVulns: number;
    avgRisk: number;
    totalAlerts: number;
    sentAlerts: number;
  };
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
};

const cardDefs = [
  {
    key: "totalScans",
    label: "إجمالي الفحوصات",
    icon: Radar,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    key: "openVulns",
    label: "ثغرات مفتوحة",
    icon: Bug,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    key: "fixedVulns",
    label: "ثغرات مُصلَحة",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    key: "avgRisk",
    label: "متوسط نقاط المخاطر",
    icon: ShieldAlert,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    suffix: "/100",
  },
  {
    key: "sentAlerts",
    label: "تنبيهات مُرسلة",
    icon: Bell,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    key: "runningScans",
    label: "فحوصات قيد التشغيل",
    icon: Activity,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
];

export function StatsGrid() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = () =>
      fetch("/api/stats")
        .then((r) => r.json())
        .then((d) => {
          if (mounted) {
            setData(d);
            setLoading(false);
          }
        })
        .catch(() => {
          if (mounted) setLoading(false);
        });

    load();
    const t = setInterval(load, 30000); // تحديث كل 30 ثانية
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
      {cardDefs.map((c, idx) => {
        const Icon = c.icon;
        const value = (data.overview as Record<string, number>)[c.key] ?? 0;
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <Card className="relative overflow-hidden border-border/60 hover:border-primary/40 transition-colors">
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
                  {value}
                  {c.suffix && (
                    <span className="text-sm text-muted-foreground">{c.suffix}</span>
                  )}
                </div>
                {c.key === "avgRisk" && (
                  <Badge
                    variant="outline"
                    className={`mt-1.5 text-xs ${
                      value >= 70
                        ? "severity-critical"
                        : value >= 40
                        ? "severity-medium"
                        : "severity-low"
                    }`}
                  >
                    {value >= 70 ? "حرج" : value >= 40 ? "متوسط" : "منخفض"}
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
