"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  KeyRound,
  Brain,
  Bell,
  Database,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

type SettingsMap = Record<string, string>;

export function LeadSettingsPanel() {
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
      if (res.ok) toast.success("تم حفظ إعدادات Lead-Sniper ZeroBaran");
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
        <Card className="border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-purple-500/10">
                <Brain className="h-4 w-4 text-purple-500" />
              </div>
              محرّك التخصيص الذكي
              <Badge variant="outline" className="text-xs mr-auto">AI Outreach</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs mb-1.5 block">المزود</Label>
              <Select
                value={settings.LEAD_AI_PROVIDER || "gemini"}
                onValueChange={(v) => update("LEAD_AI_PROVIDER", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Google Gemini (مجاني)</SelectItem>
                  <SelectItem value="groq">Groq API (سريع)</SelectItem>
                  <SelectItem value="openrouter">OpenRouter (نماذج متعددة)</SelectItem>
                  <SelectItem value="zai">Z.ai SDK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="LEAD_GEMINI_API_KEY" className="text-xs mb-1.5 block">
                Gemini API Key
              </Label>
              <div className="relative">
                <Input
                  id="LEAD_GEMINI_API_KEY"
                  type={revealed.LEAD_GEMINI_API_KEY ? "text" : "password"}
                  value={settings.LEAD_GEMINI_API_KEY || ""}
                  onChange={(e) => update("LEAD_GEMINI_API_KEY", e.target.value)}
                  placeholder="AIza..."
                  className="text-xs font-mono pr-10"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute top-1 left-1 h-7 w-7"
                  onClick={() => toggleReveal("LEAD_GEMINI_API_KEY")}
                >
                  {revealed.LEAD_GEMINI_API_KEY ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="LEAD_DEFAULT_TONE" className="text-xs mb-1.5 block">
                الأسلوب الافتراضي للرسائل
              </Label>
              <Select
                value={settings.LEAD_DEFAULT_TONE || "professional"}
                onValueChange={(v) => update("LEAD_DEFAULT_TONE", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">احترافي</SelectItem>
                  <SelectItem value="casual">ودّي</SelectItem>
                  <SelectItem value="formal">رسمي</SelectItem>
                  <SelectItem value="friendly">صديق</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lead Scraper Settings */}
        <Card className="border-rose-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-rose-500/10">
                <Users className="h-4 w-4 text-rose-500" />
              </div>
              إعدادات التنقيب (Scraper)
              <Badge variant="outline" className="text-xs mr-auto">Discovery</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="LEAD_DEFAULT_INDUSTRY" className="text-xs mb-1.5 block">
                الصناعة الافتراضية
              </Label>
              <Select
                value={settings.LEAD_DEFAULT_INDUSTRY || "ecommerce"}
                onValueChange={(v) => update("LEAD_DEFAULT_INDUSTRY", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ecommerce">متاجر إلكترونية</SelectItem>
                  <SelectItem value="saas">شركات SaaS</SelectItem>
                  <SelectItem value="agency">وكالات</SelectItem>
                  <SelectItem value="gaming">ألعاب</SelectItem>
                  <SelectItem value="retail">تجزئة</SelectItem>
                  <SelectItem value="fintech">مالية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="LEAD_SCRAPER_CRON" className="text-xs mb-1.5 block">
                جدول الصيد التلقائي (cron UTC)
              </Label>
              <Input
                id="LEAD_SCRAPER_CRON"
                value={settings.LEAD_SCRAPER_CRON || "0 9 * * 1-5"}
                onChange={(e) => update("LEAD_SCRAPER_CRON", e.target.value)}
                placeholder="0 9 * * 1-5 (أيام عمل 9:00 UTC)"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="LEAD_BATCH_SIZE" className="text-xs mb-1.5 block">
                عدد العملاء لكل دورة
              </Label>
              <Input
                id="LEAD_BATCH_SIZE"
                type="number"
                value={settings.LEAD_BATCH_SIZE || "5"}
                onChange={(e) => update("LEAD_BATCH_SIZE", e.target.value)}
                className="text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                يُنصح بـ 5-10 عملاء لكل دورة لتفادي rate limits على APIs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Telegram Notifications */}
        <Card className="border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-cyan-500/10">
                <Bell className="h-4 w-4 text-cyan-500" />
              </div>
              تكامل Telegram (تنبيهات الصيد)
              <Badge variant="outline" className="text-xs mr-auto">فورية + موافقة</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="LEAD_TELEGRAM_BOT_TOKEN" className="text-xs mb-1.5 block">
                Bot Token
              </Label>
              <Input
                id="LEAD_TELEGRAM_BOT_TOKEN"
                type={revealed.LEAD_TELEGRAM_BOT_TOKEN ? "text" : "password"}
                value={settings.LEAD_TELEGRAM_BOT_TOKEN || ""}
                onChange={(e) => update("LEAD_TELEGRAM_BOT_TOKEN", e.target.value)}
                placeholder="123456:ABC..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="LEAD_TELEGRAM_CHAT_ID" className="text-xs mb-1.5 block">
                Chat ID
              </Label>
              <Input
                id="LEAD_TELEGRAM_CHAT_ID"
                value={settings.LEAD_TELEGRAM_CHAT_ID || ""}
                onChange={(e) => update("LEAD_TELEGRAM_CHAT_ID", e.target.value)}
                placeholder="@baranavi_leads"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="LEAD_NOTIF_MIN_SCORE" className="text-xs mb-1.5 block">
                الحد الأدنى للإشعار (Score)
              </Label>
              <Input
                id="LEAD_NOTIF_MIN_SCORE"
                type="number"
                value={settings.LEAD_NOTIF_MIN_SCORE || "75"}
                onChange={(e) => update("LEAD_NOTIF_MIN_SCORE", e.target.value)}
                className="text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                75 = إشعار فقط للعملاء الجيدين (80% سيلبيها)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Supabase */}
        <Card className="border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-500/10">
                <Database className="h-4 w-4 text-emerald-500" />
              </div>
              Supabase (Pipeline DB)
              <Badge variant="outline" className="text-xs mr-auto">PostgreSQL</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="LEAD_SUPABASE_URL" className="text-xs mb-1.5 block">
                Project URL
              </Label>
              <Input
                id="LEAD_SUPABASE_URL"
                value={settings.LEAD_SUPABASE_URL || ""}
                onChange={(e) => update("LEAD_SUPABASE_URL", e.target.value)}
                placeholder="https://xxxxx.supabase.co"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="LEAD_SUPABASE_ANON_KEY" className="text-xs mb-1.5 block">
                Anon Key
              </Label>
              <Input
                id="LEAD_SUPABASE_ANON_KEY"
                type={revealed.LEAD_SUPABASE_ANON_KEY ? "text" : "password"}
                value={settings.LEAD_SUPABASE_ANON_KEY || ""}
                onChange={(e) => update("LEAD_SUPABASE_ANON_KEY", e.target.value)}
                placeholder="eyJ..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="LEAD_MAX_OUTREACHES_PER_DAY" className="text-xs mb-1.5 block">
                حد الرسائل اليومي
              </Label>
              <Input
                id="LEAD_MAX_OUTREACHES_PER_DAY"
                type="number"
                value={settings.LEAD_MAX_OUTREACHES_PER_DAY || "20"}
                onChange={(e) => update("LEAD_MAX_OUTREACHES_PER_DAY", e.target.value)}
                className="text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                20 رسالة/يوم آمن (تفادي spam filters)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Bar */}
      <div className="sticky bottom-4 z-30">
        <Card className="bg-card/95 backdrop-blur border-rose-500/40 shadow-lg cyber-glow">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-rose-500" />
              <span className="text-xs">المفاتيح تُحفظ محلياً فقط — لا تُرسل لأي طرف ثالث.</span>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="text-xs h-8 bg-gradient-to-r from-rose-500 to-pink-500 text-white"
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
