"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Send,
  Mail,
  Globe,
  Instagram,
  Phone,
  ShoppingBag,
  AlertCircle,
  Clock,
  CheckCircle2,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

type ChatMessage = {
  id: string;
  role: string; // customer | agent | system
  content: string;
  type: string;
  aiModel: string | null;
  ragSources: string | null;
  sentiment: string;
  confidence: number;
  createdAt: string;
};

type Conversation = {
  id: string;
  channel: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  subject: string | null;
  status: string;
  intent: string | null;
  sentiment: string;
  satisfactionScore: number;
  productInterest: string | null;
  leadScore: number;
  escalated: boolean;
  escalatedAt: string | null;
  closedAt: string | null;
  totalMessages: number;
  aiHandled: boolean;
  responseTimeMs: number;
  conversionValue: number;
  converted: boolean;
  startedAt: string;
  lastMessageAt: string;
  messages: ChatMessage[];
};

const statusConfig: Record<string, { label: string; class: string; icon: typeof Clock }> = {
  active: { label: "نشطة", class: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30", icon: Clock },
  waiting_human: { label: "بانتظار موظف", class: "bg-red-500/15 text-red-500 border-red-500/30", icon: AlertCircle },
  closed: { label: "مغلقة", class: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
  abandoned: { label: "متروكة", class: "bg-muted text-muted-foreground border-border", icon: Clock },
};

const channelConfig: Record<string, { label: string; icon: typeof Send; color: string }> = {
  telegram: { label: "تليجرام", icon: Send, color: "text-sky-500" },
  whatsapp: { label: "واتساب", icon: Phone, color: "text-green-500" },
  email: { label: "إيميل", icon: Mail, color: "text-purple-500" },
  web: { label: "موقع", icon: Globe, color: "text-amber-500" },
  instagram: { label: "إنستغرام", icon: Instagram, color: "text-pink-500" },
};

const intentLabel: Record<string, string> = {
  sales: "مبيعات",
  support: "دعم",
  pricing: "تسعير",
  complaint: "شكوى",
  booking: "حجز",
  info: "استفسار",
};

const sentimentColor: Record<string, string> = {
  positive: "text-emerald-500",
  neutral: "text-muted-foreground",
  negative: "text-red-500",
  mixed: "text-amber-500",
};

function timeAgo(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} س`;
  const days = Math.floor(hours / 24);
  return `${days} ي`;
}

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Conversation | null>(null);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const r = await fetch("/api/sales/conversations?limit=30");
        const d = await r.json();
        setConversations(d.conversations || []);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchInitial();
    const t = setInterval(fetchInitial, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-indigo-500" />
          <CardTitle className="text-sm">المحادثات الحية</CardTitle>
          <Badge variant="outline" className="text-xs">{conversations.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[520px] custom-scroll pr-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-md bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((c, idx) => {
                const cfg = statusConfig[c.status] || statusConfig.active;
                const StatusIcon = cfg.icon;
                const ch = channelConfig[c.channel] || channelConfig.web;
                const ChIcon = ch.icon;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelected(c)}
                    className="group p-3 rounded-md border border-border bg-card/50 hover:border-indigo-500/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-1.5 rounded-md bg-indigo-500/10 shrink-0">
                          <ChIcon className={`h-4 w-4 ${ch.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{c.customerName}</div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {c.subject || ch.label}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge className={`text-[10px] ${cfg.class}`}>
                          <StatusIcon className="h-2.5 w-2.5 ml-0.5" />
                          {cfg.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{timeAgo(c.lastMessageAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                      {c.intent && <Badge variant="outline" className="text-[10px]">{intentLabel[c.intent] || c.intent}</Badge>}
                      <Badge variant="outline" className={`text-[10px] ${sentimentColor[c.sentiment] || ""}`}>
                        {c.sentiment}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${c.leadScore >= 80 ? "severity-low" : c.leadScore >= 60 ? "severity-medium" : "severity-high"}`}>
                        Score: {c.leadScore}
                      </Badge>
                      {c.converted && (
                        <Badge variant="outline" className="text-[10px] severity-low">
                          <ShoppingBag className="h-2.5 w-2.5 ml-0.5" />
                          ${c.conversionValue}
                        </Badge>
                      )}
                      {c.escalated && (
                        <Badge variant="outline" className="text-[10px] severity-high">
                          <AlertCircle className="h-2.5 w-2.5 ml-0.5" />
                          تحويل
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Chat Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-500" />
                  {selected.customerName}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  <span className="inline-flex items-center gap-2 mt-1 flex-wrap">
                    {(() => {
                      const ch = channelConfig[selected.channel] || channelConfig.web;
                      const ChIcon = ch.icon;
                      return (
                        <Badge variant="outline" className="text-xs">
                          <ChIcon className={`h-3 w-3 ml-1 ${ch.color}`} />
                          {ch.label}
                        </Badge>
                      );
                    })()}
                    {selected.intent && (
                      <Badge variant="outline" className="text-xs">{intentLabel[selected.intent] || selected.intent}</Badge>
                    )}
                    <Badge className={`text-xs ${statusConfig[selected.status]?.class || ""}`}>
                      {statusConfig[selected.status]?.label || selected.status}
                    </Badge>
                    {selected.escalated && (
                      <Badge variant="outline" className="text-xs severity-high">
                        <AlertCircle className="h-3 w-3 ml-1" />
                        مُحوّلة لموظف
                      </Badge>
                    )}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded-md bg-muted/20">
                    <div className="text-[10px] text-muted-foreground mb-1">منتج مهتم</div>
                    <div className="text-xs font-medium">{selected.productInterest || "—"}</div>
                  </div>
                  <div className="p-2 rounded-md bg-muted/20">
                    <div className="text-[10px] text-muted-foreground mb-1">قيمة التحويل</div>
                    <div className="text-xs font-mono">
                      ${selected.conversionValue.toFixed(2)}
                      {selected.converted && <span className="text-emerald-500 mr-1">✓</span>}
                    </div>
                  </div>
                  <div className="p-2 rounded-md bg-muted/20">
                    <div className="text-[10px] text-muted-foreground mb-1">رضا العميل</div>
                    <div className="text-xs flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500" />
                      {selected.satisfactionScore}/100
                    </div>
                  </div>
                  <div className="p-2 rounded-md bg-muted/20">
                    <div className="text-[10px] text-muted-foreground mb-1">Lead Score</div>
                    <div className="text-xs font-mono">{selected.leadScore}/100</div>
                  </div>
                </div>

                {/* Chat messages */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">سجل المحادثة ({selected.messages.length})</h4>
                  <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scroll p-2 rounded-md bg-muted/10 border border-border">
                    {selected.messages.map((m) => {
                      const isCustomer = m.role === "customer";
                      return (
                        <div key={m.id} className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}>
                          <div className={`max-w-[80%] rounded-2xl p-2.5 text-xs whitespace-pre-wrap ${
                            isCustomer
                              ? "bg-muted/40 border border-border rounded-bl-sm"
                              : "bg-indigo-500/15 border border-indigo-500/30 rounded-br-sm"
                          }`} dir="auto">
                            <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                              {isCustomer ? (
                                <span className="text-indigo-500">👤 {selected.customerName}</span>
                              ) : (
                                <span className="text-indigo-500">🤖 AI Agent</span>
                              )}
                              {m.aiModel && <span className="font-mono">· {m.aiModel}</span>}
                              {m.confidence > 0 && <span>· {m.confidence}%</span>}
                            </div>
                            <div className="leading-relaxed">{m.content}</div>
                            <div className="text-[9px] text-muted-foreground mt-1" dir="ltr">
                              {new Date(m.createdAt).toLocaleString("ar")}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    بدأت: {new Date(selected.startedAt).toLocaleString("ar")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Send className="h-3 w-3" />
                    آخر رسالة: {new Date(selected.lastMessageAt).toLocaleString("ar")}
                  </span>
                  {selected.closedAt && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      أُغلقت: {new Date(selected.closedAt).toLocaleString("ar")}
                    </span>
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
