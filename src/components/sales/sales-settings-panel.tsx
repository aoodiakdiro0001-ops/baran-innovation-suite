"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Database,
  Send,
  ShoppingBag,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

type SettingsMap = Record<string, string>;

const DEFAULT_SYSTEM_PROMPT =
  "أنت وكيل مبيعات ودعم عملاء محترف لشركة ZeroBaran. تصرف بلباقة، ساعد العميل في اختيار المنتج المناسب، أجب عن استفساراته بدقة، ووجهه لإتمام الطلب. استخدم معلومات قاعدة المعرفة المتاحة.";

export function SalesSettingsPanel() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.settings || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) toast.success("تم حفظ إعدادات Omni-Sales ZeroBaran");
      else toast.error("فشل الحفظ");
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, value: string) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const toggleReveal = (key: string) => {
    setRevealed((r) => ({ ...r, [key]: !r[key] }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-48" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Provider */}
        <Card className="border-indigo-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-indigo-500/10">
                <Brain className="h-4 w-4 text-indigo-500" />
              </div>
              محرّك الـ AI التجاري
              <Badge variant="outline" className="text-xs mr-auto">Sales Agent</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs mb-1.5 block">المزود</Label>
              <Select
                value={settings.OMNI_AI_PROVIDER || "gemini"}
                onValueChange={(v) => update("OMNI_AI_PROVIDER", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Google Gemini (مجاني)</SelectItem>
                  <SelectItem value="groq">Groq API (سريع)</SelectItem>
                  <SelectItem value="zai">Z.ai SDK (مدمج)</SelectItem>
                  <SelectItem value="openrouter">OpenRouter (نماذج متعددة)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="OMNI_GEMINI_API_KEY" className="text-xs mb-1.5 block">
                Gemini / Groq API Key
              </Label>
              <div className="relative">
                <Input
                  id="OMNI_GEMINI_API_KEY"
                  type={revealed.OMNI_GEMINI_API_KEY ? "text" : "password"}
                  value={settings.OMNI_GEMINI_API_KEY || ""}
                  onChange={(e) => update("OMNI_GEMINI_API_KEY", e.target.value)}
                  placeholder="AIza..."
                  className="text-xs font-mono pr-10"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute top-1 left-1 h-7 w-7"
                  onClick={() => toggleReveal("OMNI_GEMINI_API_KEY")}
                >
                  {revealed.OMNI_GEMINI_API_KEY ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="OMNI_RESPONSE_DEPTH" className="text-xs mb-1.5 block">
                عمق الرد
              </Label>
              <Select
                value={settings.OMNI_RESPONSE_DEPTH || "balanced"}
                onValueChange={(v) => update("OMNI_RESPONSE_DEPTH", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise">موجز (≤ 100 كلمة)</SelectItem>
                  <SelectItem value="balanced">متوازن (150-250 كلمة)</SelectItem>
                  <SelectItem value="detailed">تفصيلي (300+ كلمة)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="OMNI_SYSTEM_PROMPT" className="text-xs mb-1.5 block">
                System Prompt (تخصيص)
              </Label>
              <Textarea
                id="OMNI_SYSTEM_PROMPT"
                value={settings.OMNI_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT}
                onChange={(e) => update("OMNI_SYSTEM_PROMPT", e.target.value)}
                placeholder={DEFAULT_SYSTEM_PROMPT}
                className="text-xs min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base (Supabase) */}
        <Card className="border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-cyan-500/10">
                <Database className="h-4 w-4 text-cyan-500" />
              </div>
              قاعدة المعرفة (Supabase + pgvector)
              <Badge variant="outline" className="text-xs mr-auto">RAG</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="OMNI_SUPABASE_URL" className="text-xs mb-1.5 block">
                Project URL
              </Label>
              <Input
                id="OMNI_SUPABASE_URL"
                value={settings.OMNI_SUPABASE_URL || ""}
                onChange={(e) => update("OMNI_SUPABASE_URL", e.target.value)}
                placeholder="https://xxxxx.supabase.co"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="OMNI_SUPABASE_ANON_KEY" className="text-xs mb-1.5 block">
                Anon Key
              </Label>
              <Input
                id="OMNI_SUPABASE_ANON_KEY"
                type={revealed.OMNI_SUPABASE_ANON_KEY ? "text" : "password"}
                value={settings.OMNI_SUPABASE_ANON_KEY || ""}
                onChange={(e) => update("OMNI_SUPABASE_ANON_KEY", e.target.value)}
                placeholder="eyJ..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="OMNI_PGVECTOR_DIM" className="text-xs mb-1.5 block">
                pgvector dimension
              </Label>
              <Select
                value={settings.OMNI_PGVECTOR_DIM || "1536"}
                onValueChange={(v) => update("OMNI_PGVECTOR_DIM", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="384">384 (MiniLM)</SelectItem>
                  <SelectItem value="768">768 (Gemini)</SelectItem>
                  <SelectItem value="1536">1536 (OpenAI ada)</SelectItem>
                  <SelectItem value="3072">3072 (OpenAI v3-large)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="OMNI_KB_UPDATE_INTERVAL" className="text-xs mb-1.5 block">
                فترة تحديث الكتالوج (ساعات)
              </Label>
              <Input
                id="OMNI_KB_UPDATE_INTERVAL"
                type="number"
                value={settings.OMNI_KB_UPDATE_INTERVAL || "24"}
                onChange={(e) => update("OMNI_KB_UPDATE_INTERVAL", e.target.value)}
                className="text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                كل 24 ساعة يُعاد توليد embeddings للعناصر المعدّلة
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Telegram Integration */}
        <Card className="border-sky-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-sky-500/10">
                <Send className="h-4 w-4 text-sky-500" />
              </div>
              تكامل Telegram
              <Badge variant="outline" className="text-xs mr-auto">Omnichannel</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="OMNI_TELEGRAM_BOT_TOKEN" className="text-xs mb-1.5 block">
                Bot Token
              </Label>
              <Input
                id="OMNI_TELEGRAM_BOT_TOKEN"
                type={revealed.OMNI_TELEGRAM_BOT_TOKEN ? "text" : "password"}
                value={settings.OMNI_TELEGRAM_BOT_TOKEN || ""}
                onChange={(e) => update("OMNI_TELEGRAM_BOT_TOKEN", e.target.value)}
                placeholder="123456:ABC..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="OMNI_TELEGRAM_CHAT_ID" className="text-xs mb-1.5 block">
                Chat ID (للإشعارات)
              </Label>
              <Input
                id="OMNI_TELEGRAM_CHAT_ID"
                value={settings.OMNI_TELEGRAM_CHAT_ID || ""}
                onChange={(e) => update("OMNI_TELEGRAM_CHAT_ID", e.target.value)}
                placeholder="@baranavi_support"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="OMNI_ESCALATION_THRESHOLD" className="text-xs mb-1.5 block">
                حد التحويل لموظف (Score)
              </Label>
              <Input
                id="OMNI_ESCALATION_THRESHOLD"
                type="number"
                value={settings.OMNI_ESCALATION_THRESHOLD || "40"}
                onChange={(e) => update("OMNI_ESCALATION_THRESHOLD", e.target.value)}
                className="text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                40 = محادثات برضا أقل من 40% تُحوّل تلقائياً
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sales Config */}
        <Card className="border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-500/10">
                <ShoppingBag className="h-4 w-4 text-emerald-500" />
              </div>
              إعدادات البيع
              <Badge variant="outline" className="text-xs mr-auto">Checkout</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="OMNI_CURRENCY" className="text-xs mb-1.5 block">
                العملة الافتراضية
              </Label>
              <Select
                value={settings.OMNI_CURRENCY || "USD"}
                onValueChange={(v) => update("OMNI_CURRENCY", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="TRY">TRY (₺)</SelectItem>
                  <SelectItem value="SAR">SAR (ر.س)</SelectItem>
                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="BTC">BTC (₿)</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="OMNI_PAYMENT_METHODS" className="text-xs mb-1.5 block">
                طرق الدفع (JSON)
              </Label>
              <Textarea
                id="OMNI_PAYMENT_METHODS"
                value={
                  settings.OMNI_PAYMENT_METHODS ||
                  JSON.stringify(
                    ["Visa/Mastercard (Stripe)", "IBAN (TR/USD)", "Bitcoin (BTC)", "USDT-TRC20"],
                    null,
                    0
                  )
                }
                onChange={(e) => update("OMNI_PAYMENT_METHODS", e.target.value)}
                placeholder='["Visa", "IBAN", "BTC", "USDT"]'
                className="text-xs font-mono min-h-[60px]"
              />
            </div>
            <div>
              <Label htmlFor="OMNI_AUTO_ESCALATION" className="text-xs mb-1.5 block">
                قواعد التحويل التلقائي
              </Label>
              <Textarea
                id="OMNI_AUTO_ESCALATION"
                value={settings.OMNI_AUTO_ESCALATION || "شكوى صريحة، عدم رضا متكرر، طلب موظف، حالة دفع معقدة"}
                onChange={(e) => update("OMNI_AUTO_ESCALATION", e.target.value)}
                className="text-xs min-h-[50px]"
              />
            </div>
            <div>
              <Label htmlFor="OMNI_BUSINESS_HOURS" className="text-xs mb-1.5 block">
                ساعات العمل (للتحويل خارج الدوام)
              </Label>
              <Input
                id="OMNI_BUSINESS_HOURS"
                value={settings.OMNI_BUSINESS_HOURS || "09:00-22:00 (UTC+3)"}
                onChange={(e) => update("OMNI_BUSINESS_HOURS", e.target.value)}
                className="text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                خارج ساعات العمل: AI يرد + يُجدوِل الموظف للدوام القادم
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Bar */}
      <div className="sticky bottom-4 z-30">
        <Card className="bg-card/95 backdrop-blur border-indigo-500/40 shadow-lg cyber-glow">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-indigo-500" />
              <span className="text-xs">المفاتيح تُحفظ محلياً فقط — لا تُرسل لأي طرف ثالث.</span>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="text-xs h-8 bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
            >
              {saving ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin ml-1.5" />
                  جارٍ الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 ml-1.5" />
                  حفظ الإعدادات
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
