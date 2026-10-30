"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

type Service = {
  id: string;
  name: string;
  type: string;
  url: string;
  port: number | null;
  interval: number;
  timeout: number;
  expectedCode: number;
  enabled: boolean;
  currentStatus: string;
  uptimePct: number;
  lastCheckedAt: string | null;
  lastDownAt: string | null;
  responseTimeMs: number;
  region: string;
  priority: string;
  incidentsCount: number;
  openIncidents: number;
};

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  up: { label: "تعمل", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  degraded: { label: "مُتدهور", color: "text-yellow-500", bg: "bg-yellow-500/10", icon: AlertTriangle },
  down: { label: "متوقف", color: "text-red-500", bg: "bg-red-500/10", icon: XCircle },
  unknown: { label: "غير معروف", color: "text-muted-foreground", bg: "bg-muted/30", icon: AlertTriangle },
};

const typeLabel: Record<string, string> = {
  http: "HTTP",
  https: "HTTPS",
  tcp: "TCP",
  icmp: "ICMP",
  database: "Database",
  redis: "Redis",
  docker: "Docker",
};

const priorityLabel: Record<string, string> = {
  critical: "حرج",
  high: "عالي",
  normal: "عادي",
  low: "منخفض",
};

const priorityClass: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/30",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  normal: "bg-muted text-muted-foreground border-border",
  low: "bg-muted text-muted-foreground border-border",
};

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return `قبل ${Math.floor(diff)}s`;
  if (diff < 3600) return `قبل ${Math.floor(diff / 60)}d`;
  if (diff < 86400) return `قبل ${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString("ar");
}

export function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchInitial = async () => {
      try {
        const r = await fetch("/api/aiops/services");
        const d = await r.json();
        if (mounted) {
          setServices(d.services || []);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };
    fetchInitial();
    const t = setInterval(async () => {
      if (mounted) setRefreshing(true);
      try {
        const r = await fetch("/api/aiops/services");
        const d = await r.json();
        if (mounted) setServices(d.services || []);
      } catch {
        /* ignore */
      } finally {
        if (mounted) setRefreshing(false);
      }
    }, 10000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-blue-500/20">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-sm">الخدمات المراقَبة</CardTitle>
            <Badge variant="outline" className="text-xs">
              {services.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <RefreshCw
              className={`h-3 w-3 ${refreshing ? "animate-spin text-blue-500" : ""}`}
            />
            تحديث تلقائي كل 10s
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[520px] custom-scroll pr-2">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-md bg-muted/20 animate-pulse"
                  />
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                لا توجد خدمات مراقَبة.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-right text-xs">الخدمة</TableHead>
                    <TableHead className="text-right text-xs">النوع</TableHead>
                    <TableHead className="text-right text-xs">الحالة</TableHead>
                    <TableHead className="text-right text-xs">Uptime</TableHead>
                    <TableHead className="text-right text-xs">الاستجابة</TableHead>
                    <TableHead className="text-right text-xs">الأولوية</TableHead>
                    <TableHead className="text-right text-xs">الحوادث</TableHead>
                    <TableHead className="text-right text-xs">آخر فحص</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((s, idx) => {
                    const cfg = statusConfig[s.currentStatus] || statusConfig.unknown;
                    const StatusIcon = cfg.icon;
                    return (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="text-xs font-medium">
                          <div className="flex flex-col">
                            <span>{s.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono" dir="ltr">
                              {s.url}
                              {s.port ? `:${s.port}` : ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {typeLabel[s.type] || s.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${cfg.bg} ${cfg.color} border-0`}>
                            <StatusIcon className="h-2.5 w-2.5 ml-0.5" />
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs tabular-nums">
                          <span
                            className={
                              s.uptimePct >= 99.5
                                ? "text-emerald-500"
                                : s.uptimePct >= 99
                                ? "text-yellow-500"
                                : "text-red-500"
                            }
                          >
                            {s.uptimePct}%
                          </span>
                        </TableCell>
                        <TableCell className="text-xs tabular-nums">
                          {s.responseTimeMs > 0 ? (
                            <span
                              className={
                                s.responseTimeMs > 500
                                  ? "text-red-500"
                                  : s.responseTimeMs > 200
                                  ? "text-yellow-500"
                                  : "text-emerald-500"
                              }
                            >
                              {s.responseTimeMs}ms
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${priorityClass[s.priority] || priorityClass.normal}`}
                          >
                            {priorityLabel[s.priority] || s.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {s.openIncidents > 0 ? (
                            <Badge className="text-[10px] severity-high">{s.openIncidents} مفتوح</Badge>
                          ) : (
                            <span className="text-muted-foreground">
                              {s.incidentsCount} إجمالي
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">
                          {formatTime(s.lastCheckedAt)}
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
