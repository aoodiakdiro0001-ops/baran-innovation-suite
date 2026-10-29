"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Radar, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type Scan = {
  id: string;
  target: string;
  scanType: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  totalFiles: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  triggeredBy: string;
  commitSha: string | null;
};

const statusConfig = {
  completed: { label: "مكتمل", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", spin: false },
  running: { label: "قيد التشغيل", icon: Loader2, color: "text-yellow-500", bg: "bg-yellow-500/10", spin: true },
  failed: { label: "فشل", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", spin: false },
  pending: { label: "مُعلّق", icon: RefreshCw, color: "text-muted-foreground", bg: "bg-muted/10", spin: false },
};

const scanTypeLabel: Record<string, string> = {
  full: "فحص كامل",
  semgrep: "Semgrep SAST",
  nuclei: "Nuclei DAST",
  nmap: "Nmap Ports",
};

export function ScansList() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/scans?limit=30")
      .then((r) => r.json())
      .then((d) => {
        setScans(d.scans || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const r = await fetch("/api/scans?limit=30");
        const d = await r.json();
        setScans(d.scans || []);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchInitial();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar className="h-4 w-4 text-cyan-500" />
          <CardTitle className="text-sm">آخر الفحوصات الأمنية</CardTitle>
        </div>
        <Badge variant="outline" className="text-xs">
          {scans.length} فحص
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[360px] custom-scroll" >
          <Table>
            <TableHeader className="sticky top-0 bg-card/95 backdrop-blur z-10">
              <TableRow>
                <TableHead className="text-xs">الهدف</TableHead>
                <TableHead className="text-xs">النوع</TableHead>
                <TableHead className="text-xs">الحالة</TableHead>
                <TableHead className="text-xs text-center">حرجة</TableHead>
                <TableHead className="text-xs text-center">عالية</TableHead>
                <TableHead className="text-xs text-center">متوسطة</TableHead>
                <TableHead className="text-xs text-center">منخفضة</TableHead>
                <TableHead className="text-xs">المُشغّل</TableHead>
                <TableHead className="text-xs">الوقت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9} className="h-12 animate-pulse bg-muted/20" />
                    </TableRow>
                  ))
                : scans.map((scan, idx) => {
                    const cfg = statusConfig[scan.status as keyof typeof statusConfig] || statusConfig.pending;
                    const Icon = cfg.icon;
                    const date = new Date(scan.startedAt);
                    const dateStr = date.toLocaleDateString("ar", {
                      day: "numeric",
                      month: "short",
                    }) + " " + date.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <motion.tr
                        key={scan.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-xs font-mono max-w-[220px] truncate" title={scan.target}>
                          {scan.target}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="text-xs">
                            {scanTypeLabel[scan.scanType] || scan.scanType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                            <Icon className={`h-3 w-3 ${cfg.spin ? "animate-spin" : ""}`} />
                            {cfg.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {scan.criticalCount > 0 ? (
                            <Badge className="severity-critical text-xs">{scan.criticalCount}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {scan.highCount > 0 ? (
                            <Badge className="severity-high text-xs">{scan.highCount}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {scan.mediumCount > 0 ? (
                            <Badge className="severity-medium text-xs">{scan.mediumCount}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {scan.lowCount > 0 ? (
                            <Badge className="severity-low text-xs">{scan.lowCount}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {scan.triggeredBy === "cron" ? "مجدول" : scan.triggeredBy === "push" ? "push" : "يدوي"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                          {dateStr}
                        </TableCell>
                      </motion.tr>
                    );
                  })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
