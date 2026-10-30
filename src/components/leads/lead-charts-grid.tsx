"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, PieChart as PieIcon, BarChart3, Trophy } from "lucide-react";

type Daily = { date: string; leads: number; outreaches: number; sent: number; replies: number; won: number; revenue: number };
type LeadCharts = {
  dailyStats: Daily[];
  industryCounts: Record<string, number>;
  stageCounts: Record<string, number>;
};

const INDUSTRY_COLORS = ["#f43f5e", "#06b6d4", "#a855f7", "#10b981", "#f59e0b", "#84cc16"];
const STAGE_COLORS = ["#94a3b8", "#06b6d4", "#a855f7", "#f59e0b", "#10b981"];

const industryLabels: Record<string, string> = {
  ecommerce: "متاجر",
  saas: "SaaS",
  agency: "وكالات",
  gaming: "ألعاب",
  retail: "تجزئة",
};

const stageLabels: Record<string, string> = {
  discovery: "اكتشاف",
  qualified: "مؤهّل",
  proposal: "عرض",
  negotiation: "تفاوض",
  closed: "مغلق",
};

export function LeadChartsGrid() {
  const [data, setData] = useState<LeadCharts | null>(null);
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
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 h-72" />
          </Card>
        ))}
      </div>
    );
  }

  const industryData = Object.entries(data.industryCounts).map(([key, value], idx) => ({
    name: industryLabels[key] || key,
    value,
    color: INDUSTRY_COLORS[idx % INDUSTRY_COLORS.length],
  }));

  const stageData = Object.entries(data.stageCounts).map(([key, value], idx) => ({
    name: stageLabels[key] || key,
    value,
    color: STAGE_COLORS[idx % STAGE_COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Daily funnel */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Activity className="h-4 w-4 text-rose-500" />
          <CardTitle className="text-sm">مسار الصيد اليومي (آخر 14 يوم)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.dailyStats}>
              <defs>
                <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outreachesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="repliesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                tickFormatter={(v: string) => v.split("-").slice(1).join("/")}
                stroke="rgba(255,255,255,0.2)"
              />
              <YAxis tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} stroke="rgba(255,255,255,0.2)" allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(20,20,30,0.95)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#f43f5e" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Area type="monotone" dataKey="leads" name="عملاء جدد" stroke="#f43f5e" strokeWidth={2.5} fill="url(#leadsGrad)" />
              <Area type="monotone" dataKey="outreaches" name="رسائل" stroke="#06b6d4" strokeWidth={2} fill="url(#outreachesGrad)" />
              <Area type="monotone" dataKey="replies" name="ردود" stroke="#a855f7" strokeWidth={1.5} fill="url(#repliesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Industry pie */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <PieIcon className="h-4 w-4 text-purple-500" />
          <CardTitle className="text-sm">توزيع الصناعات</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={industryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
              >
                {industryData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="rgba(0,0,0,0.3)" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "rgba(20,20,30,0.95)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "8px", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pipeline stages bar */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Trophy className="h-4 w-4 text-emerald-500" />
          <CardTitle className="text-sm">مراحل خط المبيعات (Sales Pipeline)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "currentColor", opacity: 0.7 }} stroke="rgba(255,255,255,0.2)" />
              <YAxis tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} stroke="rgba(255,255,255,0.2)" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "rgba(20,20,30,0.95)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "8px", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="value" name="عملاء" radius={[4, 4, 0, 0]}>
                {stageData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
