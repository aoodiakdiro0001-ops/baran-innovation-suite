"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Mail,
  Phone,
  User,
  Bitcoin,
  ShoppingBag,
  Coins,
  Gift,
  Image as ImageIcon,
  Wand2,
  ArrowRight,
  Layers,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Cyber-SentinelBaran components
import { StatsGrid } from "@/components/sentinel/stats-grid";
import { ChartsGrid } from "@/components/sentinel/charts-grid";
import { ScansList } from "@/components/sentinel/scans-list";
import { VulnerabilitiesList } from "@/components/sentinel/vulnerabilities-list";
import { AlertsList } from "@/components/sentinel/alerts-list";
import { SettingsPanel } from "@/components/sentinel/settings-panel";
import { ArchitectureDocs } from "@/components/sentinel/architecture-docs";
import { NewScanCard } from "@/components/sentinel/new-scan-card";
import { SupportContact } from "@/components/sentinel/support-contact";
import { PaymentMethods } from "@/components/sentinel/payment-methods";
import { ReferralLinks } from "@/components/sentinel/referral-links";

// Pixel-ZeroBaran components
import { PixelStatsGrid } from "@/components/pixel/pixel-stats-grid";
import { PixelChartsGrid } from "@/components/pixel/pixel-charts-grid";
import { ImageUploader } from "@/components/pixel/image-uploader";
import { JobQueue } from "@/components/pixel/job-queue";
import { ResultsGallery } from "@/components/pixel/results-gallery";
import { PixelArchitectureDocs } from "@/components/pixel/pixel-architecture-docs";
import { PixelSettingsPanel } from "@/components/pixel/pixel-settings-panel";

type ProjectKey = "cyber" | "pixel";
type CyberTab = "overview" | "scans" | "vulnerabilities" | "alerts" | "support" | "settings" | "docs";
type PixelTab = "overview" | "upload" | "jobs" | "gallery" | "settings" | "docs";

const cyberTabs: { key: CyberTab; label: string; icon: typeof Activity }[] = [
  { key: "overview", label: "نظرة عامة", icon: Activity },
  { key: "scans", label: "الفحوصات", icon: Radar },
  { key: "vulnerabilities", label: "الثغرات", icon: Bug },
  { key: "alerts", label: "التنبيهات", icon: Bell },
  { key: "support", label: "الدفع والدعم", icon: ShieldCheck },
  { key: "settings", label: "الإعدادات", icon: Settings },
  { key: "docs", label: "التوثيق", icon: BookOpen },
];

const pixelTabs: { key: PixelTab; label: string; icon: typeof Activity }[] = [
  { key: "overview", label: "نظرة عامة", icon: Activity },
  { key: "upload", label: "رفع ومعالجة", icon: ImageIcon },
  { key: "jobs", label: "قائمة المهام", icon: Layers },
  { key: "gallery", label: "معرض النتائج", icon: Sparkles },
  { key: "settings", label: "الإعدادات", icon: Settings },
  { key: "docs", label: "التوثيق", icon: BookOpen },
];

