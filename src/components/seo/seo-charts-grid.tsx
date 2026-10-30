"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Trophy, Activity, BarChart3 } from "lucide-react";

type Daily = { date: string; avgRank: number; top10: number; improvements: number; drops: number };

const TOP_COLORS = ["#10b981", "#84cc16", "#eab308", "#f97316", "#ef4444", "#a855f7", "#06b6d4"];

export function SeoChartsGrid() {
  const [daily, setDaily] = useState<Daily[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch("/api/seo/stats");
        const d = await r.json();
        if (mounted) {
          setDaily(d.dailyStats || []);
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

  if (loading) {
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

  // لوغاريتمي عكسي للترتيب (1 = الأفضل، 100 = الأسوأ) -> نعكس القيمة للعرض
  const rankData = daily.map((d) => ({
    date: d.date.split("-").slice(1).join("/"),
    rank: d.avgRank,
    top10: d.top10,
    invRank: 100 - d.avgRank, // للعرض البصري: كلما زاد كلما كان أفضل
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Rank over time */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <CardTitle className="text-sm">تطور متوسط الترتيب (آخر 14 يوم)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={rankData}>
              <defs>
                <linearGradient id="rankGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                stroke="rgba(255,255,255,0.2)"
              />
              <YAxis
                reversed
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                stroke="rgba(255,255,255,0.2)"
                allowDecimals={false}
                domain={[1, 50]}
                label={{ value: "ترتيب (الأقل أفضل)", angle: 90, position: "insideLeft", style: { fontSize: 10, fill: "currentColor", opacity: 0.5 } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,20,30,0.95)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#10b981" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Area
                type="monotone"
                dataKey="rank"
                name="متوسط الترتيب"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#rankGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top 10 count over time */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <CardTitle className="text-sm">عدد الكلمات في أول 10</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={rankData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }}
                stroke="rgba(255,255,255,0.2)"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                stroke="rgba(255,255,255,0.2)"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,20,30,0.95)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#facc15" }}
              />
              <Line
                type="monotone"
                dataKey="top10"
                name="في أول 10"
                stroke="#facc15"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#facc15" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Improvements vs Drops */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-500" />
          <CardTitle className="text-sm">تحسّنات مقابل تراجعات (يومياً)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={daily.map((d) => ({ ...d, date: d.date.split("-").slice(1).join("/") }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                stroke="rgba(255,255,255,0.2)"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                stroke="rgba(255,255,255,0.2)"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,20,30,0.95)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="improvements" name="تحسّنات" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="drops" name="تراجعات" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
