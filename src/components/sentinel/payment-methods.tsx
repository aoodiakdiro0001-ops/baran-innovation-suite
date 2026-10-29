"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Bitcoin, Wallet, Copy, Shield, Info } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type SettingsMap = Record<string, string>;

export function PaymentMethods() {
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

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6 h-72" />
      </Card>
    );
  }

  const ibanTRY = settings.OWNER_IBAN_TRY || "TR10 0001 0090 1008 4013 0050 01";
  const ibanUSD = settings.OWNER_IBAN_USD || "TR80 0001 0090 1008 4013 0050 02";
  const btcAddr = settings.OWNER_BTC_ADDRESS || "bc1q8dhtdrndxsl70e97t8grydfe6pjue37zrhzf6c";
  const usdtAddr = settings.OWNER_USDT_ADDRESS || "TLWdTjqqogkXNEXGiPWsGdjFP6ioycxeWW";
  const ownerName = settings.OWNER_NAME || "Baran Avisat";

  return (
    <Card className="border-emerald-500/20">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-500/10">
            <Wallet className="h-4 w-4 text-emerald-500" />
          </div>
          طرق الدفع المتنوعة
        </CardTitle>
        <Badge variant="outline" className="text-xs">
          <Shield className="h-3 w-3 ml-1 text-emerald-500" />
          دفع آمن
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="bank" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="bank" className="text-xs py-1.5">
              <Building2 className="h-3.5 w-3.5 ml-1.5" />
              تحويل بنكي
            </TabsTrigger>
            <TabsTrigger value="crypto" className="text-xs py-1.5">
              <Bitcoin className="h-3.5 w-3.5 ml-1.5" />
              عملات رقمية
            </TabsTrigger>
          </TabsList>

          {/* Bank Transfer */}
          <TabsContent value="bank" className="mt-3 space-y-3">
            <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">🇹🇷</span>
                <span className="text-xs font-semibold">حساب تركي (TRY)</span>
                <Badge variant="outline" className="text-[10px] mr-auto">ليرة تركية</Badge>
              </div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <code className="text-xs font-mono flex-1 break-all" dir="ltr">
                  {ibanTRY}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => copy(ibanTRY, "IBAN التركي")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                <span>اسم صاحب الحساب:</span>
                <span className="font-medium text-foreground">{ownerName}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">💵</span>
                <span className="text-xs font-semibold">حساب دولاري (USD)</span>
                <Badge variant="outline" className="text-[10px] mr-auto">دولار أمريكي</Badge>
              </div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <code className="text-xs font-mono flex-1 break-all" dir="ltr">
                  {ibanUSD}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => copy(ibanUSD, "IBAN الدولاري")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                <span>اسم صاحب الحساب:</span>
                <span className="font-medium text-foreground">{ownerName}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/20 text-[11px] text-muted-foreground leading-relaxed">
              <Info className="h-3 w-3 ml-1 inline" />
              بعد إتمام التحويل، أرسل إيصال التحويل إلى{" "}
              <a href="mailto:baranavisat@gmail.com" className="text-cyan-600 dark:text-cyan-400 underline">
                baranavisat@gmail.com
              </a>{" "}
              أو عبر واتساب{" "}
              <a
                href="https://wa.me/00905313263722"
                className="text-cyan-600 dark:text-cyan-400 underline"
              >
                00905313263722
              </a>{" "}
              مع ذكر اسم المنتج، وسنفعّل الاشتراك خلال 24 ساعة.
            </div>
          </TabsContent>

          {/* Crypto Payments */}
          <TabsContent value="crypto" className="mt-3 space-y-3">
            <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Bitcoin className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-semibold">Bitcoin (BTC)</span>
                <Badge variant="outline" className="text-[10px] mr-auto">لمن لا يملك حساباً بنكياً</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono flex-1 break-all text-yellow-600 dark:text-yellow-400" dir="ltr">
                  {btcAddr}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => copy(btcAddr, "عنوان Bitcoin")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                ✓ قبول التحويلات من أي محفظة (Trust Wallet, Binance, Coinbase, Electrum...)
                <br />
                ✓ الإيداع بعد تأكيد شبكة واحدة (10 دقائق تقريباً)
              </div>
            </div>

            <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">₮</span>
                <span className="text-xs font-semibold">USDT (TRC20)</span>
                <Badge variant="outline" className="text-[10px] mr-auto">Tether - شبكة Tron</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono flex-1 break-all text-orange-600 dark:text-orange-400" dir="ltr">
                  {usdtAddr}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => copy(usdtAddr, "عنوان USDT")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                ✓ رسوم منخفضة (~1$) وسرعة عالية (تأكيد خلال دقيقة)
                <br />
                ✓ يدعم Binance Pay وOKX وHuobi وTrust Wallet
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-muted-foreground leading-relaxed"
            >
              <Shield className="h-3 w-3 ml-1 inline text-cyan-500" />
              <strong className="text-cyan-600 dark:text-cyan-400">لماذا عملات رقمية؟</strong> لمن لا
              يستطيع الدفع عن طريق البنك لأي سبب (الخصوصية، عدم توفر IBAN، أو سرعة)، نوفّر خياراً
              آمناً وسريعاً عبر Bitcoin وUSDT. المعاملة غير قابلة للعكس بعد التأكيد.
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
