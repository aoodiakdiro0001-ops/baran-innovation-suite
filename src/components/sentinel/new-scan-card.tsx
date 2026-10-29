"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rocket, Loader2, Radar, GitBranch, Globe } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function NewScanCard() {
  const [target, setTarget] = useState("");
  const [scanType, setScanType] = useState("full");
  const [launching, setLaunching] = useState(false);

  const launch = async () => {
    if (!target.trim()) {
      toast.error("أدخل الهدف المراد فحصه");
      return;
    }
    setLaunching(true);
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, scanType, triggeredBy: "manual" }),
      });
      if (res.ok) {
        toast.success("🚀 تم إنشاء الفحص. سيظهر في قائمة الفحوصات خلال لحظات.");
        setTarget("");
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast.error("فشل إنشاء الفحص");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setLaunching(false);
    }
  };

  const isRepo = target.includes("github.com") || target.startsWith("git@");
  const isUrl = target.startsWith("http://") || target.startsWith("https://");

  return (
    <Card className="border-cyan-500/30 cyber-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Rocket className="h-4 w-4 text-cyan-500" />
          إطلاق فحص أمني جديد
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="target" className="text-xs mb-1.5 block">
            الهدف (مستودع GitHub أو عنوان خادم)
          </Label>
          <div className="relative">
            <Input
              id="target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="github.com/user/repo أو https://api.example.com"
              className="text-xs font-mono pr-10"
              dir="ltr"
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-2">
              {isRepo ? (
                <GitBranch className="h-4 w-4 text-cyan-500" />
              ) : isUrl ? (
                <Globe className="h-4 w-4 text-cyan-500" />
              ) : (
                <Radar className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {isRepo
              ? "تم رصد مستودع GitHub — سيُفعّل Semgrep SAST تلقائياً"
              : isUrl
              ? "تم رصد URL — سيُفعّل Nuclei DAST و Nmap تلقائياً"
              : "أدخل هدفك الصحيح"}
          </p>
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">نوع الفحص</Label>
          <Select value={scanType} onValueChange={setScanType}>
            <SelectTrigger className="text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">فحص كامل (Semgrep + Nuclei + Nmap)</SelectItem>
              <SelectItem value="semgrep">Semgrep فقط (SAST — كود مصدر)</SelectItem>
              <SelectItem value="nuclei">Nuclei فقط (DAST — ويب)</SelectItem>
              <SelectItem value="nmap">Nmap فقط (مسح المنافذ)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={launch}
          disabled={launching}
          className="w-full text-xs h-9 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
        >
          {launching ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full ml-1.5"
            />
          ) : (
            <Rocket className="h-3.5 w-3.5 ml-1.5" />
          )}
          {launching ? "جارٍ الإطلاق..." : "إطلاق الفحص الآن"}
        </Button>
      </CardContent>
    </Card>
  );
}
