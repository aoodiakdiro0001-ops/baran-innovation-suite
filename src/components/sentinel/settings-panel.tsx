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
  Cpu,
  Bell,
  Database,
  Save,
  Send,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

type SettingsMap = Record<string, string>;

const secretsKeys = ["TELEGRAM_BOT_TOKEN", "GEMINI_API_KEY", "GROQ_API_KEY", "SUPABASE_ANON_KEY"];

export function SettingsPanel() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState(false);

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
      if (res.ok) {
        toast.success("تم حفظ الإعدادات بنجاح");
      } else {
        toast.error("فشل حفظ الإعدادات");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  const testTelegram = async () => {
    if (!settings.TELEGRAM_BOT_TOKEN || !settings.TELEGRAM_CHAT_ID) {
      toast.error("أدخل Bot Token و Chat ID أولاً");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "🧪 اختبار Telegram من Cyber-SentinelBaran",
          body: `تم اختبار الاتصال بنجاح. الرسالة مرسلة إلى ${settings.TELEGRAM_CHAT_ID}.`,
          channel: "telegram",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.telegram?.ok) {
          toast.success("تم إرسال رسالة Telegram بنجاح!");
        } else if (data.telegram?.simulated) {
          toast.info("تم حفظ الإعداد وستُرسل الرسالة في الوضع الحقيقي");
        } else {
          toast.error("فشل Telegram: " + (data.telegram?.description || "غير معروف"));
        }
      }
    } catch {
      toast.error("خطأ في الإرسال");
    } finally {
      setTesting(false);
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
        {/* Telegram Settings */}
        <Card className="border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-purple-500/10">
                <Bell className="h-4 w-4 text-purple-500" />
              </div>
              تكامل Telegram Bot
              <Badge variant="outline" className="text-xs mr-auto">التنبيهات</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="TELEGRAM_BOT_TOKEN" className="text-xs mb-1.5 block">
                Bot Token
              </Label>
              <div className="relative">
                <Input
                  id="TELEGRAM_BOT_TOKEN"
                  type={revealed.TELEGRAM_BOT_TOKEN ? "text" : "password"}
                  value={settings.TELEGRAM_BOT_TOKEN || ""}
                  onChange={(e) => update("TELEGRAM_BOT_TOKEN", e.target.value)}
                  placeholder="123456789:ABCdefGHI..."
                  className="text-xs font-mono pr-10"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute top-1 left-1 h-7 w-7"
                  onClick={() => toggleReveal("TELEGRAM_BOT_TOKEN")}
                >
                  {revealed.TELEGRAM_BOT_TOKEN ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="TELEGRAM_CHAT_ID" className="text-xs mb-1.5 block">
                Chat ID
              </Label>
              <Input
                id="TELEGRAM_CHAT_ID"
                value={settings.TELEGRAM_CHAT_ID || ""}
                onChange={(e) => update("TELEGRAM_CHAT_ID", e.target.value)}
                placeholder="@sentinelbaran_admin أو 123456789"
                className="text-xs font-mono"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={testTelegram}
              disabled={testing}
              className="w-full text-xs h-8"
            >
              {testing ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin ml-1.5" />
                  جارٍ الاختبار...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 ml-1.5" />
                  اختبار الإرسال
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* AI Provider Settings */}
        <Card className="border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-cyan-500/10">
                <Cpu className="h-4 w-4 text-cyan-500" />
              </div>
              محرك التحليل الذكي
              <Badge variant="outline" className="text-xs mr-auto">AI Brain</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs mb-1.5 block">مزود الذكاء الاصطناعي</Label>
              <Select
                value={settings.AI_PROVIDER || "gemini"}
                onValueChange={(v) => update("AI_PROVIDER", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Google Gemini (Free Tier)</SelectItem>
                  <SelectItem value="groq">Groq API (Free Tier)</SelectItem>
                  <SelectItem value="zai">Z.ai SDK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="GEMINI_API_KEY" className="text-xs mb-1.5 block">
                Gemini API Key
              </Label>
              <div className="relative">
                <Input
                  id="GEMINI_API_KEY"
                  type={revealed.GEMINI_API_KEY ? "text" : "password"}
                  value={settings.GEMINI_API_KEY || ""}
                  onChange={(e) => update("GEMINI_API_KEY", e.target.value)}
                  placeholder="AIza..."
                  className="text-xs font-mono pr-10"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute top-1 left-1 h-7 w-7"
                  onClick={() => toggleReveal("GEMINI_API_KEY")}
                >
                  {revealed.GEMINI_API_KEY ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="GROQ_API_KEY" className="text-xs mb-1.5 block">
                Groq API Key (بديل)
              </Label>
              <Input
                id="GROQ_API_KEY"
                type={revealed.GROQ_API_KEY ? "text" : "password"}
                value={settings.GROQ_API_KEY || ""}
                onChange={(e) => update("GROQ_API_KEY", e.target.value)}
                placeholder="gsk_..."
                className="text-xs font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Supabase Settings */}
        <Card className="border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-500/10">
                <Database className="h-4 w-4 text-emerald-500" />
              </div>
              Supabase Persistence
              <Badge variant="outline" className="text-xs mr-auto">DB</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="SUPABASE_URL" className="text-xs mb-1.5 block">
                Supabase Project URL
              </Label>
              <Input
                id="SUPABASE_URL"
                value={settings.SUPABASE_URL || ""}
                onChange={(e) => update("SUPABASE_URL", e.target.value)}
                placeholder="https://xxxxx.supabase.co"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="SUPABASE_ANON_KEY" className="text-xs mb-1.5 block">
                Anon Key
              </Label>
              <Input
                id="SUPABASE_ANON_KEY"
                type={revealed.SUPABASE_ANON_KEY ? "text" : "password"}
                value={settings.SUPABASE_ANON_KEY || ""}
                onChange={(e) => update("SUPABASE_ANON_KEY", e.target.value)}
                placeholder="eyJ..."
                className="text-xs font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Scan Schedule Settings */}
        <Card className="border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-orange-500/10">
                <KeyRound className="h-4 w-4 text-orange-500" />
              </div>
              جدول الفحص الأمني
              <Badge variant="outline" className="text-xs mr-auto">Cron</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="SCAN_SCHEDULE_CRON" className="text-xs mb-1.5 block">
                CRON Expression (UTC)
              </Label>
              <Input
                id="SCAN_SCHEDULE_CRON"
                value={settings.SCAN_SCHEDULE_CRON || ""}
                onChange={(e) => update("SCAN_SCHEDULE_CRON", e.target.value)}
                placeholder="0 2 * * *"
                className="text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                مثال: "0 2 * * *" يعني فحص يومي الساعة 2:00 صباحاً UTC
              </p>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">الحد الأدنى للتنبيه</Label>
              <Select
                value={settings.MIN_SEVERITY_ALERT || "high"}
                onValueChange={(v) => update("MIN_SEVERITY_ALERT", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">حرجة فقط</SelectItem>
                  <SelectItem value="high">حرجة وعالية</SelectItem>
                  <SelectItem value="medium">حرجة، عالية، متوسطة</SelectItem>
                  <SelectItem value="low">جميع الثغرات</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Bar */}
      <div className="sticky bottom-4 z-30">
        <Card className="bg-card/95 backdrop-blur border-primary/40 shadow-lg cyber-glow">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs">التغييرات تُحفظ محلياً في SQLite. للإنتاج: استخدم Supabase.</span>
            </div>
            <Button onClick={handleSave} disabled={saving} size="sm" className="text-xs h-8">
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
