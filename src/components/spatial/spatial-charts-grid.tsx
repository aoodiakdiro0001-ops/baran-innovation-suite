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
import { Box, Activity, PieChart as PieIcon, BarChart3, TrendingDown } from "lucide-react";

type Daily = { date: string; assets: number; polygonsReduced: number; costSaved: number; successRate: number };
type SpatialCharts = {
  dailyStats: Daily[];
  categoryCounts: Record<string, number>;
  sourceCounts: Record<string, number>;
};

const CATEGORY_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f97316", "#ef4444", "#a855f7"];

const categoryLabels: Record<string, string> = {
  furniture: "أثاث",
  character: "شخصيات",
  vehicle: "مركبات",
  prop: "أغراض",
  environment: "بيئات",
  generic: "أخرى",
};

export function SpatialChartsGrid() {
  const [data, setData] = useState<SpatialCharts | null>(null);
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

  const categoryData = Object.entries(data.categoryCounts).map(([key, value], idx) => ({
    name: categoryLabels[key] || key,
    value,
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }));

  const formatNum = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Daily generation */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Activity className="h-4 w-4 text-violet-500" />
          <CardTitle className="text-sm">توليد المجسمات اليومي (آخر 14 يوم)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.dailyStats}>
              <defs>
                <linearGradient id="assetsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                tickFormatter={(v: string) => v.split("-").slice(1).join("/")}
                stroke="rgba(255,255,255,0.2)"
              />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} stroke="rgba(255,255,255,0.2)" allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} stroke="rgba(255,255,255,0.2)" />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(20,20,30,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#8b5cf6" }}
                formatter={(value: number, name) => {
                  if (name === "مجسمات") return [value, name];
                  if (name === "توفير $") return [`$${value}`, name];
                  return [formatNum(value), name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Area yAxisId="left" type="monotone" dataKey="assets" name="مجسمات" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#assetsGrad)" />
              <Area yAxisId="left" type="monotone" dataKey="polygonsReduced" name="مضلعات مُقلَّصة" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={0} />
              <Area yAxisId="right" type="monotone" dataKey="costSaved" name="توفير $" stroke="#10b981" strokeWidth={1.5} fillOpacity={0} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Categories Pie */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <PieIcon className="h-4 w-4 text-purple-500" />
          <CardTitle className="text-sm">توزيع فئات المجسمات</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
              >
                {categoryData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="rgba(0,0,0,0.3)" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "rgba(20,20,30,0.95)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "8px", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Polygons reduced per day */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <TrendingDown className="h-4 w-4 text-cyan-500" />
          <CardTitle className="text-sm">المضلعات المُقلَّصة يومياً (Optimization)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.dailyStats.map((d) => ({ ...d, date: d.date.split("-").slice(1).join("/") }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} stroke="rgba(255,255,255,0.2)" />
              <YAxis tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => formatNum(v)} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(20,20,30,0.95)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value: number) => [formatNum(value), "مضلعات"]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="polygonsReduced" name="مضلعات مُقلَّصة" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
