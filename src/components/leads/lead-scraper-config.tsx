"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Target, Sparkles, Building2, MapPin, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function LeadScraperConfig() {
  const [targetIndustry, setTargetIndustry] = useState("ecommerce");
  const [targetLocation, setTargetLocation] = useState("global");
  const [companySize, setCompanySize] = useState("small");
  const [serviceOffered, setServiceOffered] = useState("");
  const [tone, setTone] = useState("professional");
  const [count, setCount] = useState("3");
  const [scraping, setScraping] = useState(false);

  const runScrape = async () => {
    if (!serviceOffered.trim()) {
      toast.error("أدخل الخدمة التي تقدمها");
      return;
    }
    setScraping(true);
    try {
      const res = await fetch("/api/leads/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetIndustry,
          targetLocation,
          serviceOffered: serviceOffered.trim(),
          count: parseInt(count),
          tone,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`🎯 صيد جديد: ${data.leads?.length || 0} عميل + ${data.outreaches?.length || 0} رسالة مخصصة!`);
        setServiceOffered("");
        setTimeout(() => window.dispatchEvent(new CustomEvent("leads-scraped")), 500);
      } else {
        toast.error("فشل الصيد");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setScraping(false);
    }
  };

  return (
    <Card className="border-rose-500/30 cyber-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-rose-500/10">
            <Target className="h-4 w-4 text-rose-500" />
          </div>
          صيد عملاء جدد
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs mb-1.5 block flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            الصناعة المستهدفة
          </Label>
          <Select value={targetIndustry} onValueChange={setTargetIndustry}>
            <SelectTrigger className="text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ecommerce">متاجر إلكترونية</SelectItem>
              <SelectItem value="saas">شركات SaaS</SelectItem>
              <SelectItem value="agency">وكالات إبداعية</SelectItem>
              <SelectItem value="gaming">استوديوهات ألعاب</SelectItem>
              <SelectItem value="retail">متاجر تجزئة</SelectItem>
              <SelectItem value="fintech">شركات مالية</SelectItem>
              <SelectItem value="healthcare">رعاية صحية</SelectItem>
              <SelectItem value="education">تعليم</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              الموقع
            </Label>
            <Select value={targetLocation} onValueChange={setTargetLocation}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">عالمي</SelectItem>
                <SelectItem value="GCC">دول الخليج</SelectItem>
                <SelectItem value="AE, SA">الإمارات + السعودية</SelectItem>
                <SelectItem value="EG">مصر</SelectItem>
                <SelectItem value="TR">تركيا</SelectItem>
                <SelectItem value="JO">الأردن</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              حجم الشركة
            </Label>
            <Select value={companySize} onValueChange={setCompanySize}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">صغيرة (1-50)</SelectItem>
                <SelectItem value="medium">متوسطة (50-200)</SelectItem>
                <SelectItem value="large">كبيرة (200-1000)</SelectItem>
                <SelectItem value="enterprise">مؤسسات (1000+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="service" className="text-xs mb-1.5 block">
            الخدمة التي تقدمها (يُستخدم في الرسالة)
          </Label>
          <textarea
            id="service"
            value={serviceOffered}
            onChange={(e) => setServiceOffered(e.target.value)}
            placeholder="تدقيق أمان موقع + تقرير OWASP Top 10 + إصلاحات"
            className="w-full px-3 py-2 text-xs border border-border rounded-md bg-card focus:outline-none focus:border-rose-500/50 min-h-[60px] resize-y"
            dir="rtl"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block">الأسلوب</Label>
            <Select value={tone} onValueChange={setTone}>
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
          <div>
            <Label className="text-xs mb-1.5 block">عدد العملاء</Label>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 عملاء</SelectItem>
                <SelectItem value="5">5 عملاء</SelectItem>
                <SelectItem value="10">10 عملاء</SelectItem>
                <SelectItem value="20">20 عميل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-2.5 rounded-md bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
            سيستخدم الذكاء الاصطناعي (Gemini) لـ: تحليل الصناعة → توليد بيانات العملاء → كتابة رسالة مخصصة بنسبة تخصيص 88%+
          </span>
        </div>

        <Button
          onClick={runScrape}
          disabled={scraping || !serviceOffered.trim()}
          className="w-full text-xs h-9 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
        >
          {scraping ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full ml-1.5"
            />
          ) : (
            <Target className="h-3.5 w-3.5 ml-1.5" />
          )}
          {scraping ? "جارٍ الصيد..." : "ابدأ الصيد التلقائي"}
        </Button>
      </CardContent>
    </Card>
  );
}
