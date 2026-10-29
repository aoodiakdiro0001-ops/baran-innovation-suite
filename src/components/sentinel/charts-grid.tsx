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
import { motion } from "framer-motion";
import { Activity, PieChart as PieIcon, BarChart3 } from "lucide-react";

type TimelinePoint = { date: string; scans: number; vulns: number };
type Severity = { critical: number; high: number; medium: number; low: number; info: number };
type OWASPEntry = { name: string; count: number };

const SEVERITY_COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#06b6d4",
  info: "#3b82f6",
};

const OWASP_COLORS = [
  "#06b6d4",
  "#10b981",
  "#3b82f6",
  "#a855f7",
  "#f97316",
  "#ef4444",
  "#eab308",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

export function ChartsGrid() {
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [owasp, setOwasp] = useState<OWASPEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = () =>
      fetch("/api/stats")
        .then((r) => r.json())
        .then((d) => {
          if (!mounted) return;
          setTimeline(d.timeline || []);
          setSeverity(d.bySeverity);
          // تحويل OWASP من map إلى array
          const arr: OWASPEntry[] = Object.entries(d.owasp || {}).map(
            ([name, count]) => ({ name, count: count as number })
          );
          arr.sort((a, b) => b.count - a.count);
          setOwasp(arr.slice(0, 10));
          setLoading(false);
        })
        .catch(() => {
          if (mounted) setLoading(false);
        });
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

  const severityData = severity
    ? [
        { name: "حرجة", value: severity.critical, color: SEVERITY_COLORS.critical },
        { name: "عالية", value: severity.high, color: SEVERITY_COLORS.high },
        { name: "متوسطة", value: severity.medium, color: SEVERITY_COLORS.medium },
        { name: "منخفضة", value: severity.low, color: SEVERITY_COLORS.low },
        { name: "معلومة", value: severity.info, color: SEVERITY_COLORS.info },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Timeline */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-500" />
          <CardTitle className="text-sm">حركة الفحوصات والثغرات (آخر 14 يوم)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="vulnsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
                  border: "1px solid rgba(0,200,255,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#06b6d4" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                formatter={(v) => (v === "scans" ? "فحوصات" : "ثغرات")}
              />
              <Area
                type="monotone"
                dataKey="scans"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#scansGrad)"
              />
              <Area
                type="monotone"
                dataKey="vulns"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#vulnsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Severity Pie */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <PieIcon className="h-4 w-4 text-purple-500" />
          <CardTitle className="text-sm">توزيع الثغرات حسب الخطورة</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={severityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
              >
                {severityData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="rgba(0,0,0,0.3)" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,20,30,0.95)",
                  border: "1px solid rgba(0,200,255,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* OWASP Top 10 */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-500" />
          <CardTitle className="text-sm">توزيع الثغرات حسب OWASP Top 10 (2021)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={owasp} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                stroke="rgba(255,255,255,0.2)"
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.7 }}
                stroke="rgba(255,255,255,0.2)"
                width={200}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20,20,30,0.95)",
                  border: "1px solid rgba(0,200,255,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {owasp.map((_, idx) => (
                  <Cell key={idx} fill={OWASP_COLORS[idx % OWASP_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
