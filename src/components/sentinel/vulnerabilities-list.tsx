"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bug, ShieldQuestion, Code2, CheckCircle2, Loader2, Copy, Wrench } from "lucide-react";
import { toast } from "sonner";

type Vulnerability = {
  id: string;
  title: string;
  severity: string;
  category: string;
  cveId: string | null;
  filePath: string | null;
  lineNumber: number | null;
  codeSnippet: string | null;
  description: string;
  remediation: string | null;
  aiSuggestion: string | null;
  status: string;
  detectedAt: string;
  scan?: { target: string; scanType: string };
};

const sevClass: Record<string, string> = {
  critical: "severity-critical",
  high: "severity-high",
  medium: "severity-medium",
  low: "severity-low",
  info: "severity-info",
};

const sevLabel: Record<string, string> = {
  critical: "حرجة",
  high: "عالية",
  medium: "متوسطة",
  low: "منخفضة",
  info: "معلومة",
};

const statusLabel: Record<string, string> = {
  open: "مفتوحة",
  fixed: "مُصلَحة",
  in_progress: "قيد المعالجة",
  ignored: "متجاهلة",
};

const statusBadgeClass: Record<string, string> = {
  open: "bg-red-500/15 text-red-500 border-red-500/30",
  fixed: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  in_progress: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  ignored: "bg-muted/30 text-muted-foreground border-border",
};

