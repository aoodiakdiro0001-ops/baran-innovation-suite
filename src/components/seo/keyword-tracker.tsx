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
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Search, TrendingUp, TrendingDown, Plus, Eye, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Snapshot = { rank: number; capturedAt: string; competitorRank: number | null };
type Keyword = {
  id: string;
  keyword: string;
  locale: string;
  searchVolume: number;
  difficulty: number;
  intent: string;
  currentRank: number;
  previousRank: number;
  bestRank: number;
  worstRank: number;
  url: string | null;
  status: string;
  snapshots: Snapshot[];
};

const statusConfig: Record<string, { label: string; class: string }> = {
  tracking: { label: "قيد الرصد", class: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30" },
  won: { label: "تصدّر", class: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  lost: { label: "مفقودة", class: "bg-red-500/15 text-red-500 border-red-500/30" },
  opportunity: { label: "فرصة", class: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30" },
};

const intentLabel: Record<string, string> = {
  informational: "معلوماتي",
  commercial: "تجاري",
  transactional: "شرائي",
  navigational: "تنقّلي",
};

export function KeywordTracker() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState("");
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Keyword | null>(null);

  const load = async () => {
    try {
      const r = await fetch("/api/seo/keywords?limit=50");
      const d = await r.json();
      setKeywords(d.keywords || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetch("/api/seo/keywords?limit=50")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setKeywords(d.keywords || []);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    const t = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  const addKeyword = async () => {
    if (!newKeyword.trim()) {
      toast.error("أدخل كلمة مفتاحية");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/seo/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: newKeyword.trim(), locale: "ar" }),
      });
      if (res.ok) {
        toast.success(`تمت إضافة "${newKeyword}" للرصد`);
        setNewKeyword("");
        load();
      }
    } catch {
      toast.error("خطأ في الإضافة");
    } finally {
      setAdding(false);
    }
  };

  const formatNum = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const rankBadgeClass = (rank: number) => {
    if (rank === 0) return "bg-muted text-muted-foreground";
    if (rank === 1) return "severity-low";
    if (rank <= 3) return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
    if (rank <= 10) return "bg-yellow-500/15 text-yellow-500 border-yellow-500/30";
    if (rank <= 30) return "bg-orange-500/15 text-orange-500 border-orange-500/30";
    return "bg-red-500/15 text-red-500 border-red-500/30";
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-emerald-500" />
          <CardTitle className="text-sm">متتبّع ترتيب الكلمات المفتاحية</CardTitle>
          <Badge variant="outline" className="text-xs">{keywords.length} كلمة</Badge>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            placeholder="أضف كلمة جديدة للرصد..."
            className="h-8 px-3 text-xs border border-border rounded-md bg-card focus:outline-none focus:border-emerald-500/50"
            dir="rtl"
          />
          <Button onClick={addKeyword} disabled={adding} size="sm" className="h-8 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            {adding ? (
              <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin ml-1" />
            ) : (
              <Plus className="h-3.5 w-3.5 ml-1" />
            )}
            إضافة
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[520px] custom-scroll">
          <Table>
            <TableHeader className="sticky top-0 bg-card/95 backdrop-blur z-10">
              <TableRow>
                <TableHead className="text-xs">الكلمة المفتاحية</TableHead>
                <TableHead className="text-xs text-center">الترتيب</TableHead>
                <TableHead className="text-xs text-center">التغيّر</TableHead>
                <TableHead className="text-xs text-center">حجم البحث</TableHead>
                <TableHead className="text-xs text-center">الصعوبة</TableHead>
                <TableHead className="text-xs text-center">القصد</TableHead>
                <TableHead className="text-xs text-center">الحالة</TableHead>
                <TableHead className="text-xs text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8} className="h-12 animate-pulse bg-muted/20" />
                    </TableRow>
                  ))
                : keywords.map((kw, idx) => {
                    const change = kw.previousRank - kw.currentRank; // موجب = تحسّن
                    const cfg = statusConfig[kw.status] || statusConfig.tracking;
                    return (
                      <motion.tr
                        key={kw.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => setSelected(kw)}
                      >
                        <TableCell className="text-xs font-medium max-w-[180px] truncate" title={kw.keyword}>
                          {kw.keyword}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-xs font-mono ${rankBadgeClass(kw.currentRank)}`}>
                            {kw.currentRank === 0 ? "—" : `#${kw.currentRank}`}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {change > 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
                              <TrendingUp className="h-3 w-3" />
                              +{change}
                            </span>
                          ) : change < 0 ? (
                            <span className="text-red-600 dark:text-red-400 inline-flex items-center gap-0.5">
                              <TrendingDown className="h-3 w-3" />
                              {change}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground font-mono">
                          {formatNum(kw.searchVolume)}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              kw.difficulty < 30
                                ? "bg-emerald-500/10 text-emerald-600"
                                : kw.difficulty < 60
                                ? "bg-yellow-500/10 text-yellow-600"
                                : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {kw.difficulty}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {intentLabel[kw.intent] || kw.intent}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`text-xs ${cfg.class}`}>
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(kw);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <Search className="h-5 w-5 text-emerald-500" />
                  {selected.keyword}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  <span className="inline-flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className={`text-xs font-mono ${rankBadgeClass(selected.currentRank)}`}>
                      الترتيب: #{selected.currentRank}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      أفضل ترتيب: #{selected.bestRank}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      أسوأ: #{selected.worstRank}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatNum(selected.searchVolume)} بحث/شهر
                    </Badge>
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Chart */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">تطور الترتيب (14 يوم)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                      data={selected.snapshots.map((s) => ({
                        date: new Date(s.capturedAt).toLocaleDateString("ar", { day: "numeric", month: "short" }),
                        rank: s.rank,
                        competitor: s.competitorRank,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }}
                        stroke="rgba(255,255,255,0.2)"
                      />
                      <YAxis
                        reversed
                        tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }}
                        stroke="rgba(255,255,255,0.2)"
                        domain={[1, 50]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(20,20,30,0.95)",
                          border: "1px solid rgba(16,185,129,0.3)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line type="monotone" dataKey="rank" name="ترتيبك" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="competitor" name="منافسك" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      toast.success("تم طلب توليد مقال لهذه الكلمة — يُرجى مراجعة قسم المحتوى");
                      window.dispatchEvent(new CustomEvent("seo-content-requested", { detail: { keyword: selected.keyword, keywordId: selected.id } }));
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 ml-1" />
                    توليد مقال لهذه الكلمة
                  </Button>
                  {selected.url && (
                    <Button size="sm" variant="outline" className="text-xs" asChild>
                      <a href={selected.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-3.5 w-3.5 ml-1" />
                        فتح الصفحة المستهدفة
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
