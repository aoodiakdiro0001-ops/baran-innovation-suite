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
  Cpu,
} from "lucide-react";
import { toast } from "sonner";

type SettingsMap = Record<string, string>;

const secretsKeys = ["HUGGINGFACE_TOKEN", "GEMINI_API_KEY", "TELEGRAM_BOT_TOKEN", "SUPABASE_ANON_KEY"];

export function PixelSettingsPanel() {
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
      if (res.ok) toast.success("تم حفظ إعدادات Pixel-ZeroBaran");
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
        {Array.from({ length: 3 }).map((_, i) => (
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
        {/* Hugging Face */}
        <Card className="border-fuchsia-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-fuchsia-500/10">
                <Brain className="h-4 w-4 text-fuchsia-500" />
              </div>
              Hugging Face (نماذج الصور)
              <Badge variant="outline" className="text-xs mr-auto">AI Vision</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="HUGGINGFACE_TOKEN" className="text-xs mb-1.5 block">
                Hugging Face Access Token
              </Label>
              <div className="relative">
                <Input
                  id="HUGGINGFACE_TOKEN"
                  type={revealed.HUGGINGFACE_TOKEN ? "text" : "password"}
                  value={settings.HUGGINGFACE_TOKEN || ""}
                  onChange={(e) => update("HUGGINGFACE_TOKEN", e.target.value)}
                  placeholder="hf_..."
                  className="text-xs font-mono pr-10"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute top-1 left-1 h-7 w-7"
                  onClick={() => toggleReveal("HUGGINGFACE_TOKEN")}
                >
                  {revealed.HUGGINGFACE_TOKEN ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                مجاني من <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-fuchsia-600 dark:text-fuchsia-400 underline">huggingface.co/settings/tokens</a> — يُستخدم لتوليد الخلفيات وإعادة الإضاءة.
              </p>
            </div>
            <div>
              <Label htmlFor="PIXEL_DEFAULT_MODEL" className="text-xs mb-1.5 block">
                النموذج الافتراضي (Serverless)
              </Label>
              <Select
                value={settings.PIXEL_DEFAULT_MODEL || "stabilityai/sdxl"}
                onValueChange={(v) => update("PIXEL_DEFAULT_MODEL", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stabilityai/sdxl">Stability AI SDXL (افتراضي)</SelectItem>
                  <SelectItem value="stabilityai/stable-diffusion-2">Stable Diffusion 2.1</SelectItem>
                  <SelectItem value="runwayml/stable-diffusion-v1-5">SD 1.5 (سريع)</SelectItem>
                  <SelectItem value="timbrooks/instruct-pix2pix">Instruct Pix2Pix (تعديل موجَّه)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Telegram */}
        <Card className="border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-purple-500/10">
                <Bell className="h-4 w-4 text-purple-500" />
              </div>
              تكامل Telegram Bot
              <Badge variant="outline" className="text-xs mr-auto">التسليم</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="PIXEL_TELEGRAM_BOT_TOKEN" className="text-xs mb-1.5 block">
                Bot Token (Pixel)
              </Label>
              <Input
                id="PIXEL_TELEGRAM_BOT_TOKEN"
                type={revealed.PIXEL_TELEGRAM_BOT_TOKEN ? "text" : "password"}
                value={settings.PIXEL_TELEGRAM_BOT_TOKEN || ""}
                onChange={(e) => update("PIXEL_TELEGRAM_BOT_TOKEN", e.target.value)}
                placeholder="123456:ABC..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="PIXEL_TELEGRAM_CHAT_ID" className="text-xs mb-1.5 block">
                Chat ID المستلِم
              </Label>
              <Input
                id="PIXEL_TELEGRAM_CHAT_ID"
                value={settings.PIXEL_TELEGRAM_CHAT_ID || ""}
                onChange={(e) => update("PIXEL_TELEGRAM_CHAT_ID", e.target.value)}
                placeholder="@baranavi_pixel"
                className="text-xs font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Supabase Storage */}
        <Card className="border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-500/10">
                <Database className="h-4 w-4 text-emerald-500" />
              </div>
              Supabase Storage
              <Badge variant="outline" className="text-xs mr-auto">الأرشيف</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="PIXEL_SUPABASE_URL" className="text-xs mb-1.5 block">
                Project URL
              </Label>
              <Input
                id="PIXEL_SUPABASE_URL"
                value={settings.PIXEL_SUPABASE_URL || ""}
                onChange={(e) => update("PIXEL_SUPABASE_URL", e.target.value)}
                placeholder="https://xxxxx.supabase.co"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="PIXEL_SUPABASE_ANON_KEY" className="text-xs mb-1.5 block">
                Anon Key
              </Label>
              <Input
                id="PIXEL_SUPABASE_ANON_KEY"
                type={revealed.PIXEL_SUPABASE_ANON_KEY ? "text" : "password"}
                value={settings.PIXEL_SUPABASE_ANON_KEY || ""}
                onChange={(e) => update("PIXEL_SUPABASE_ANON_KEY", e.target.value)}
                placeholder="eyJ..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="PIXEL_SUPABASE_BUCKET" className="text-xs mb-1.5 block">
                Storage Bucket Name
              </Label>
              <Input
                id="PIXEL_SUPABASE_BUCKET"
                value={settings.PIXEL_SUPABASE_BUCKET || "pixel-results"}
                onChange={(e) => update("PIXEL_SUPABASE_BUCKET", e.target.value)}
                placeholder="pixel-results"
                className="text-xs font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Default settings */}
        <Card className="border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-orange-500/10">
                <Cpu className="h-4 w-4 text-orange-500" />
              </div>
              إعدادات المعالجة
              <Badge variant="outline" className="text-xs mr-auto">الخوارزمية</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="PIXEL_DEFAULT_PROCESS" className="text-xs mb-1.5 block">
                نوع المعالجة الافتراضي
              </Label>
              <Select
                value={settings.PIXEL_DEFAULT_PROCESS || "full"}
                onValueChange={(v) => update("PIXEL_DEFAULT_PROCESS", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rembg">إزالة خلفية فقط (سريع)</SelectItem>
                  <SelectItem value="relight">إعادة إضاءة</SelectItem>
                  <SelectItem value="composite">دمج في خلفية</SelectItem>
                  <SelectItem value="full">معالجة كاملة (الأنسب للتسويق)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="PIXEL_DEFAULT_BG" className="text-xs mb-1.5 block">
                الخلفية الافتراضية
              </Label>
              <Select
                value={settings.PIXEL_DEFAULT_BG || "studio"}
                onValueChange={(v) => update("PIXEL_DEFAULT_BG", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">💡 ستوديو إضاءة ناعمة</SelectItem>
                  <SelectItem value="lifestyle">🏠 بيئة منزلية</SelectItem>
                  <SelectItem value="nature">🏖️ طبيعة وشاطئ</SelectItem>
                  <SelectItem value="industrial">🏭 صناعي</SelectItem>
                  <SelectItem value="minimal">🎨 جرادينت بسيط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="PIXEL_MAX_FILE_SIZE_MB" className="text-xs mb-1.5 block">
                أقصى حجم ملف (MB)
              </Label>
              <Input
                id="PIXEL_MAX_FILE_SIZE_MB"
                type="number"
                value={settings.PIXEL_MAX_FILE_SIZE_MB || "10"}
                onChange={(e) => update("PIXEL_MAX_FILE_SIZE_MB", e.target.value)}
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Bar */}
      <div className="sticky bottom-4 z-30">
        <Card className="bg-card/95 backdrop-blur border-fuchsia-500/40 shadow-lg cyber-glow">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-fuchsia-500" />
              <span className="text-xs">المفاتيح تُحفظ محلياً فقط. لا تُرسل لأي طرف ثالث.</span>
            </div>
            <Button onClick={handleSave} disabled={saving} size="sm" className="text-xs h-8 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white">
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
