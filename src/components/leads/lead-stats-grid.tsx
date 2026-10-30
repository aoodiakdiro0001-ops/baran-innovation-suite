"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Send,
  Reply,
  Trophy,
  DollarSign,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type LeadStats = {
  overview: {
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
    interestedLeads: number;
    wonLeads: number;
    lostLeads: number;
    totalOutreaches: number;
    approvedOutreaches: number;
    sentOutreaches: number;
    repliedOutreaches: number;
    draftOutreaches: number;
    avgPersonalization: number;
    avgScore: number;
    totalCostSaved: number;
    totalRevenue: number;
    conversionRate: number;
    replyRate: number;
    activeCampaigns: number;
    totalCampaigns: number;
  };
};

const cards = [
  { key: "totalLeads", label: "عملاء محتملون", icon: Users, color: "text-rose-500", bg: "bg-rose-500/10" },
  { key: "wonLeads", label: "صفقات مغلقة", icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "totalOutreaches", label: "رسائل مُولَّدة", icon: Send, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { key: "repliedOutreaches", label: "ردود مستلمة", icon: Reply, color: "text-purple-500", bg: "bg-purple-500/10" },
  { key: "totalRevenue", label: "إيرادات متوقعة", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10", prefix: "$" },
  { key: "avgPersonalization", label: "نسبة التخصيص", icon: Target, color: "text-orange-500", bg: "bg-orange-500/10", suffix: "%" },
];

export function LeadStatsGrid() {
  const [data, setData] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch("/api/leads/stats");
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
            <Card className="relative overflow-hidden border-border/60 hover:border-rose-500/40 transition-colors">
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
                  {c.suffix && <span className="text-sm text-muted-foreground">{c.suffix}</span>}
                </div>
                {c.key === "totalLeads" && data.overview.conversionRate > 0 && (
                  <Badge variant="outline" className="mt-1.5 text-xs severity-low">
                    {data.overview.conversionRate}% تحويل
                  </Badge>
                )}
                {c.key === "repliedOutreaches" && data.overview.replyRate > 0 && (
                  <Badge variant="outline" className="mt-1.5 text-xs severity-medium">
                    {data.overview.replyRate}% استجابة
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
