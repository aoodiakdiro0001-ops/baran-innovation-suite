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
  Brain,
  Bell,
  Database,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  Server,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

type SettingsMap = Record<string, string>;

export function AiopsSettingsPanel() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    const fetchInitial = async () => {
      try {
        const r = await fetch("/api/settings");
        const d = await r.json();
        if (mounted) {
          setSettings(d.settings || {});
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };
    fetchInitial();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) toast.success("تم حفظ إعدادات AIOps-ZeroBaran");
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
              محرّك التشخيص الذكي
              <Badge variant="outline" className="text-xs mr-auto">AI Diagnosis</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs mb-1.5 block">المزود</Label>
              <Select
                value={settings.AIOPS_AI_PROVIDER || "gemini"}
                onValueChange={(v) => update("AIOPS_AI_PROVIDER", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Google Gemini (مجاني)</SelectItem>
                  <SelectItem value="groq">Groq API (سريع)</SelectItem>
                  <SelectItem value="zai">Z.ai SDK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="AIOPS_GEMINI_KEY" className="text-xs mb-1.5 block">
                Gemini API Key
              </Label>
              <div className="relative">
                <Input
                  id="AIOPS_GEMINI_KEY"
                  type={revealed.AIOPS_GEMINI_KEY ? "text" : "password"}
                  value={settings.AIOPS_GEMINI_KEY || ""}
                  onChange={(e) => update("AIOPS_GEMINI_KEY", e.target.value)}
                  placeholder="AIza..."
                  className="text-xs font-mono pr-10"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute top-1 left-1 h-7 w-7"
                  onClick={() => toggleReveal("AIOPS_GEMINI_KEY")}
                >
                  {revealed.AIOPS_GEMINI_KEY ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="AIOPS_GROQ_KEY" className="text-xs mb-1.5 block">
                Groq API Key (اختياري)
              </Label>
              <Input
                id="AIOPS_GROQ_KEY"
                type={revealed.AIOPS_GROQ_KEY ? "text" : "password"}
                value={settings.AIOPS_GROQ_KEY || ""}
                onChange={(e) => update("AIOPS_GROQ_KEY", e.target.value)}
                placeholder="gsk_..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="AIOPS_DIAG_DEPTH" className="text-xs mb-1.5 block">
                عمق التحليل
              </Label>
              <Select
                value={settings.AIOPS_DIAG_DEPTH || "standard"}
                onValueChange={(v) => update("AIOPS_DIAG_DEPTH", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">سريع (50 سطر — توفير توكنز)</SelectItem>
                  <SelectItem value="standard">قياسي (100 سطر — افتراضي)</SelectItem>
                  <SelectItem value="deep">عميق (200 سطر — تحليل شامل)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Monitoring */}
        <Card className="border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <Server className="h-4 w-4 text-blue-500" />
              </div>
              إعدادات المراقبة
              <Badge variant="outline" className="text-xs mr-auto">Monitoring</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="AIOPS_CHECK_INTERVAL" className="text-xs mb-1.5 block">
                فاصل الفحص (ثوانٍ)
              </Label>
              <Input
                id="AIOPS_CHECK_INTERVAL"
                type="number"
                value={settings.AIOPS_CHECK_INTERVAL || "60"}
                onChange={(e) => update("AIOPS_CHECK_INTERVAL", e.target.value)}
                className="text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                60 ثانية افتراضي — GitHub Actions حد أدنى 5 دقائق
              </p>
            </div>
            <div>
              <Label htmlFor="AIOPS_TIMEOUT" className="text-xs mb-1.5 block">
                مهلة الانتظار (ثوانٍ)
              </Label>
              <Input
                id="AIOPS_TIMEOUT"
                type="number"
                value={settings.AIOPS_TIMEOUT || "10"}
                onChange={(e) => update("AIOPS_TIMEOUT", e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">طرق الفحص</Label>
              <Select
                value={settings.AIOPS_CHECK_METHOD || "auto"}
                onValueChange={(v) => update("AIOPS_CHECK_METHOD", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">تلقائي (HTTP + TCP)</SelectItem>
                  <SelectItem value="http">HTTP فقط</SelectItem>
                  <SelectItem value="tcp">TCP فقط</SelectItem>
                  <SelectItem value="icmp">ICMP Ping</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="AIOPS_CRON" className="text-xs mb-1.5 block">
                جدول المراقبة (cron UTC)
              </Label>
              <Input
                id="AIOPS_CRON"
                value={settings.AIOPS_CRON || "*/5 * * * *"}
                onChange={(e) => update("AIOPS_CRON", e.target.value)}
                placeholder="*/5 * * * *"
                className="text-xs font-mono"
              />
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
              تكامل Telegram (تنبيهات الحوادث)
              <Badge variant="outline" className="text-xs mr-auto">فورية</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="AIOPS_TELEGRAM_BOT_TOKEN" className="text-xs mb-1.5 block">
                Bot Token
              </Label>
              <Input
                id="AIOPS_TELEGRAM_BOT_TOKEN"
                type={revealed.AIOPS_TELEGRAM_BOT_TOKEN ? "text" : "password"}
                value={settings.AIOPS_TELEGRAM_BOT_TOKEN || ""}
                onChange={(e) => update("AIOPS_TELEGRAM_BOT_TOKEN", e.target.value)}
                placeholder="123456:ABC..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="AIOPS_TELEGRAM_CHAT_ID" className="text-xs mb-1.5 block">
                Chat ID
              </Label>
              <Input
                id="AIOPS_TELEGRAM_CHAT_ID"
                value={settings.AIOPS_TELEGRAM_CHAT_ID || ""}
                onChange={(e) => update("AIOPS_TELEGRAM_CHAT_ID", e.target.value)}
                placeholder="@baranavi_ops"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">الحد الأدنى للتنبيه</Label>
              <Select
                value={settings.AIOPS_MIN_SEVERITY || "medium"}
                onValueChange={(v) => update("AIOPS_MIN_SEVERITY", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">حرج فقط</SelectItem>
                  <SelectItem value="high">عالي فما فوق</SelectItem>
                  <SelectItem value="medium">متوسط فما فوق (افتراضي)</SelectItem>
                  <SelectItem value="low">كل التنبيهات</SelectItem>
                </SelectContent>
              </Select>
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
              Supabase (سجل الحوادث)
              <Badge variant="outline" className="text-xs mr-auto">Persistence</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="AIOPS_SUPABASE_URL" className="text-xs mb-1.5 block">
                Project URL
              </Label>
              <Input
                id="AIOPS_SUPABASE_URL"
                value={settings.AIOPS_SUPABASE_URL || ""}
                onChange={(e) => update("AIOPS_SUPABASE_URL", e.target.value)}
                placeholder="https://xxxxx.supabase.co"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="AIOPS_SUPABASE_ANON_KEY" className="text-xs mb-1.5 block">
                Anon Key
              </Label>
              <Input
                id="AIOPS_SUPABASE_ANON_KEY"
                type={revealed.AIOPS_SUPABASE_ANON_KEY ? "text" : "password"}
                value={settings.AIOPS_SUPABASE_ANON_KEY || ""}
                onChange={(e) => update("AIOPS_SUPABASE_ANON_KEY", e.target.value)}
                placeholder="eyJ..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="AIOPS_MAX_INCIDENTS" className="text-xs mb-1.5 block">
                أقصى عدد حوادث محفوظة
              </Label>
              <Input
                id="AIOPS_MAX_INCIDENTS"
                type="number"
                value={settings.AIOPS_MAX_INCIDENTS || "500"}
                onChange={(e) => update("AIOPS_MAX_INCIDENTS", e.target.value)}
                className="text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                500 افتراضي — يُحذف الأقدم عند التجاوز
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Bar */}
      <div className="sticky bottom-4 z-30">
        <Card className="bg-card/95 backdrop-blur border-blue-500/40 shadow-lg cyber-glow">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <span className="text-xs">
                المفاتيح تُحفظ محلياً فقط — لا تُرسل لأي طرف ثالث.
              </span>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="text-xs h-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
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
