"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Server, CheckCircle2, AlertTriangle, XCircle, Wrench,
  Cpu, HardDrive, MemoryStick, Activity, Clock, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Srv = {
  id: string; name: string; hostname: string; type: string;
  status: string; uptimePct: number; cpuUsage: number; memoryUsage: number;
  diskUsage: number; responseTimeMs: number; incidentCount: number;
  autoHeal: boolean; lastHeartbeat: string;
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  operational: { label: "تعمل", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  degraded: { label: "مُتدهور", color: "text-yellow-500", bg: "bg-yellow-500/10", icon: AlertTriangle },
  down: { label: "متوقف", color: "text-red-500", bg: "bg-red-500/10", icon: XCircle },
  maintenance: { label: "صيانة", color: "text-cyan-500", bg: "bg-cyan-500/10", icon: Wrench },
};

const typeIcon: Record<string, string> = {
  web: "🌐", api: "🔌", db: "🗄️", cache: "⚡", worker: "⚙️", full: "🖥️",
};

export function ServerMonitor() {
  const [servers, setServers] = useState<Srv[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch("/api/aiops/stats");
        const d = await r.json();
        if (mounted) { setServers(d.servers || []); setLoading(false); }
      } catch { if (mounted) setLoading(false); }
    };
    load();
    const t = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-sky-500" />
          <CardTitle className="text-sm">خوادم مُراقَبة</CardTitle>
          <Badge variant="outline" className="text-xs">{servers.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[480px] custom-scroll pr-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-md bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {servers.map((srv, idx) => {
                const cfg = statusConfig[srv.status] || statusConfig.operational;
                const StatusIcon = cfg.icon;
                return (
                  <motion.div
                    key={srv.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-3 rounded-md border border-border bg-card/50 hover:border-sky-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{typeIcon[srv.type] || "🖥️"}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{srv.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono truncate" dir="ltr">{srv.hostname}</div>
                        </div>
                      </div>
                      <Badge className={`text-xs ${cfg.bg} ${cfg.color} border-0`}>
                        <StatusIcon className="h-2.5 w-2.5 ml-0.5" />
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <Metric icon={Cpu} label="CPU" value={srv.cpuUsage} unit="%" color={srv.cpuUsage > 80 ? "text-red-500" : srv.cpuUsage > 60 ? "text-yellow-500" : "text-emerald-500"} />
                      <Metric icon={MemoryStick} label="RAM" value={srv.memoryUsage} unit="%" color={srv.memoryUsage > 80 ? "text-red-500" : srv.memoryUsage > 60 ? "text-yellow-500" : "text-emerald-500"} />
                      <Metric icon={HardDrive} label="Disk" value={srv.diskUsage} unit="%" color={srv.diskUsage > 85 ? "text-red-500" : srv.diskUsage > 70 ? "text-yellow-500" : "text-emerald-500"} />
                      <Metric icon={Activity} label="ms" value={srv.responseTimeMs} unit="" color={srv.responseTimeMs > 500 ? "text-red-500" : srv.responseTimeMs > 200 ? "text-yellow-500" : "text-emerald-500"} />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                      <span>Uptime: {srv.uptimePct}%</span>
                      <span>•</span>
                      <span>حوادث: {srv.incidentCount}</span>
                      <span>•</span>
                      <span className={srv.autoHeal ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                        {srv.autoHeal ? "✅ Auto-Heal" : "❌ Manual"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function Metric({ icon: Icon, label, value, unit, color }: { icon: typeof Cpu; label: string; value: number; unit: string; color: string }) {
  return (
    <div className="p-1.5 rounded bg-muted/20">
      <Icon className={`h-3 w-3 mx-auto ${color} mb-0.5`} />
      <div className={`text-xs font-bold ${color}`}>{value}{unit}</div>
      <div className="text-[8px] text-muted-foreground">{label}</div>
    </div>
  );
}
