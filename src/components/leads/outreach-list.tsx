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
  Mail,
  Send,
  Check,
  Reply,
  PenLine,
  Sparkles,
  Copy,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Outreach = {
  id: string;
  channel: string;
  type: string;
  subject: string | null;
  body: string;
  personalizationScore: number;
  tone: string;
  status: string;
  sentAt: string | null;
  repliedAt: string | null;
  replyContent: string | null;
  approved: boolean;
  approvedAt: string | null;
  createdAt: string;
  lead?: { name: string; company: string | null; email: string | null; industry: string | null; score: number };
};

const statusConfig: Record<string, { label: string; class: string; icon: typeof Send }> = {
  draft: { label: "مسودة", class: "bg-muted text-muted-foreground border-border", icon: PenLine },
  approved: { label: "موافق عليها", class: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30", icon: Check },
  sent: { label: "مُرسلة", class: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30", icon: Send },
  replied: { label: "مُجاب عليها", class: "bg-purple-500/15 text-purple-500 border-purple-500/30", icon: Reply },
};

const channelLabel: Record<string, string> = {
  email: "📧 Email",
  linkedin: "💼 LinkedIn",
  telegram: "✈️ Telegram",
  whatsapp: "💬 WhatsApp",
};

export function OutreachList() {
  const [outreaches, setOutreaches] = useState<Outreach[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Outreach | null>(null);

  const load = async () => {
    try {
      const r = await fetch("/api/leads/outreaches?limit=20");
      const d = await r.json();
      setOutreaches(d.outreaches || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const r = await fetch("/api/leads/outreaches?limit=20");
        const d = await r.json();
        setOutreaches(d.outreaches || []);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchInitial();
    const t = setInterval(load, 10000);
    const handler = () => load();
    window.addEventListener("leads-scraped", handler);
    return () => {
      clearInterval(t);
      window.removeEventListener("leads-scraped", handler);
    };
  }, []);

  const approve = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/outreaches?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`تم تحديث: ${statusConfig[newStatus]?.label || newStatus}`);
        load();
      }
    } catch {
      toast.error("فشل التحديث");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-cyan-500" />
          <CardTitle className="text-sm">رسائل التواصل (AI Outreach)</CardTitle>
          <Badge variant="outline" className="text-xs">{outreaches.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[480px] custom-scroll pr-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 rounded-md bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {outreaches.map((o, idx) => {
                const cfg = statusConfig[o.status] || statusConfig.draft;
                const StatusIcon = cfg.icon;
                return (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelected(o)}
                    className="group p-3 rounded-md border border-border bg-card/50 hover:border-cyan-500/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate">
                          {o.lead?.name || "—"} {o.lead?.company && <span className="text-muted-foreground">• {o.lead.company}</span>}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {o.subject ? o.subject : `(${o.type} ${channelLabel[o.channel] || o.channel})`}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge className={`text-[10px] ${cfg.class}`}>
                          <StatusIcon className="h-2.5 w-2.5 ml-0.5" />
                          {cfg.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">{channelLabel[o.channel] || o.channel}</Badge>
                      <Badge variant="outline" className="text-[10px]">{o.type}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${o.personalizationScore >= 90 ? "severity-low" : o.personalizationScore >= 80 ? "severity-medium" : "severity-high"}`}>
                        <Sparkles className="h-2.5 w-2.5 ml-0.5" />
                        تخصيص: {o.personalizationScore}%
                      </Badge>
                      <span className="text-muted-foreground">{o.tone}</span>
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
                  <Mail className="h-5 w-5 text-cyan-500" />
                  {selected.lead?.name ? `رسالة إلى ${selected.lead.name}` : "رسالة تواصل"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  <span className="inline-flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">{channelLabel[selected.channel] || selected.channel}</Badge>
                    <Badge variant="outline" className="text-xs">{selected.type}</Badge>
                    <Badge className={`text-xs ${statusConfig[selected.status]?.class || ""}`}>
                      {statusConfig[selected.status]?.label || selected.status}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${selected.personalizationScore >= 90 ? "severity-low" : "severity-medium"}`}>
                      تخصيص: {selected.personalizationScore}%
                    </Badge>
                    <Badge variant="outline" className="text-xs">{selected.tone}</Badge>
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Lead info */}
                {selected.lead && (
                  <div className="p-3 rounded-md bg-rose-500/5 border border-rose-500/20">
                    <div className="text-[10px] text-muted-foreground mb-1">العميل المستهدف</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><strong>{selected.lead.name}</strong></div>
                      <div className="text-muted-foreground">{selected.lead.company}</div>
                      <div className="text-muted-foreground font-mono text-[11px]" dir="ltr">{selected.lead.email}</div>
                      <div className="text-muted-foreground">{selected.lead.industry}</div>
                    </div>
                  </div>
                )}

                {/* Subject */}
                {selected.subject && (
                  <div>
                    <div className="text-xs font-semibold mb-1">الموضوع</div>
                    <div className="p-2.5 rounded-md bg-muted/20 text-sm font-medium" dir="auto">{selected.subject}</div>
                  </div>
                )}

                {/* Body */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">نص الرسالة</h4>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => {
                        navigator.clipboard.writeText(selected.body);
                        toast.success("تم نسخ الرسالة");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div
                    className="p-4 rounded-md bg-muted/20 border border-border text-sm leading-relaxed max-h-[300px] overflow-y-auto custom-scroll whitespace-pre-wrap"
                    dir="auto"
                  >
                    {selected.body}
                  </div>
                </div>

                {/* Reply */}
                {selected.replyContent && (
                  <div className="p-3 rounded-md bg-purple-500/10 border border-purple-500/30">
                    <div className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                      <Reply className="h-3.5 w-3.5 text-purple-500" />
                      رد العميل
                    </div>
                    <p className="text-sm leading-relaxed">{selected.replyContent}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    أُنشئ: {new Date(selected.createdAt).toLocaleString("ar")}
                  </span>
                  {selected.sentAt && (
                    <span className="flex items-center gap-1">
                      <Send className="h-3 w-3" />
                      أُرسل: {new Date(selected.sentAt).toLocaleString("ar")}
                    </span>
                  )}
                  {selected.repliedAt && (
                    <span className="flex items-center gap-1">
                      <Reply className="h-3 w-3" />
                      الرد: {new Date(selected.repliedAt).toLocaleString("ar")}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  {selected.status === "draft" && (
                    <>
                      <Button
                        size="sm"
                        className="text-xs bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                        onClick={() => approve(selected.id, "approved")}
                      >
                        <Check className="h-3.5 w-3.5 ml-1.5" />
                        اعتماد
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(selected.body);
                          toast.success("تم نسخ الرسالة للحافظة");
                        }}
                      >
                        <Copy className="h-3.5 w-3.5 ml-1.5" />
                        نسخ النص
                      </Button>
                    </>
                  )}
                  {(selected.status === "approved" || selected.status === "draft") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-cyan-600 border-cyan-500/30 hover:bg-cyan-500/10"
                      onClick={() => approve(selected.id, "sent")}
                    >
                      <Send className="h-3.5 w-3.5 ml-1.5" />
                      تم الإرسال
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
