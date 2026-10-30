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
  totalConversations: number;
  aiHandled: number;
  converted: number;
  totalRevenue: number;
};

type SalesCharts = {
  dailyStats: Daily[];
  channelCounts: Record<string, number>;
  intentCounts: Record<string, number>;
};

const CHANNEL_COLORS: Record<string, string> = {
  telegram: "#0ea5e9",
  whatsapp: "#22c55e",
  email: "#a855f7",
  web: "#f59e0b",
  instagram: "#ec4899",
};

const INTENT_COLORS: Record<string, string> = {
  sales: "#6366f1",
  support: "#06b6d4",
  pricing: "#f59e0b",
  complaint: "#ef4444",
  booking: "#a855f7",
  info: "#10b981",
};

const channelLabels: Record<string, string> = {
  telegram: "تليجرام",
  whatsapp: "واتساب",
  email: "إيميل",
  web: "موقع",
  instagram: "إنستغرام",
};

const intentLabels: Record<string, string> = {
  sales: "مبيعات",
  support: "دعم",
  pricing: "تسعير",
  complaint: "شكوى",
  booking: "حجز",
  info: "استفسار",
};

export function SalesChartsGrid() {
  const [data, setData] = useState<SalesCharts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const r = await fetch("/api/sales/stats");
        const d = await r.json();
        setData(d);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchInitial();
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

  const channelData = Object.entries(data.channelCounts).map(([key, value]) => ({
    name: channelLabels[key] || key,
    value,
    color: CHANNEL_COLORS[key] || "#6366f1",
  }));

  const intentData = Object.entries(data.intentCounts).map(([key, value]) => ({
    name: intentLabels[key] || key,
    value,
    color: INTENT_COLORS[key] || "#94a3b8",
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Daily conversations area chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-500" />
          <CardTitle className="text-sm">المحادثات مقابل المبيعات (آخر 14 يوم)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.dailyStats}>
              <defs>
                <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="convGrad2" x1="0" y1="0" x2="0" y2="1">
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
              <YAxis tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} stroke="rgba(255,255,255,0.2)" allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(20,20,30,0.95)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#6366f1" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Area type="monotone" dataKey="totalConversations" name="محادثات" stroke="#6366f1" strokeWidth={2.5} fill="url(#convGrad)" />
              <Area type="monotone" dataKey="converted" name="مبيعات" stroke="#10b981" strokeWidth={2} fill="url(#convGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Channel pie chart */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <PieIcon className="h-4 w-4 text-indigo-500" />
          <CardTitle className="text-sm">توزيع القنوات</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={channelData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
              >
                {channelData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="rgba(0,0,0,0.3)" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "rgba(20,20,30,0.95)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Intent bar chart */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-500" />
          <CardTitle className="text-sm">توزيع نية المحادثات (Intent)</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={intentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "currentColor", opacity: 0.7 }} stroke="rgba(255,255,255,0.2)" />
              <YAxis tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} stroke="rgba(255,255,255,0.2)" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "rgba(20,20,30,0.95)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="value" name="عدد المحادثات" radius={[4, 4, 0, 0]}>
                {intentData.map((entry, idx) => (
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
