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
  Search,
} from "lucide-react";
import { toast } from "sonner";

type SettingsMap = Record<string, string>;

const secretsKeys = ["SERPAPI_KEY", "GEMINI_API_KEY", "GROQ_API_KEY", "TELEGRAM_BOT_TOKEN"];

export function SeoSettingsPanel() {
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
      if (res.ok) toast.success("تم حفظ إعدادات SEO-GhostBaran");
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
        {/* SerpApi */}
        <Card className="border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-500/10">
                <Search className="h-4 w-4 text-emerald-500" />
              </div>
              SerpApi (واجهة نتائج البحث)
              <Badge variant="outline" className="text-xs mr-auto">Free Tier: 100/شهر</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="SERPAPI_KEY" className="text-xs mb-1.5 block">
                SerpApi Key
              </Label>
              <div className="relative">
                <Input
                  id="SERPAPI_KEY"
                  type={revealed.SERPAPI_KEY ? "text" : "password"}
                  value={settings.SERPAPI_KEY || ""}
                  onChange={(e) => update("SERPAPI_KEY", e.target.value)}
                  placeholder="serp_..."
                  className="text-xs font-mono pr-10"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute top-1 left-1 h-7 w-7"
                  onClick={() => toggleReveal("SERPAPI_KEY")}
                >
                  {revealed.SERPAPI_KEY ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                مجاني من <a href="https://serpapi.com/manage-api-key" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline">serpapi.com</a> — للحصول على نتائج بحث حقيقية.
              </p>
            </div>
            <div>
              <Label htmlFor="SEO_TARGET_SITE" className="text-xs mb-1.5 block">
                موقعك المستهدف (للرصد)
              </Label>
              <Input
                id="SEO_TARGET_SITE"
                value={settings.SEO_TARGET_SITE || ""}
                onChange={(e) => update("SEO_TARGET_SITE", e.target.value)}
                placeholder="sentinelbaran.io"
                className="text-xs font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Provider */}
        <Card className="border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-purple-500/10">
                <Brain className="h-4 w-4 text-purple-500" />
              </div>
              محرّك توليد المحتوى
              <Badge variant="outline" className="text-xs mr-auto">AI Writer</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="SEO_AI_PROVIDER" className="text-xs mb-1.5 block">المزود</Label>
              <Select
                value={settings.SEO_AI_PROVIDER || "gemini"}
                onValueChange={(v) => update("SEO_AI_PROVIDER", v)}
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
              <Label htmlFor="SEO_DEFAULT_WORD_COUNT" className="text-xs mb-1.5 block">
                عدد كلمات المقال الافتراضي
              </Label>
              <Input
                id="SEO_DEFAULT_WORD_COUNT"
                type="number"
                value={settings.SEO_DEFAULT_WORD_COUNT || "2000"}
                onChange={(e) => update("SEO_DEFAULT_WORD_COUNT", e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <Label htmlFor="SEO_CONTENT_LANG" className="text-xs mb-1.5 block">لغة المحتوى الافتراضية</Label>
              <Select
                value={settings.SEO_CONTENT_LANG || "ar"}
                onValueChange={(v) => update("SEO_CONTENT_LANG", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Telegram */}
        <Card className="border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-cyan-500/10">
                <Bell className="h-4 w-4 text-cyan-500" />
              </div>
              تكامل Telegram (تقارير SEO)
              <Badge variant="outline" className="text-xs mr-auto">أسبوعي</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="SEO_TELEGRAM_BOT_TOKEN" className="text-xs mb-1.5 block">
                Bot Token
              </Label>
              <Input
                id="SEO_TELEGRAM_BOT_TOKEN"
                type={revealed.SEO_TELEGRAM_BOT_TOKEN ? "text" : "password"}
                value={settings.SEO_TELEGRAM_BOT_TOKEN || ""}
                onChange={(e) => update("SEO_TELEGRAM_BOT_TOKEN", e.target.value)}
                placeholder="123456:ABC..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="SEO_TELEGRAM_CHAT_ID" className="text-xs mb-1.5 block">
                Chat ID
              </Label>
              <Input
                id="SEO_TELEGRAM_CHAT_ID"
                value={settings.SEO_TELEGRAM_CHAT_ID || ""}
                onChange={(e) => update("SEO_TELEGRAM_CHAT_ID", e.target.value)}
                placeholder="@baranavi_seo"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="SEO_REPORT_CRON" className="text-xs mb-1.5 block">
                جدول التقرير الأسبوعي (cron UTC)
              </Label>
              <Input
                id="SEO_REPORT_CRON"
                value={settings.SEO_REPORT_CRON || "0 9 * * 1"}
                onChange={(e) => update("SEO_REPORT_CRON", e.target.value)}
                placeholder="0 9 * * 1 (كل إثنين 9:00 UTC)"
                className="text-xs font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Supabase */}
        <Card className="border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-orange-500/10">
                <Database className="h-4 w-4 text-orange-500" />
              </div>
              Supabase (السجل التاريخي)
              <Badge variant="outline" className="text-xs mr-auto">Time-Series</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="SEO_SUPABASE_URL" className="text-xs mb-1.5 block">
                Project URL
              </Label>
              <Input
                id="SEO_SUPABASE_URL"
                value={settings.SEO_SUPABASE_URL || ""}
                onChange={(e) => update("SEO_SUPABASE_URL", e.target.value)}
                placeholder="https://xxxxx.supabase.co"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="SEO_SUPABASE_ANON_KEY" className="text-xs mb-1.5 block">
                Anon Key
              </Label>
              <Input
                id="SEO_SUPABASE_ANON_KEY"
                type={revealed.SEO_SUPABASE_ANON_KEY ? "text" : "password"}
                value={settings.SEO_SUPABASE_ANON_KEY || ""}
                onChange={(e) => update("SEO_SUPABASE_ANON_KEY", e.target.value)}
                placeholder="eyJ..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="SEO_TRACKING_INTERVAL_HRS" className="text-xs mb-1.5 block">
                فاصل الفحص (ساعات)
              </Label>
              <Input
                id="SEO_TRACKING_INTERVAL_HRS"
                type="number"
                value={settings.SEO_TRACKING_INTERVAL_HRS || "6"}
                onChange={(e) => update("SEO_TRACKING_INTERVAL_HRS", e.target.value)}
                className="text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                كل 6 ساعات يفحص النظام ترتيب كل الكلمات (يمكن تعديله لتفادي rate limits)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Bar */}
      <div className="sticky bottom-4 z-30">
        <Card className="bg-card/95 backdrop-blur border-emerald-500/40 shadow-lg cyber-glow">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs">المفاتيح تُحفظ محلياً فقط — لا تُرسل لأي طرف ثالث.</span>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="text-xs h-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
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
