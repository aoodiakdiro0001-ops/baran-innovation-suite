"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Users,
  ShoppingBag,
  DollarSign,
  Smile,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SalesOverview = {
  totalConversations: number;
  activeConversations: number;
  aiHandled: number;
  humanEscalated: number;
  converted: number;
  totalRevenue: number;
  avgSatisfaction: number;
  avgResponseMs: number;
  totalMessages: number;
  kbItemsCount: number;
};

type SalesStatsResp = { overview: SalesOverview };

const cards = [
  { key: "totalConversations", label: "إجمالي المحادثات", icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { key: "activeConversations", label: "محادثات نشطة", icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { key: "converted", label: "مبيعات مغلقة", icon: ShoppingBag, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { key: "totalRevenue", label: "الإيرادات", icon: DollarSign, color: "text-indigo-500", bg: "bg-indigo-500/10", prefix: "$" },
  { key: "avgSatisfaction", label: "متوسط الرضا", icon: Smile, color: "text-indigo-500", bg: "bg-indigo-500/10", suffix: "%" },
  { key: "avgResponseMs", label: "زمن الاستجابة", icon: Clock, color: "text-indigo-500", bg: "bg-indigo-500/10", suffix: "ms" },
];

export function SalesStatsGrid() {
  const [data, setData] = useState<SalesStatsResp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch("/api/sales/stats");
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
        const display = c.key === "totalRevenue" && raw >= 1000 ? formatNum(raw) : raw;
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <Card className="relative overflow-hidden border-border/60 hover:border-indigo-500/40 transition-colors">
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
                  {display}
                  {c.suffix && <span className="text-sm text-muted-foreground"> {c.suffix}</span>}
                </div>
                {c.key === "totalConversations" && data.overview.aiHandled > 0 && (
                  <Badge variant="outline" className="mt-1.5 text-xs severity-low">
                    {data.overview.aiHandled} AI
                  </Badge>
                )}
                {c.key === "activeConversations" && data.overview.humanEscalated > 0 && (
                  <Badge variant="outline" className="mt-1.5 text-xs severity-medium">
                    {data.overview.humanEscalated} تحويل
                  </Badge>
                )}
                {c.key === "converted" && data.overview.totalConversations > 0 && (
                  <Badge variant="outline" className="mt-1.5 text-xs severity-low">
                    {Math.round((data.overview.converted / data.overview.totalConversations) * 100)}% تحويل
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
