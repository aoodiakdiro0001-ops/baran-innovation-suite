"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Users,
  CheckCircle2,
  Star,
  Mail,
  Building2,
  MapPin,
  TrendingUp,
  Trophy,
  Send,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Outreach = {
  id: string;
  status: string;
  channel: string;
  type: string;
  personalizationScore: number;
};

type Lead = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  title: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  source: string;
  signals: string | null;
  lastActivity: string | null;
  score: number;
  status: string;
  stage: string;
  companySize: string | null;
  budget: string | null;
  notes: string | null;
  discoveredAt: string;
  lastContactAt: string | null;
  convertedAt: string | null;
  outreaches: Outreach[];
};

const statusConfig: Record<string, { label: string; class: string; icon: typeof CheckCircle2 }> = {
  new: { label: "جديد", class: "bg-blue-500/15 text-blue-500 border-blue-500/30", icon: Star },
  contacted: { label: "تم التواصل", class: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30", icon: Send },
  interested: { label: "مهتم", class: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30", icon: TrendingUp },
  won: { label: "مغلق ✅", class: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30", icon: Trophy },
  lost: { label: "فقد", class: "bg-red-500/15 text-red-500 border-red-500/30", icon: XCircle },
};

const stageLabel: Record<string, string> = {
  discovery: "اكتشاف",
  qualified: "مؤهّل",
  proposal: "عرض",
  negotiation: "تفاوض",
  closed: "مغلق",
};

const industryEmoji: Record<string, string> = {
  ecommerce: "🛒",
  saas: "☁️",
  agency: "🎨",
  gaming: "🎮",
  retail: "🏪",
};

export function PipelineView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);

  const load = async () => {
    try {
      const r = await fetch("/api/leads/leads?limit=30");
      const d = await r.json();
      setLeads(d.leads || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const r = await fetch("/api/leads/leads?limit=30");
        const d = await r.json();
        setLeads(d.leads || []);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchInitial();
    const t = setInterval(load, 15000);
    const handler = () => load();
    window.addEventListener("leads-scraped", handler);
    return () => {
      clearInterval(t);
      window.removeEventListener("leads-scraped", handler);
    };
  }, []);

  const updateStatus = async (id: string, status: string, stage?: string) => {
    try {
      const res = await fetch(`/api/leads/leads?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(stage && { stage }) }),
      });
      if (res.ok) {
        toast.success(`تم تحديث: ${statusConfig[status]?.label || status}`);
        load();
      }
    } catch {
      toast.error("فشل التحديث");
    }
  };

  const parseSignals = (s: string | null) => {
    if (!s) return [];
    try {
      return JSON.parse(s) as string[];
    } catch {
      return [];
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-rose-500" />
          <CardTitle className="text-sm">خط المبيعات (Pipeline)</CardTitle>
          <Badge variant="outline" className="text-xs">{leads.length} عميل</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[480px] custom-scroll pr-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 rounded-md bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {leads.map((lead, idx) => {
                const cfg = statusConfig[lead.status] || statusConfig.new;
                const StatusIcon = cfg.icon;
                const signals = parseSignals(lead.signals);
                return (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelected(lead)}
                    className="group p-3 rounded-md border border-border bg-card/50 hover:border-rose-500/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-1.5 rounded-md bg-rose-500/10 shrink-0 text-base">
                          {lead.industry ? industryEmoji[lead.industry] : "👤"}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{lead.name}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                            {lead.company && <span className="truncate">{lead.company}</span>}
                            {lead.title && <span>• {lead.title}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant="outline" className={`text-[10px] ${cfg.class}`}>
                          <StatusIcon className="h-2.5 w-2.5 ml-0.5" />
                          {cfg.label}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] ${
                          lead.score >= 85 ? "severity-low" : lead.score >= 70 ? "severity-medium" : "severity-high"
                        }`}>
                          Score: {lead.score}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                      {lead.industry && <span>🏭 {lead.industry}</span>}
                      {lead.location && <span>• 📍 {lead.location}</span>}
                      {lead.budget && <span>• 💰 {lead.budget}</span>}
                      {signals.length > 0 && (
                        <span className="text-rose-600 dark:text-rose-400">• ⚡ {signals.length} إشارات</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-rose-500" />
                  {selected.name}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  <span className="inline-flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">{selected.company}</Badge>
                    <Badge variant="outline" className="text-xs">{selected.title}</Badge>
                    <Badge variant="outline" className="text-xs">{selected.industry}</Badge>
                    <Badge className={`text-xs ${statusConfig[selected.status]?.class || ""}`}>
                      {statusConfig[selected.status]?.label || selected.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">Stage: {stageLabel[selected.stage] || selected.stage}</Badge>
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded-md bg-muted/20 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-cyan-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground">Email</div>
                      <div className="text-xs font-mono truncate" dir="ltr">{selected.email || "—"}</div>
                    </div>
                  </div>
                  <div className="p-2 rounded-md bg-muted/20 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground">Website</div>
                      <div className="text-xs font-mono truncate" dir="ltr">{selected.website || "—"}</div>
                    </div>
                  </div>
                  <div className="p-2 rounded-md bg-muted/20 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground">Location</div>
                      <div className="text-xs">{selected.location || "—"}</div>
                    </div>
                  </div>
                  <div className="p-2 rounded-md bg-muted/20 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground">Budget</div>
                      <div className="text-xs font-mono">{selected.budget || "—"}</div>
                    </div>
                  </div>
                </div>

                {/* Score & Activity */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/30">
                    <div className="text-xs text-muted-foreground mb-1">Score</div>
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{selected.score}</div>
                    <div className="text-[10px] text-muted-foreground">/100</div>
                  </div>
                  <div className="p-3 rounded-md bg-muted/20">
                    <div className="text-xs text-muted-foreground mb-1">آخر نشاط</div>
                    <div className="text-sm">{selected.lastActivity || "—"}</div>
                  </div>
                </div>

                {/* Signals */}
                {parseSignals(selected.signals).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">إشارات الفرصة (Signals)</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {parseSignals(selected.signals).map((sig, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-mono">
                          ⚡ {sig}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selected.notes && (
                  <div className="p-3 rounded-md bg-yellow-500/10 border border-yellow-500/30">
                    <h4 className="text-sm font-semibold mb-1">ملاحظات</h4>
                    <p className="text-xs">{selected.notes}</p>
                  </div>
                )}

                {/* Outreaches */}
                {selected.outreaches.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">رسائل التواصل ({selected.outreaches.length})</h4>
                    <div className="space-y-1.5">
                      {selected.outreaches.map((o) => (
                        <div key={o.id} className="flex items-center justify-between p-2 rounded-md bg-muted/20 text-xs">
                          <span className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{o.channel}</Badge>
                            <Badge variant="outline" className="text-[10px]">{o.type}</Badge>
                            <span className="text-muted-foreground">تخصيص: {o.personalizationScore}%</span>
                          </span>
                          <Badge className={`text-[10px] ${
                            o.status === "approved" || o.status === "sent" ? "severity-low"
                            : o.status === "replied" ? "severity-medium"
                            : "bg-muted text-muted-foreground"
                          }`}>
                            {o.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  {selected.status === "new" && (
                    <Button size="sm" className="text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white" onClick={() => updateStatus(selected.id, "contacted", "qualified")}>
                      <Send className="h-3.5 w-3.5 ml-1.5" />
                      تم التواصل
                    </Button>
                  )}
                  {(selected.status === "contacted" || selected.status === "new") && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => updateStatus(selected.id, "interested", "qualified")}>
                      <TrendingUp className="h-3.5 w-3.5 ml-1.5" />
                      مهتم
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => updateStatus(selected.id, "won", "closed")}>
                    <Trophy className="h-3.5 w-3.5 ml-1.5" />
                    إغلاق الصفقة
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-500/30 hover:bg-red-500/10" onClick={() => updateStatus(selected.id, "lost")}>
                    <XCircle className="h-3.5 w-3.5 ml-1.5" />
                    فقد
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