export function VulnerabilitiesList() {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Vulnerability | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, unknown> | null>(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterSeverity !== "all") params.set("severity", filterSeverity);
    if (filterStatus !== "all") params.set("status", filterStatus);
    fetch(`/api/vulnerabilities?${params.toString()}&limit=100`)
      .then((r) => r.json())
      .then((d) => {
        setVulns(d.vulnerabilities || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filterSeverity, filterStatus]);

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/vulnerabilities?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(`تم تحديث الحالة إلى: ${statusLabel[newStatus]}`);
      load();
    } else {
      toast.error("فشل تحديث الحالة");
    }
  };

  const runAiAnalysis = async (v: Vulnerability) => {
    setAnalyzing(true);
    setAiAnalysis(null);
    try {
      const res = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: v.title,
          severity: v.severity,
          category: v.category,
          codeSnippet: v.codeSnippet,
          description: v.description,
          language: v.filePath?.endsWith(".py") ? "Python" : "TypeScript",
        }),
      });
      const data = await res.json();
      if (res.ok && data.analysis) {
        setAiAnalysis(data.analysis);
        toast.success("تم تحليل الثغرة بواسطة Gemini AI");
      } else {
        toast.error("فشل التحليل الذكي: " + (data.message || "غير معروف"));
      }
    } catch (e) {
      toast.error("خطأ في الاتصال بمحرك AI");
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ الكود إلى الحافظة");
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-red-500" />
          <CardTitle className="text-sm">الثغرات الأمنية المكتشفة</CardTitle>
          <Badge variant="outline" className="text-xs">{vulns.length} ثغرة</Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="h-8 text-xs w-[120px]">
              <SelectValue placeholder="الخطورة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الخطور</SelectItem>
              <SelectItem value="critical">حرجة</SelectItem>
              <SelectItem value="high">عالية</SelectItem>
              <SelectItem value="medium">متوسطة</SelectItem>
              <SelectItem value="low">منخفضة</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 text-xs w-[120px]">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="open">مفتوحة</SelectItem>
              <SelectItem value="in_progress">قيد المعالجة</SelectItem>
              <SelectItem value="fixed">مُصلَحة</SelectItem>
              <SelectItem value="ignored">متجاهلة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[480px] custom-scroll">
          <Table>
            <TableHeader className="sticky top-0 bg-card/95 backdrop-blur z-10">
              <TableRow>
                <TableHead className="text-xs">الثغرة</TableHead>
                <TableHead className="text-xs">الخطورة</TableHead>
                <TableHead className="text-xs">الفئة (OWASP)</TableHead>
                <TableHead className="text-xs">الملف</TableHead>
                <TableHead className="text-xs">الحالة</TableHead>
                <TableHead className="text-xs">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="h-12 animate-pulse bg-muted/20" />
                    </TableRow>
                  ))
                : vulns.map((v, idx) => (
                    <TableRow
                      key={v.id}
                      onClick={() => setSelected(v)}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="text-xs max-w-[280px] truncate font-medium" title={v.title}>
                        <span className="line-clamp-1">{v.title}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${sevClass[v.severity]} text-xs`}>
                          {sevLabel[v.severity] || v.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate" title={v.category}>
                        {v.category.split(" - ")[0]}
                      </TableCell>
                      <TableCell className="text-xs font-mono max-w-[160px] truncate text-cyan-600 dark:text-cyan-400" title={v.filePath || ""}>
                        {v.filePath || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${statusBadgeClass[v.status]}`}>
                          {statusLabel[v.status] || v.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(v);
                          }}
                        >
                          عرض
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {/* Dialog for Vulnerability Details */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scroll">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg flex items-center gap-2">
                  <Bug className="h-5 w-5 text-red-500" />
                  {selected.title}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  <span className="inline-flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className={`${sevClass[selected.severity]} text-xs`}>
                      {sevLabel[selected.severity]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{selected.category}</Badge>
                    {selected.cveId && (
                      <Badge variant="outline" className="text-xs font-mono">{selected.cveId}</Badge>
                    )}
                    {selected.filePath && (
                      <Badge variant="outline" className="text-xs font-mono">
                        {selected.filePath}
                        {selected.lineNumber ? `:${selected.lineNumber}` : ""}
                      </Badge>
                    )}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* الوصف */}
                <div>
                  <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                    <ShieldQuestion className="h-4 w-4 text-orange-500" />
                    وصف الثغرة
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selected.description}
                  </p>
                </div>

                {/* الكود المصاب */}
                {selected.codeSnippet && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                      <Code2 className="h-4 w-4 text-red-500" />
                      الكود المصاب
                    </h4>
                    <div className="relative">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-1 left-1 h-7 w-7 z-10"
                        onClick={() => copyToClipboard(selected.codeSnippet || "")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <pre className="bg-zinc-900 text-zinc-300 rounded-md p-3 pr-10 text-xs font-mono overflow-x-auto border border-red-500/30">
                        <code dir="ltr">{selected.codeSnippet}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* الإصلاح اليدوي */}
                {selected.remediation && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                      <Wrench className="h-4 w-4 text-yellow-500" />
                      طريقة الإصلاح
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selected.remediation}
                    </p>
                  </div>
                )}

                {/* كود الإصلاح المقترح */}
                {selected.aiSuggestion && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      كود الإصلاح الآمن المقترح
                    </h4>
                    <div className="relative">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-1 left-1 h-7 w-7 z-10"
                        onClick={() => copyToClipboard(selected.aiSuggestion || "")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <pre className="bg-zinc-900 text-emerald-300 rounded-md p-3 pr-10 text-xs font-mono overflow-x-auto border border-emerald-500/30">
                        <code dir="ltr">{selected.aiSuggestion}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* تحليل Gemini AI */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-1.5">
                      <Loader2 className={`h-4 w-4 ${analyzing ? "animate-spin text-cyan-500" : "text-cyan-500"}`} />
                      تحليل إضافي بواسطة Gemini AI
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runAiAnalysis(selected)}
                      disabled={analyzing}
                      className="h-7 text-xs"
                    >
                      {analyzing ? "جاري التحليل..." : "تشغيل التحليل الذكي"}
                    </Button>
                  </div>
                  {analyzing && (
                    <div className="text-xs text-muted-foreground animate-pulse py-4 text-center">
                      Gemini يحلل الثغرة ويُعِدّ كود الإصلاح...
                    </div>
                  )}
                  {aiAnalysis && !analyzing && (
                    <div className="space-y-3 text-sm">
                      {typeof aiAnalysis.riskScore === "number" && (
                        <div>
                          <Badge className={aiAnalysis.riskScore >= 70 ? "severity-critical text-xs" : aiAnalysis.riskScore >= 40 ? "severity-medium text-xs" : "severity-low text-xs"}>
                            درجة الخطورة: {aiAnalysis.riskScore}/100
                          </Badge>
                        </div>
                      )}
                      {typeof aiAnalysis.explanation === "string" && (
                        <p className="text-muted-foreground leading-relaxed text-xs">
                          {aiAnalysis.explanation}
                        </p>
                      )}
                      {typeof aiAnalysis.fixCode === "string" && aiAnalysis.fixCode.trim() && (
                        <pre className="bg-zinc-900 text-emerald-300 rounded-md p-3 text-xs font-mono overflow-x-auto border border-cyan-500/30" dir="ltr">
                          <code>{aiAnalysis.fixCode}</code>
                        </pre>
                      )}
                      {typeof aiAnalysis.recommendations === "string" && aiAnalysis.recommendations.trim() && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <strong>توصيات إضافية:</strong> {aiAnalysis.recommendations}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* تغيير الحالة */}
                <div className="border-t pt-3">
                  <h4 className="text-sm font-semibold mb-2">تحديث حالة الثغرة</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(selected.id, "in_progress")}
                      className="text-xs"
                    >
                      قيد المعالجة
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(selected.id, "fixed")}
                      className="text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 ml-1" />
                      تم الإصلاح
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(selected.id, "ignored")}
                      className="text-xs"
                    >
                      تجاهل
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
