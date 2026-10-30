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
import { Activity, PieChart as PieIcon, BarChart3 } from "lucide-react";

type Daily = {
  date: string;
  incidentsDetected: number;
  incidentsResolved: number;
  autoHealed: number;
  avgUptime: number;
  avgResponseMs: number;
  costSaved: number;
};

type AiopsService = {
  id: string;
  name: string;
  type: string;
  status: string;
  uptimePct: number;
  responseTimeMs: number;
  priority: string;
};

type AiopsCharts = {
  dailyStats: Daily[];
  statusCounts: Record<string, number>;
  services: AiopsService[];
};

const STATUS_COLORS: Record<string, string> = {
  up: "#10b981",
  down: "#ef4444",
  degraded: "#f59e0b",
  unknown: "#94a3b8",
};

const STATUS_LABELS: Record<string, string> = {
  up: "تعمل",
  down: "متوقف",
  degraded: "مُتدهور",
  unknown: "غير معروف",
};

export function AiopsChartsGrid() {
  const [data, setData] = useState<AiopsCharts | null>(null);
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

  const daily = data.dailyStats.map((d) => ({
    ...d,
    shortDate: d.date.split("-").slice(1).join("/"),
  }));

  const pieData = Object.entries(data.statusCounts)
    .filter(([k, v]) => k !== "unknown" || v > 0)
    .map(([k, v]) => ({
      name: STATUS_LABELS[k] || k,
      value: v,
      color: STATUS_COLORS[k] || "#94a3b8",
    }));

  const barData = data.services
    .filter((s) => s.responseTimeMs > 0)
    .map((s) => ({
      name: s.name.length > 14 ? s.name.slice(0, 14) + "…" : s.name,
      fullName: s.name,
      responseTime: s.responseTimeMs,
      status: s.status,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Area: incidents detected vs auto-healed */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          <CardTitle className="text-sm">حوادث مكتشَفة vs إصلاح ذاتي (آخر 14 يوم)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="aiopsInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aiopsHeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="shortDate"
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
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#3b82f6" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Area
                type="monotone"
                dataKey="incidentsDetected"
                name="حوادث مكتشَفة"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#aiopsInc)"
              />
              <Area
                type="monotone"
                dataKey="autoHealed"
                name="إصلاح ذاتي"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#aiopsHeal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie: service status distribution */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <PieIcon className="h-4 w-4 text-cyan-500" />
          <CardTitle className="text-sm">توزيع حالات الخدمات</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="rgba(0,0,0,0.3)" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,20,30,0.95)",
                  border: "1px solid rgba(6,182,212,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar: response times by service */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-500" />
          <CardTitle className="text-sm">زمن الاستجابة لكل خدمة (ms)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "currentColor", opacity: 0.7 }}
                stroke="rgba(255,255,255,0.2)"
                interval={0}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                stroke="rgba(255,255,255,0.2)"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,20,30,0.95)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(v: number) => [`${v}ms`, "زمن الاستجابة"]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="responseTime" name="زمن الاستجابة (ms)" radius={[4, 4, 0, 0]}>
                {barData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={
                      entry.status === "down"
                        ? "#ef4444"
                        : entry.status === "degraded"
                        ? "#f59e0b"
                        : entry.responseTime > 300
                        ? "#06b6d4"
                        : "#3b82f6"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
