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
  Layers,
} from "lucide-react";
import { toast } from "sonner";

type SettingsMap = Record<string, string>;

export function SpatialSettingsPanel() {
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
      if (res.ok) toast.success("تم حفظ إعدادات Spatial-ZeroBaran");
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
        {/* Hugging Face */}
        <Card className="border-violet-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-violet-500/10">
                <Brain className="h-4 w-4 text-violet-500" />
              </div>
              Hugging Face (نماذج 3D)
              <Badge variant="outline" className="text-xs mr-auto">Generative</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="SPATIAL_HF_TOKEN" className="text-xs mb-1.5 block">
                Hugging Face Access Token
              </Label>
              <div className="relative">
                <Input
                  id="SPATIAL_HF_TOKEN"
                  type={revealed.SPATIAL_HF_TOKEN ? "text" : "password"}
                  value={settings.SPATIAL_HF_TOKEN || ""}
                  onChange={(e) => update("SPATIAL_HF_TOKEN", e.target.value)}
                  placeholder="hf_..."
                  className="text-xs font-mono pr-10"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute top-1 left-1 h-7 w-7"
                  onClick={() => toggleReveal("SPATIAL_HF_TOKEN")}
                >
                  {revealed.SPATIAL_HF_TOKEN ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                مجاني من <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 underline">huggingface.co</a> — يُستدعى TripoSR و Shap-E
              </p>
            </div>
            <div>
              <Label htmlFor="SPATIAL_DEFAULT_MODEL" className="text-xs mb-1.5 block">
                النموذج الافتراضي
              </Label>
              <Select
                value={settings.SPATIAL_DEFAULT_MODEL || "TripoSR"}
                onValueChange={(v) => update("SPATIAL_DEFAULT_MODEL", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TripoSR">TripoSR (الأفضل للصور الواقعية)</SelectItem>
                  <SelectItem value="Shap-E">Shap-E (سريع، يدعم النص)</SelectItem>
                  <SelectItem value="DreamGaussian">DreamGaussian (PBR textures)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Blender */}
        <Card className="border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-cyan-500/10">
                <Layers className="h-4 w-4 text-cyan-500" />
              </div>
              Blender Headless (Post-Processing)
              <Badge variant="outline" className="text-xs mr-auto">Decimation</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="SPATIAL_BLENDER_PATH" className="text-xs mb-1.5 block">
                مسار Blender القابل للتنفيذ
              </Label>
              <Input
                id="SPATIAL_BLENDER_PATH"
                value={settings.SPATIAL_BLENDER_PATH || "/usr/bin/blender"}
                onChange={(e) => update("SPATIAL_BLENDER_PATH", e.target.value)}
                placeholder="/usr/bin/blender"
                className="text-xs font-mono"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="SPATIAL_DECIMATION_RATIO" className="text-xs mb-1.5 block">
                نسبة الـ Decimation الافتراضية
              </Label>
              <Input
                id="SPATIAL_DECIMATION_RATIO"
                type="number"
                value={settings.SPATIAL_DECIMATION_RATIO || "0.15"}
                onChange={(e) => update("SPATIAL_DECIMATION_RATIO", e.target.value)}
                className="text-xs"
                step="0.05"
                min="0.05"
                max="1.0"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                0.15 = خفض المضلعات إلى 15% من الأصل (85% تقليل). بين 0.05 (عالي) و 0.50 (منخفض)
              </p>
            </div>
            <div>
              <Label htmlFor="SPATIAL_TEXTURE_RES" className="text-xs mb-1.5 block">
                دقة الإكساء الافتراضية
              </Label>
              <Select
                value={settings.SPATIAL_TEXTURE_RES || "1024"}
                onValueChange={(v) => update("SPATIAL_TEXTURE_RES", v)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="512">512x512 (سريع، ألعاب موبايل)</SelectItem>
                  <SelectItem value="1024">1024x1024 (متوازن - افتراضي)</SelectItem>
                  <SelectItem value="2048">2048x2048 (عالي الجودة)</SelectItem>
                  <SelectItem value="4096">4096x4096 (سينمائي)</SelectItem>
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
              تكامل Telegram (التسليم)
              <Badge variant="outline" className="text-xs mr-auto">تنزيل + GIF</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="SPATIAL_TELEGRAM_BOT_TOKEN" className="text-xs mb-1.5 block">
                Bot Token
              </Label>
              <Input
                id="SPATIAL_TELEGRAM_BOT_TOKEN"
                type={revealed.SPATIAL_TELEGRAM_BOT_TOKEN ? "text" : "password"}
                value={settings.SPATIAL_TELEGRAM_BOT_TOKEN || ""}
                onChange={(e) => update("SPATIAL_TELEGRAM_BOT_TOKEN", e.target.value)}
                placeholder="123456:ABC..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="SPATIAL_TELEGRAM_CHAT_ID" className="text-xs mb-1.5 block">
                Chat ID
              </Label>
              <Input
                id="SPATIAL_TELEGRAM_CHAT_ID"
                value={settings.SPATIAL_TELEGRAM_CHAT_ID || ""}
                onChange={(e) => update("SPATIAL_TELEGRAM_CHAT_ID", e.target.value)}
                placeholder="@baranavi_3d"
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
              Supabase Storage (أرشيف المجسمات)
              <Badge variant="outline" className="text-xs mr-auto">Bucket</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="SPATIAL_SUPABASE_URL" className="text-xs mb-1.5 block">
                Project URL
              </Label>
              <Input
                id="SPATIAL_SUPABASE_URL"
                value={settings.SPATIAL_SUPABASE_URL || ""}
                onChange={(e) => update("SPATIAL_SUPABASE_URL", e.target.value)}
                placeholder="https://xxxxx.supabase.co"
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="SPATIAL_SUPABASE_ANON_KEY" className="text-xs mb-1.5 block">
                Anon Key
              </Label>
              <Input
                id="SPATIAL_SUPABASE_ANON_KEY"
                type={revealed.SPATIAL_SUPABASE_ANON_KEY ? "text" : "password"}
                value={settings.SPATIAL_SUPABASE_ANON_KEY || ""}
                onChange={(e) => update("SPATIAL_SUPABASE_ANON_KEY", e.target.value)}
                placeholder="eyJ..."
                className="text-xs font-mono"
              />
            </div>
            <div>
              <Label htmlFor="SPATIAL_SUPABASE_BUCKET" className="text-xs mb-1.5 block">
                Storage Bucket Name
              </Label>
              <Input
                id="SPATIAL_SUPABASE_BUCKET"
                value={settings.SPATIAL_SUPABASE_BUCKET || "spatial-assets"}
                onChange={(e) => update("SPATIAL_SUPABASE_BUCKET", e.target.value)}
                placeholder="spatial-assets"
                className="text-xs font-mono"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Bar */}
      <div className="sticky bottom-4 z-30">
        <Card className="bg-card/95 backdrop-blur border-violet-500/40 shadow-lg cyber-glow">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-violet-500" />
              <span className="text-xs">المفاتيح تُحفظ محلياً فقط — لا تُرسل لأي طرف ثالث.</span>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="text-xs h-8 bg-gradient-to-r from-violet-500 to-purple-500 text-white"
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
