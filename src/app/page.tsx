"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Radar,
  Bug,
  Brain,
  Bell,
  Settings,
  BookOpen,
  Activity,
  Lock,
  Zap,
  Github,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsGrid } from "@/components/sentinel/stats-grid";
import { ChartsGrid } from "@/components/sentinel/charts-grid";
import { ScansList } from "@/components/sentinel/scans-list";
import { VulnerabilitiesList } from "@/components/sentinel/vulnerabilities-list";
import { AlertsList } from "@/components/sentinel/alerts-list";
import { SettingsPanel } from "@/components/sentinel/settings-panel";
import { ArchitectureDocs } from "@/components/sentinel/architecture-docs";
import { NewScanCard } from "@/components/sentinel/new-scan-card";

type TabKey = "overview" | "scans" | "vulnerabilities" | "alerts" | "settings" | "docs";

const tabs: { key: TabKey; label: string; icon: typeof Activity }[] = [
  { key: "overview", label: "نظرة عامة", icon: Activity },
  { key: "scans", label: "الفحوصات", icon: Radar },
  { key: "vulnerabilities", label: "الثغرات", icon: Bug },
  { key: "alerts", label: "التنبيهات", icon: Bell },
  { key: "settings", label: "الإعدادات", icon: Settings },
  { key: "docs", label: "التوثيق", icon: BookOpen },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  return (
    <div className="min-h-screen flex flex-col bg-background cyber-grid-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative shrink-0"
            >
              <div className="absolute inset-0 bg-cyan-500/30 blur-lg rounded-full" />
              <div className="relative p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white cyber-glow">
                <Shield className="h-6 w-6" />
              </div>
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight cyber-text-glow truncate">
                Cyber-SentinelBaran
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                منظومة الفحص الأمني واختبار الاختراق والحماية الذاتية اللامركزية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <div className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                LIVE
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] hidden md:inline-flex">
              <Sparkles className="h-3 w-3 ml-1 text-cyan-500" />
              v1.0
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              asChild
            >
              <a
                href="https://github.com/Cyber-SentinelBaran"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-3.5 w-3.5 ml-1.5" />
                <span className="hidden sm:inline">المستودع</span>
              </a>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="container mx-auto max-w-7xl px-4 pb-3 -mt-1 overflow-x-auto custom-scroll-x">
          <div className="flex items-center gap-1 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors rounded-md ${
                    active
                      ? "text-cyan-600 dark:text-cyan-400"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  {active && (
                    <motion.div
                      layoutId="active-tab-bg"
                      className="absolute inset-0 bg-cyan-500/10 border-b-2 border-cyan-500 rounded-md -z-10"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Hero Section (always shown) */}
        <HeroSection />

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
            {activeTab === "overview" && (
              <>
                <StatsGrid />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <ChartsGrid />
                  </div>
                  <div className="space-y-4">
                    <NewScanCard />
                    <AlertsList />
                  </div>
                </div>
                <ScansList />
              </>
            )}
            {activeTab === "scans" && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-1">
                    <NewScanCard />
                  </div>
                  <div className="lg:col-span-2">
                    <ScansList />
                  </div>
                </div>
              </>
            )}
            {activeTab === "vulnerabilities" && <VulnerabilitiesList />}
            {activeTab === "alerts" && <AlertsList />}
            {activeTab === "settings" && <SettingsPanel />}
            {activeTab === "docs" && <ArchitectureDocs />}
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function HeroSection() {
  const features = [
    { icon: Zap, label: "تكلفة صفر", sub: "موارد مفتوحة بالكامل" },
    { icon: ShieldCheck, label: "حماية استباقية", sub: "قبل المخترقين" },
    { icon: Lock, label: "سيادة تامة", sub: "بياناتك محلياً" },
    { icon: Brain, label: "ذكاء اصطناعي", sub: "كود إصلاح آلي" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-background to-purple-500/5 p-6 sm:p-8"
    >
      {/* Animated scanline */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" style={{ top: "30%", animation: "scan-line 4s linear infinite" }} />
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <Badge variant="outline" className="text-xs border-cyan-500/40 text-cyan-600 dark:text-cyan-400">
            <Sparkles className="h-3 w-3 ml-1" />
            نظام ذكي متكامل • Free & Open Source
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            درع سيبراني ذكي
            <br />
            <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
              بلا تكلفة
            </span>{" "}
            يحمي مشروعك
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
            فحص آمن آلي للويب ومنافذ الشبكات واكتشاف الثغرات (OWASP Top 10) في التطبيقات والمواقع،
            مع توليد كود الإصلاح تلقائياً بواسطة الذكاء الاصطناعي — دون دفع دولار واحد لأي أداة مدفوعة.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              onClick={() => document.querySelector('[data-tab-scans]')?.scrollIntoView({ behavior: "smooth" })}
            >
              <Radar className="h-4 w-4 ml-1.5" />
              ابدأ الفحص الآن
            </Button>
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4 ml-1.5" />
              كيف يعمل النظام؟
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur hover:border-cyan-500/30 transition-colors"
              >
                <div className="p-2 rounded-lg bg-cyan-500/10 w-fit mb-3">
                  <Icon className="h-5 w-5 text-cyan-500" />
                </div>
                <div className="text-sm font-semibold">{f.label}</div>
                <div className="text-[11px] text-muted-foreground">{f.sub}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/50 backdrop-blur">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold cyber-text-glow">Cyber-SentinelBaran</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              منظومة الفحص الأمني، اختبار الاختراق، والحماية الذاتية اللامركزية.
              مشروع رقم #14 في سجل قاعدة بيانات الابتكار البرمجي.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold mb-2 text-cyan-600 dark:text-cyan-400">الموارد المجانية</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <ChevronLeft className="h-3 w-3" />
                GitHub Actions (مجدول)
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronLeft className="h-3 w-3" />
                Semgrep + Nuclei + Nmap
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronLeft className="h-3 w-3" />
                Gemini / Groq API (Free Tier)
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronLeft className="h-3 w-3" />
                Supabase (PostgreSQL)
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronLeft className="h-3 w-3" />
                Telegram Bot API
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold mb-2 text-cyan-600 dark:text-cyan-400">
              الدعم وحقوق الملكية
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>© 2026 Cyber-SentinelBaran. جميع الحقوق محفوظة.</li>
              <li>المشروع رقم #14 في سجل قاعدة بيانات الابتكار البرمجي.</li>
              <li>الترخيص: MIT (مفتوح المصدر بالكامل).</li>
              <li className="text-cyan-600 dark:text-cyan-400">البريد: support@sentinelbaran.io</li>
              <li className="text-cyan-600 dark:text-cyan-400">تليجرام: @sentinelbaran_support</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-border/40 text-center text-[11px] text-muted-foreground">
          <p>
            صُمِّم وبُنِيَ بحب لحماية مطوري ومؤسسات العالم العربي والإسلامي.
            <br className="sm:hidden" />{" "}
            ساعد على نشر الوعي الأمني — شارك المشروع مع زملائك المطورين.
          </p>
        </div>
      </div>
    </footer>
  );
}
