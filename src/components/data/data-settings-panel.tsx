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
  Activity,
} from "lucide-react";
import { toast } from "sonner";

type SettingsMap = Record<string, string>;

export function DataSettingsPanel() {
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
      if (res.ok) toast.success("تم حفظ إعدادات Data-Nexus ZeroBaran");
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
              محرّك التحليل الذكي
              <Badge variant="outline" className="text-xs mr-auto">AI Brain</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs mb-1.5 block">المزود</Label>
              <Select
                value={settings.DATA_AI_PROVIDER || "gemini"}
                onValueChange={(v) => update("DATA_AI_PROVIDER", v)}
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
              <Label htmlFor="DATA_GEMINI_API_KEY" className="text-xs mb-1.5 block">
                Gemini API Key
              </Label>
              <div className="relative">
                <Input
                  id="DATA_GEMINI_API_KEY"
                  type={revealed.DATA_GEMINI_API_KEY ? "text" : "password"}
                  value={settings.DATA_GEMINI_API_KEY || ""}
                  onChange={(e) => update("DATA_GEMINI_API_KEY", e.target.value)}
                  placeholder="AIza..."
                  className="text-xs font-mono pr-10"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute top-1 left-1 h-7 w-7"
                  onClick={() => toggleReveal("DATA_GEMINI_API_KEY")}
                >
                  {revealed.DATA_GEMINI_API_KEY ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="DATA_INSIGHTS_DEPTH" className="text-xs mb-1.5 block">
                عمق التحليل
              </Label>
              <Select
                value={settings.DATA_INSIGHTS_DEPTH || "balanced"}
                onValueChange={(v) => update("DATA_INSIGHTS_DEPTH", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">سريع (ملخص فقط)</SelectItem>
                  <SelectItem value="balanced">متوازن (افتراضي)</SelectItem>
                  <SelectItem value="deep">عميق (تحليل + تنبؤ + توصيات)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Detection */}
        <Card className="border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-orange-500/10">
                <Activity className="h-4 w-4 text-orange-500" />
              </div>
              كشف الشذوذ (Anomaly Detection)
              <Badge variant="outline" className="text-xs mr-auto">Statistical</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="DATA_ANOMALY_METHOD" className="text-xs mb-1.5 block">
                طريقة الكشف
              </Label>
              <Select
                value={settings.DATA_ANOMALY_METHOD || "zscore"}
                onValueChange={(v) => update("DATA_ANOMALY_METHOD", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zscore">Z-Score (تقليدي)</SelectItem>
                  <SelectItem value="iqr">IQR - النطاق الربيعي (موصى به)</SelectItem>
                  <SelectItem value="isolation_forest">Isolation Forest (ML)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="DATA_ANOMALY_THRESHOLD" className="text-xs mb-1.5 block">
                عتبة الكشف (σ)
              </Label>
              <Input
                id="DATA_ANOMALY_THRESHOLD"
                type="number"
                value={settings.DATA_ANOMALY_THRESHOLD || "3"}
                onChange={(e) => update("DATA_ANOMALY_THRESHOLD", e.target.value)}
                className="text-xs"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                2 = حساس، 3 = متوازن (افتراضي)، 4 = متحفظ
              </p>
            </div>
            <div>
              <Label htmlFor="DATA_ALERT_MIN_SEVERITY" className="text-xs mb-1.5 block">
                الحد الأدنى للتنبيه
              </Label>
              <Select
                value={settings.DATA_ALERT_MIN_SEVERITY || "high"}
                onValueChange={(v) => update("DATA_ALERT_MIN_SEVERITY", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">حرج فقط</SelectItem>
                  <SelectItem value="high">حرج وعالٍ</SelectItem>
                  <SelectItem value="medium">حرج، عالٍ، متوسط</SelectItem>
                  <SelectItem value="low">كل الشذوذ</SelectItem>
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
              تكامل Telegram (التقارير والتنبيهات)
              <Badge variant="outline" className="text-xs mr-auto">أسبوعي + فوري</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="DATA_TELEGRAM_BOT_TOKEN" className="text-xs mb-1.5 block">
                Bot Token
              </Label>
              <Input
                id="DATA_TELEGRAM_BOT_TOKEN"
                type={revealed.DATA_TELEGRAM_BOT_TOKEN ? "text" : "password"}
                value={settings.DATA_TELEGRAM_BOT_TOKEN || ""}
                onChange={(e) => update("DATA_TELEGRAM_BOT_TOKEN", e.target.value)}
                placeholder="123456:ABC..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="DATA_TELEGRAM_CHAT_ID" className="text-xs mb-1.5 block">
                Chat ID
              </Label>
              <Input
                id="DATA_TELEGRAM_CHAT_ID"
                value={settings.DATA_TELEGRAM_CHAT_ID || ""}
                onChange={(e) => update("DATA_TELEGRAM_CHAT_ID", e.target.value)}
                placeholder="@baranavi_data"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="DATA_REPORT_CRON" className="text-xs mb-1.5 block">
                جدول التقرير الأسبوعي (cron UTC)
              </Label>
              <Input
                id="DATA_REPORT_CRON"
                value={settings.DATA_REPORT_CRON || "0 8 * * 1"}
                onChange={(e) => update("DATA_REPORT_CRON", e.target.value)}
                placeholder="0 8 * * 1 (كل إثنين 8:00 UTC)"
                className="text-xs font-mono"
              />
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
              Supabase (Data Lakehouse)
              <Badge variant="outline" className="text-xs mr-auto">PostgreSQL</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="DATA_SUPABASE_URL" className="text-xs mb-1.5 block">
                Project URL
              </Label>
              <Input
                id="DATA_SUPABASE_URL"
                value={settings.DATA_SUPABASE_URL || ""}
                onChange={(e) => update("DATA_SUPABASE_URL", e.target.value)}
                placeholder="https://xxxxx.supabase.co"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="DATA_SUPABASE_ANON_KEY" className="text-xs mb-1.5 block">
                Anon Key
              </Label>
              <Input
                id="DATA_SUPABASE_ANON_KEY"
                type={revealed.DATA_SUPABASE_ANON_KEY ? "text" : "password"}
                value={settings.DATA_SUPABASE_ANON_KEY || ""}
                onChange={(e) => update("DATA_SUPABASE_ANON_KEY", e.target.value)}
                placeholder="eyJ..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="DATA_MAX_DATASET_MB" className="text-xs mb-1.5 block">
                أقصى حجم ملف (MB)
              </Label>
              <Input
                id="DATA_MAX_DATASET_MB"
                type="number"
                value={settings.DATA_MAX_DATASET_MB || "50"}
                onChange={(e) => update("DATA_MAX_DATASET_MB", e.target.value)}
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Bar */}
      <div className="sticky bottom-4 z-30">
        <Card className="bg-card/95 backdrop-blur border-amber-500/40 shadow-lg cyber-glow">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-amber-500" />
              <span className="text-xs">المفاتيح تُحفظ محلياً فقط — لا تُرسل لأي طرف ثالث.</span>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="text-xs h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white"
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
