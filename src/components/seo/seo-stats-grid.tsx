"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Trophy,
  TrendingUp,
  TrendingDown,
  Eye,
  PenLine,
  Target,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SeoStats = {
  overview: {
    totalKeywords: number;
    trackedKeywords: number;
    wonKeywords: number;
    lostKeywords: number;
    opportunityKeywords: number;
    top1: number;
    top3: number;
    top10: number;
    avgRank: number;
    improved: number;
    dropped: number;
    competitorsCount: number;
    contentCount: number;
    totalEstTraffic: number;
    avgSeoScore: number;
    totalSearchVolume: number;
  };
};

const cards = [
  { key: "totalKeywords", label: "كلمات مُتتبَّعة", icon: Search, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "top10", label: "في أول 10 نتائج", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { key: "improved", label: "تحسّنت هذا الأسبوع", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", suffix: "+" },
  { key: "dropped", label: "تراجعت", icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" },
  { key: "totalEstTraffic", label: "زيارات متوقعة/شهر", icon: Eye, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { key: "contentCount", label: "مقالات مُولَّدة", icon: PenLine, color: "text-purple-500", bg: "bg-purple-500/10" },
];

export function SeoStatsGrid() {
  const [data, setData] = useState<SeoStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch("/api/seo/stats");
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
        const value = (data.overview as Record<string, number>)[c.key] ?? 0;
        const displayValue =
          c.key === "totalEstTraffic" && value >= 1000
            ? `${(value / 1000).toFixed(1)}K`
            : value;
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <Card className="relative overflow-hidden border-border/60 hover:border-emerald-500/40 transition-colors">
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
                  {displayValue}
                  {c.suffix && <span className="text-emerald-500">{c.suffix}</span>}
                </div>
                {c.key === "top10" && data.overview.top1 > 0 && (
                  <Badge variant="outline" className="mt-1.5 text-xs severity-low">
                    {data.overview.top1} في الصدارة
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
