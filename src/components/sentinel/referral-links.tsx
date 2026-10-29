"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2, ExternalLink, ShoppingBag, Coins, Gift } from "lucide-react";
import { motion } from "framer-motion";

type SettingsMap = Record<string, string>;

type LinkItem = {
  key: string;
  label: string;
  desc: string;
  icon: typeof Link2;
  color: string;
  bg: string;
  badge: string;
};

const linkDefs: LinkItem[] = [
  {
    key: "GUMROAD_STORE_URL",
    label: "متجر Gumroad الرسمي",
    desc: "اشترِ منتجاتنا الرقمية مباشرة من متجرنا على Gumroad — كتب، دورات، أدوات أمنية.",
    icon: ShoppingBag,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    badge: "متجر رسمي",
  },
  {
    key: "BINANCE_REFERRAL_URL",
    label: "رابط إحالة Binance",
    desc: "اربح مكافآت عند التسجيل في Binance عبر رابط الإحالة — خصم على رسوم التداول.",
    icon: Coins,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    badge: "إحالة + مكافأة",
  },
  {
    key: "POCKET_FRIENDS_REFERRAL_URL",
    label: "رابط إحالة Pocket Friends",
    desc: "ساعد أصدقاءك في الانضمام إلى Pocket Friends عبر رابط الإحالة.",
    icon: Gift,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    badge: "إحالة",
  },
];

export function ReferralLinks() {
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 h-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card className="border-purple-500/20">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-500/10">
            <Link2 className="h-4 w-4 text-purple-500" />
          </div>
          روابط الإحالة والمتجر الرسمي
        </CardTitle>
        <Badge variant="outline" className="text-xs">3 روابط</Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {linkDefs.map((link, idx) => {
            const Icon = link.icon;
            const url = settings[link.key] || "";
            return (
              <motion.div
                key={link.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`p-3 rounded-lg border border-border bg-card/50 hover:border-${link.color.replace("text-", "")}/40 transition-all`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-1.5 rounded-md ${link.bg}`}>
                    <Icon className={`h-4 w-4 ${link.color}`} />
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {link.badge}
                  </Badge>
                </div>
                <h4 className="text-xs font-semibold mb-1">{link.label}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-2 line-clamp-3">
                  {link.desc}
                </p>
                {url ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-7"
                    asChild
                  >
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 ml-1.5" />
                      زيارة الرابط
                    </a>
                  </Button>
                ) : (
                  <span className="text-[10px] text-muted-foreground italic block text-center py-1.5">
                    الرابط غير مُعرّف
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