export default function Home() {
  const [project, setProject] = useState<ProjectKey | null>(null);
  const [cyberTab, setCyberTab] = useState<CyberTab>("overview");
  const [pixelTab, setPixelTab] = useState<PixelTab>("overview");

  return (
    <div className="min-h-screen flex flex-col bg-background cyber-grid-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {project && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProject(null)}
                className="h-8 px-2 text-xs"
              >
                <ChevronLeft className="h-4 w-4" />
                المشاريع
              </Button>
            )}
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative shrink-0"
            >
              <div className="absolute inset-0 bg-cyan-500/30 blur-lg rounded-full" />
              <div className={`relative p-2 rounded-lg text-white cyber-glow bg-gradient-to-br ${
                project === "pixel"
                  ? "from-fuchsia-500 to-purple-600"
                  : "from-cyan-500 to-blue-600"
              }`}>
                {project === "pixel" ? <ImageIcon className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
              </div>
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight cyber-text-glow truncate">
                {project === "pixel"
                  ? "Pixel-ZeroBaran"
                  : project === "cyber"
                  ? "Cyber-SentinelBaran"
                  : "Baran Innovation Suite"}
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {project === "pixel"
                  ? "استوديو تعديل ومعالجة الصور والتصميم الذاتي اللامركزي"
                  : project === "cyber"
                  ? "منظومة الفحص الأمني واختبار الاختراق والحماية الذاتية اللامركزية"
                  : "اختر المشروع للبدء — كل مشروع بموارد مجانية بالكامل"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {project === null ? (
              <Badge variant="outline" className="text-[10px]">
                <Sparkles className="h-3 w-3 ml-1 text-cyan-500" />
                2 مشاريع
              </Badge>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <div className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">LIVE</span>
              </div>
            )}
            <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
              <a href="https://baranavi.gumroad.com/" target="_blank" rel="noopener noreferrer">
                <Github className="h-3.5 w-3.5 ml-1.5" />
                <span className="hidden sm:inline">المتجر</span>
              </a>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <AnimatePresence mode="wait">
          {project === "cyber" && (
            <TabsBar tabs={cyberTabs} active={cyberTab} onChange={(k) => setCyberTab(k as CyberTab)} accent="cyan" />
          )}
          {project === "pixel" && (
            <TabsBar tabs={pixelTabs} active={pixelTab} onChange={(k) => setPixelTab(k as PixelTab)} accent="fuchsia" />
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {project === null ? (
          <ProjectLauncher onPick={setProject} />
        ) : (
          <motion.div
            key={`${project}-${project === "cyber" ? cyberTab : pixelTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {project === "cyber" && <CyberContent tab={cyberTab} />}
            {project === "pixel" && <PixelContent tab={pixelTab} />}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function TabsBar({
  tabs,
  active,
  onChange,
  accent,
}: {
  tabs: { key: string; label: string; icon: typeof Activity }[];
  active: string;
  onChange: (k: string) => void;
  accent: "cyan" | "fuchsia";
}) {
  return (
    <div className="container mx-auto max-w-7xl px-4 pb-3 -mt-1 overflow-x-auto custom-scroll">
      <div className="flex items-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors rounded-md ${
                isActive
                  ? accent === "fuchsia"
                    ? "text-fuchsia-600 dark:text-fuchsia-400"
                    : "text-cyan-600 dark:text-cyan-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId={`active-tab-${accent}`}
                  className={`absolute inset-0 rounded-md -z-10 ${
                    accent === "fuchsia"
                      ? "bg-fuchsia-500/10 border-b-2 border-fuchsia-500"
                      : "bg-cyan-500/10 border-b-2 border-cyan-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProjectLauncher({ onPick }: { onPick: (p: ProjectKey) => void }) {
  const projects = [
    {
      key: "cyber" as ProjectKey,
      title: "Cyber-SentinelBaran",
      tagline: "منظومة الفحص الأمني الذكية",
      desc: "اختبار اختراق آلي، فحص الويب ومنافذ الشبكات، اكتشاف ثغرات OWASP Top 10، وتوليد كود الإصلاح بالذكاء الاصطناعي.",
      gradient: "from-cyan-500 to-blue-600",
      glow: "cyber-glow",
      icon: Shield,
      features: [
        { icon: Zap, label: "تكلفة صفر" },
        { icon: ShieldCheck, label: "حماية استباقية" },
        { icon: Brain, label: "AI إصلاح آلي" },
      ],
      stats: [
        { label: "الفحوصات", value: "6" },
        { label: "الثغرات", value: "18" },
        { label: "تقارير AI", value: "2" },
      ],
      number: "#14",
    },
    {
      key: "pixel" as ProjectKey,
      title: "Pixel-ZeroBaran",
      tagline: "استوديو تعديل ومعالجة الصور",
      desc: "إزالة الخلفيات بدقة متناهية، إعادة إضاءة المنتجات، وتوليد لقطات تسويقية احترافية جاهزة للإعلانات — دون استئجار استوديو.",
      gradient: "from-fuchsia-500 to-purple-600",
      glow: "cyber-glow",
      icon: ImageIcon,
      features: [
        { icon: DollarSign, label: "توفير فلكي" },
        { icon: Zap, label: "سرعة فورية" },
        { icon: Sparkles, label: "جودة احترافية" },
      ],
      stats: [
        { label: "صور معالَجة", value: "12" },
        { label: "قوالب خلفية", value: "6" },
        { label: "توفير $", value: "650+" },
      ],
      number: "#13",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-background to-fuchsia-500/5 p-8 sm:p-12"
      >
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" style={{ top: "30%", animation: "scan-line 4s linear infinite" }} />
        </div>
        <div className="relative text-center space-y-4">
          <Badge variant="outline" className="text-xs border-cyan-500/40 text-cyan-600 dark:text-cyan-400">
            <Sparkles className="h-3 w-3 ml-1" />
            Baran Innovation Suite — منصة المشاريع الذكية اللامركزية
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            درع سيبراني واستوديو تصوير
            <br />
            <span className="bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
              بلا تكلفة — في مكان واحد
            </span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            مشروعان مبتكران بُنيا بموارد مجانية بالكامل — اختر المشروع الذي تريده للبدء.
            كلاهما يعمل بالكامل محلياً مع سيادة وخصوصية تامة على بياناتك.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-cyan-500" />
              سيادة كاملة
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              تكلفة صفر
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-fuchsia-500" />
              جودة عالية
            </span>
          </div>
        </div>
      </motion.section>

      {/* Project Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((p, idx) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.15, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className={`group cursor-pointer rounded-2xl border border-border bg-card/50 backdrop-blur overflow-hidden transition-all hover:border-${p.gradient.split("-")[1]}-500/40 ${p.glow}`}
              onClick={() => onPick(p.key)}
            >
              {/* Header with gradient */}
              <div className={`relative h-32 bg-gradient-to-br ${p.gradient} p-6 flex items-center justify-between`}>
                <div className="absolute inset-0 cyber-grid-bg opacity-30" />
                <div className="relative flex-1">
                  <Badge className="bg-white/20 text-white border-0 text-xs mb-2">
                    المشروع {p.number}
                  </Badge>
                  <h3 className="text-2xl font-bold text-white mb-1">{p.title}</h3>
                  <p className="text-sm text-white/80">{p.tagline}</p>
                </div>
                <div className="relative p-3 rounded-xl bg-white/20 backdrop-blur">
                  <Icon className="h-10 w-10 text-white" />
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>

                {/* Features */}
                <div className="grid grid-cols-3 gap-2">
                  {p.features.map((f) => {
                    const FIcon = f.icon;
                    return (
                      <div key={f.label} className="flex items-center gap-1.5 p-2 rounded-md bg-muted/30">
                        <FIcon className="h-3.5 w-3.5 text-cyan-500" />
                        <span className="text-xs">{f.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                  {p.stats.map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-lg font-bold tabular-nums">{s.value}</div>
                      <div className="text-[10px] text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  className={`w-full bg-gradient-to-r ${p.gradient} text-white hover:opacity-90`}
                  size="sm"
                >
                  <span>الدخول إلى المشروع</span>
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function CyberContent({ tab }: { tab: CyberTab }) {
  return (
    <>
      {tab === "overview" && (
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
      {tab === "scans" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <NewScanCard />
          </div>
          <div className="lg:col-span-2">
            <ScansList />
          </div>
        </div>
      )}
      {tab === "vulnerabilities" && <VulnerabilitiesList />}
      {tab === "alerts" && <AlertsList />}
      {tab === "support" && (
        <>
          <SupportContact />
          <PaymentMethods />
          <ReferralLinks />
        </>
      )}
      {tab === "settings" && <SettingsPanel />}
      {tab === "docs" && <ArchitectureDocs />}
    </>
  );
}

function PixelContent({ tab }: { tab: PixelTab }) {
  return (
    <>
      {tab === "overview" && (
        <>
          <PixelStatsGrid />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <PixelChartsGrid />
            </div>
            <div className="space-y-4">
              <ImageUploader />
              <ResultsGallery />
            </div>
          </div>
          <JobQueue />
        </>
      )}
      {tab === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ImageUploader />
          <ResultsGallery />
        </div>
      )}
      {tab === "jobs" && <JobQueue />}
      {tab === "gallery" && <ResultsGallery />}
      {tab === "settings" && <PixelSettingsPanel />}
      {tab === "docs" && <PixelArchitectureDocs />}
    </>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/50 backdrop-blur">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-cyan-500 via-fuchsia-500 to-purple-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold cyber-text-glow">Baran Innovation Suite</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              منصة تجمع مشروعين مبتكرين بُنيا بموارد مجانية بالكامل:
              Cyber-SentinelBaran (#14) — الفحص الأمني، و Pixel-ZeroBaran (#13) — استوديو الصور.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold mb-2 text-cyan-600 dark:text-cyan-400">
              تواصل مع المالك
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                <a href="mailto:baranavisat@gmail.com" className="hover:text-cyan-500 transition-colors">
                  baranavisat@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                <a
                  href="https://wa.me/00905313263722"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-500 transition-colors"
                >
                  00905313263722 (واتساب)
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <User className="h-3 w-3" />
                Baran Avisat
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold mb-2 text-cyan-600 dark:text-cyan-400">
              طرق الدفع
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span>🇹🇷</span>
                <span className="font-mono text-[10px]" dir="ltr">TR10 0001...01</span>
                <span className="text-[10px]">(TRY)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>💵</span>
                <span className="font-mono text-[10px]" dir="ltr">TR80 0001...02</span>
                <span className="text-[10px]">(USD)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Bitcoin className="h-3 w-3 text-yellow-500" />
                <span className="font-mono text-[10px]" dir="ltr">bc1q8dht...zhzf6c</span>
                <span className="text-[10px]">(BTC)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span>₮</span>
                <span className="font-mono text-[10px]" dir="ltr">TLWdTjqq...oxeWW</span>
                <span className="text-[10px]">(USDT-TRC20)</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold mb-2 text-cyan-600 dark:text-cyan-400">
              متجر وروابط
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <ShoppingBag className="h-3 w-3" />
                <a href="https://baranavi.gumroad.com/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 transition-colors">
                  متجر Gumroad الرسمي
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Coins className="h-3 w-3" />
                <a href="https://www.binance.com/activity/referral-entry/CPA?ref=CPA_006Q5UBO64" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 transition-colors">
                  إحالة Binance
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Gift className="h-3 w-3" />
                <a href="https://pocket-friends.co/r/hvb4v0f1tt" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 transition-colors">
                  Pocket Friends
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-border/40 text-center text-[11px] text-muted-foreground">
          <p>
            © 2026 Baran Innovation Suite. جميع الحقوق محفوظة.
            المشاريع #13 و #14 في سجل قاعدة بيانات الابتكار البرمجي.
          </p>
          <p className="mt-1">
            صُمِّم وبُنِيَ بحب لحماية مطوري ومؤسسات العالم العربي والإسلامي. 🛡️ + 🎨
          </p>
        </div>
      </div>
    </footer>
  );
}
