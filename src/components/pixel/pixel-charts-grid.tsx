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
import { Activity, PieChart as PieIcon, BarChart3, DollarSign } from "lucide-react";

type Daily = { date: string; jobs: number; completed: number; costSaved: number };
type PixelData = {
  dailyStats: Daily[];
  processTypes: { rembg: number; relight: number; composite: number; full: number };
  sources: { telegram: number; web: number; api: number; github: number };
};

const PROCESS_COLORS = { rembg: "#06b6d4", relight: "#a855f7", composite: "#10b981", full: "#f97316" };
const SOURCE_COLORS = ["#a855f7", "#06b6d4", "#10b981", "#f97316"];

export function PixelChartsGrid() {
  const [data, setData] = useState<PixelData | null>(null);
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

  const processData = [
    { name: "إزالة خلفية", value: data.processTypes.rembg, color: PROCESS_COLORS.rembg },
    { name: "إعادة إضاءة", value: data.processTypes.relight, color: PROCESS_COLORS.relight },
    { name: "دمج في خلفية", value: data.processTypes.composite, color: PROCESS_COLORS.composite },
    { name: "معالجة كاملة", value: data.processTypes.full, color: PROCESS_COLORS.full },
  ].filter((d) => d.value > 0);

  const sourceData = [
    { name: "تليجرام", value: data.sources.telegram },
    { name: "الويب", value: data.sources.web },
    { name: "API", value: data.sources.api },
    { name: "GitHub", value: data.sources.github },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Daily jobs chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Activity className="h-4 w-4 text-fuchsia-500" />
          <CardTitle className="text-sm">حركة المعالجة اليومية (آخر 14 يوم)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.dailyStats}>
              <defs>
                <linearGradient id="jobsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d946ef" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
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
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                stroke="rgba(255,255,255,0.2)"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,20,30,0.95)",
                  border: "1px solid rgba(217,70,239,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#d946ef" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                formatter={(v) => (v === "jobs" ? "مهام" : v === "completed" ? "مكتملة" : "توفير $")}
              />
              <Area type="monotone" dataKey="jobs" stroke="#d946ef" strokeWidth={2} fill="url(#jobsGrad)" />
              <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
              <Area type="monotone" dataKey="costSaved" stroke="#f97316" strokeWidth={1.5} fillOpacity={0} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Process types pie */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <PieIcon className="h-4 w-4 text-purple-500" />
          <CardTitle className="text-sm">توزيع أنواع المعالجة</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={processData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
              >
                {processData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="rgba(0,0,0,0.3)" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,20,30,0.95)",
                  border: "1px solid rgba(217,70,239,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sources bar */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-500" />
          <CardTitle className="text-sm">توزيع مصادر الطلبات</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "currentColor", opacity: 0.7 }}
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
                  border: "1px solid rgba(217,70,239,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {sourceData.map((_, idx) => (
                  <Cell key={idx} fill={SOURCE_COLORS[idx % SOURCE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
