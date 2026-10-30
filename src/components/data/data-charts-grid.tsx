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
import { Activity, PieChart as PieIcon, BarChart3, TrendingUp } from "lucide-react";

type Daily = {
  date: string;
  datasets: number;
  rows: number;
  quality: number;
  insights: number;
  anomalies: number;
  costSaved: number;
};
type DataCharts = {
  dailyStats: Daily[];
  sourceCounts: Record<string, number>;
};

const SOURCE_COLORS = ["#f59e0b", "#06b6d4", "#a855f7", "#10b981", "#ef4444", "#84cc16"];

const sourceLabels: Record<string, string> = {
  csv: "CSV",
  json: "JSON",
  sql: "SQL",
  api: "API",
  manual: "يدوي",
};

export function DataChartsGrid() {
  const [data, setData] = useState<DataCharts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch("/api/data/stats");
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

  // توزيع المصادر
  const sourceData = Object.entries(data.sourceCounts).map(([key, value], idx) => ({
    name: sourceLabels[key] || key,
    value,
    color: SOURCE_COLORS[idx % SOURCE_COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Daily stats */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Activity className="h-4 w-4 text-amber-500" />
          <CardTitle className="text-sm">حركة معالجة البيانات (آخر 14 يوم)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.dailyStats}>
              <defs>
                <linearGradient id="rowsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="insightsGrad" x1="0" y1="0" x2="0" y2="1">
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
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                stroke="rgba(255,255,255,0.2)"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                stroke="rgba(255,255,255,0.2)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,20,30,0.95)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#f59e0b" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="rows"
                name="صفوف معالَجة"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#rowsGrad)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="insights"
                name="رؤى مُستخرَجة"
                stroke="#a855f7"
                strokeWidth={2}
                fill="url(#insightsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sources Pie */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <PieIcon className="h-4 w-4 text-purple-500" />
          <CardTitle className="text-sm">توزيع مصادر البيانات</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={sourceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
              >
                {sourceData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="rgba(0,0,0,0.3)" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,20,30,0.95)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quality + Cost Saved */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <CardTitle className="text-sm">جودة البيانات والتوفير اليومي</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.dailyStats.map((d) => ({ ...d, date: d.date.split("-").slice(1).join("/") }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} stroke="rgba(255,255,255,0.2)" />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} stroke="rgba(255,255,255,0.2)" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} stroke="rgba(255,255,255,0.2)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,20,30,0.95)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar yAxisId="left" dataKey="quality" name="جودة البيانات %" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="costSaved" name="توفير $" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
