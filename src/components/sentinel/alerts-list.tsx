"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Send, MessageCircle, CheckCircle2, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Alert = {
  id: string;
  channel: string;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  sentAt: string;
};

const channelIcon: Record<string, typeof Bell> = {
  telegram: MessageCircle,
  email: Send,
  webhook: Bell,
};

export function AlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/alerts?limit=20")
      .then((r) => r.json())
      .then((d) => {
        setAlerts(d.alerts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    fetch("/api/alerts?limit=20")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setAlerts(d.alerts || []);
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

  const sendTest = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "🧪 رسالة اختبار من Cyber-SentinelBaran",
          body: "تم استلام هذه الرسالة بنجاح. منظومة الفحص الأمني تعمل بشكل سليم.",
          channel: "telegram",
        }),
      });
      if (res.ok) {
        toast.success("تم إرسال التنبيه التجريبي");
        load();
      } else {
        toast.error("فشل إرسال التنبيه");
      }
    } catch {
      toast.error("خطأ في الإرسال");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-purple-500" />
          <CardTitle className="text-sm">سجل التنبيهات (Telegram)</CardTitle>
          <Badge variant="outline" className="text-xs">{alerts.length}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={sendTest} disabled={sending} className="h-7 text-xs">
          {sending ? (
            <>
              <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin ml-1" />
              جارٍ الإرسال...
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5 ml-1" />
              إرسال اختبار
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] custom-scroll pr-2">
          <div className="space-y-2">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-md bg-muted/20 animate-pulse" />
                ))
              : alerts.map((alert, idx) => {
                  const Icon = channelIcon[alert.channel] || Bell;
                  const time = new Date(alert.sentAt).toLocaleString("ar", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`p-3 rounded-md border ${
                        alert.status === "sent"
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "border-red-500/20 bg-red-500/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Icon className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                          <span className="text-xs font-semibold truncate">{alert.subject}</span>
                        </div>
                        {alert.status === "sent" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{alert.body}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="font-mono">{alert.recipient}</span>
                        <span>{time}</span>
                      </div>
                    </motion.div>
                  );
                })}
            {!loading && alerts.length === 0 && (
              <div className="text-center py-12 text-sm text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                لا توجد تنبيهات بعد
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
