"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  User,
  Bitcoin,
  Wallet,
  Globe,
  ExternalLink,
  Copy,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type SettingsMap = Record<string, string>;

export function SupportContact() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.settings || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label} إلى الحافظة`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-64" />
          </Card>
        ))}
      </div>
    );
  }

  const contactInfo = [
    {
      icon: User,
      label: "الاسم",
      value: settings.OWNER_NAME || "Baran Avisat",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      icon: Mail,
      label: "البريد الإلكتروني",
      value: settings.OWNER_EMAIL || "baranavisat@gmail.com",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      href: `mailto:${settings.OWNER_EMAIL || "baranavisat@gmail.com"}`,
    },
    {
      icon: Phone,
      label: "الهاتف (واتساب)",
      value: settings.OWNER_PHONE || "00905313263722",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      href: `https://wa.me/${(settings.OWNER_PHONE || "00905313263722").replace(/[^0-9]/g, "")}`,
    },
    {
      icon: Wallet,
      label: "عنوان USDT (TRC20)",
      value: settings.OWNER_USDT_ADDRESS || "TLWdTjqqogkXNEXGiPWsGdjFP6ioycxeWW",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      copyable: true,
      mono: true,
    },
    {
      icon: Bitcoin,
      label: "عنوان Bitcoin (BTC)",
      value: settings.OWNER_BTC_ADDRESS || "bc1q8dhtdrndxsl70e97t8grydfe6pjue37zrhzf6c",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      copyable: true,
      mono: true,
    },
    {
      icon: Globe,
      label: "محفظة EVM",
      value: settings.EVM_WALLET_ADDRESS || "—",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      copyable: true,
      mono: true,
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-cyan-500/20 cyber-glow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-cyan-500/10">
              <User className="h-4 w-4 text-cyan-500" />
            </div>
            معلومات المالك والدعم
            <Badge variant="outline" className="text-xs mr-auto">قناة اتصال رسمية</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {contactInfo.map((info, idx) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-3 rounded-lg border border-border bg-card/50 hover:border-cyan-500/30 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-md ${info.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${info.color}`} />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {info.label}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-1">
                    <div
                      className={`text-xs ${info.mono ? "font-mono" : ""} text-foreground break-all line-clamp-2 flex-1`}
                      dir={info.mono ? "ltr" : "auto"}
                    >
                      {info.value}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {info.copyable && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-60 group-hover:opacity-100"
                          onClick={() => copyToClipboard(info.value, info.label)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                      {info.href && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-60 group-hover:opacity-100"
                          asChild
                        >
                          <a href={info.href} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
