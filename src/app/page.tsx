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
  Phone,
  User,
  Bitcoin,
  ShoppingBag,
  Coins,
  Gift,
  Image as ImageIcon,
  ArrowRight,
  Layers,
  DollarSign,
  Search,
  TrendingUp,
  PenLine,
  Users,
  Database,
  AlertTriangle,
  Lightbulb,
  Box,
  Server,
  Target,
  Send,
  Reply,
  Trophy,
  Mail,
  Wrench,
  MessageSquare,
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

// SEO-GhostBaran components
import { SeoStatsGrid } from "@/components/seo/seo-stats-grid";
import { SeoChartsGrid } from "@/components/seo/seo-charts-grid";
import { KeywordTracker } from "@/components/seo/keyword-tracker";
import { ContentGenerator } from "@/components/seo/content-generator";
import { CompetitorsList } from "@/components/seo/competitors-list";
import { SeoArchitectureDocs } from "@/components/seo/seo-architecture-docs";
import { SeoSettingsPanel } from "@/components/seo/seo-settings-panel";

// Data-Nexus ZeroBaran components
import { DataStatsGrid } from "@/components/data/data-stats-grid";
import { DataChartsGrid } from "@/components/data/data-charts-grid";
import { DatasetUploader } from "@/components/data/dataset-uploader";
import { DatasetsList } from "@/components/data/datasets-list";
import { InsightsList } from "@/components/data/insights-list";
import { AnomaliesList } from "@/components/data/anomalies-list";
import { DataArchitectureDocs } from "@/components/data/data-architecture-docs";
import { DataSettingsPanel } from "@/components/data/data-settings-panel";

// Spatial-ZeroBaran components
import { SpatialStatsGrid } from "@/components/spatial/spatial-stats-grid";
import { SpatialChartsGrid } from "@/components/spatial/spatial-charts-grid";
import { AssetGenerator } from "@/components/spatial/asset-generator";
import { AssetsGallery } from "@/components/spatial/assets-gallery";
import { SpatialArchitectureDocs } from "@/components/spatial/spatial-architecture-docs";
import { SpatialSettingsPanel } from "@/components/spatial/spatial-settings-panel";

// Lead-Sniper ZeroBaran components
import { LeadStatsGrid } from "@/components/leads/lead-stats-grid";
import { LeadChartsGrid } from "@/components/leads/lead-charts-grid";
import { LeadScraperConfig } from "@/components/leads/lead-scraper-config";
import { PipelineView } from "@/components/leads/pipeline-view";
import { OutreachList } from "@/components/leads/outreach-list";
import { LeadArchitectureDocs } from "@/components/leads/lead-architecture-docs";
import { LeadSettingsPanel } from "@/components/leads/lead-settings-panel";

// AIOps-ZeroBaran components
import { AiopsStatsGrid } from "@/components/aiops/aiops-stats-grid";
import { AiopsChartsGrid } from "@/components/aiops/aiops-charts-grid";
import { ServiceList } from "@/components/aiops/service-list";
import { IncidentList } from "@/components/aiops/incident-list";
import { AiopsArchitectureDocs } from "@/components/aiops/aiops-architecture-docs";
import { AiopsSettingsPanel } from "@/components/aiops/aiops-settings-panel";

// Omni-Sales ZeroBaran components
import { SalesStatsGrid } from "@/components/sales/sales-stats-grid";
import { SalesChartsGrid } from "@/components/sales/sales-charts-grid";
import { ConversationList } from "@/components/sales/conversation-list";
import { KnowledgeBaseList } from "@/components/sales/knowledge-base-list";
import { SalesArchitectureDocs } from "@/components/sales/sales-architecture-docs";
import { SalesSettingsPanel } from "@/components/sales/sales-settings-panel";

type ProjectKey = "cyber" | "pixel" | "seo" | "data" | "spatial" | "leads" | "aiops" | "omni";
type CyberTab = "overview" | "scans" | "vulnerabilities" | "alerts" | "support" | "settings" | "docs";
type PixelTab = "overview" | "upload" | "jobs" | "gallery" | "settings" | "docs";
type SeoTab = "overview" | "keywords" | "content" | "competitors" | "settings" | "docs";
type DataTab = "overview" | "datasets" | "insights" | "anomalies" | "settings" | "docs";
type SpatialTab = "overview" | "generate" | "gallery" | "settings" | "docs";
type LeadsTab = "overview" | "scraper" | "pipeline" | "outreaches" | "settings" | "docs";
type AiopsTab = "overview" | "services" | "incidents" | "settings" | "docs";
type OmniTab = "overview" | "conversations" | "knowledge" | "settings" | "docs";

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

const seoTabs: { key: SeoTab; label: string; icon: typeof Activity }[] = [
  { key: "overview", label: "نظرة عامة", icon: Activity },
  { key: "keywords", label: "الكلمات المفتاحية", icon: Search },
  { key: "content", label: "محرّر المحتوى", icon: PenLine },
  { key: "competitors", label: "المنافسون", icon: Users },
  { key: "settings", label: "الإعدادات", icon: Settings },
  { key: "docs", label: "التوثيق", icon: BookOpen },
];

const dataTabs: { key: DataTab; label: string; icon: typeof Activity }[] = [
  { key: "overview", label: "نظرة عامة", icon: Activity },
  { key: "datasets", label: "مصادر البيانات", icon: Database },
  { key: "insights", label: "رؤى AI", icon: Brain },
  { key: "anomalies", label: "الشذوذ", icon: AlertTriangle },
  { key: "settings", label: "الإعدادات", icon: Settings },
  { key: "docs", label: "التوثيق", icon: BookOpen },
];

const spatialTabs: { key: SpatialTab; label: string; icon: typeof Activity }[] = [
  { key: "overview", label: "نظرة عامة", icon: Activity },
  { key: "generate", label: "توليد مجسم", icon: Box },
  { key: "gallery", label: "المعرض", icon: Sparkles },
  { key: "settings", label: "الإعدادات", icon: Settings },
  { key: "docs", label: "التوثيق", icon: BookOpen },
];

const leadsTabs: { key: LeadsTab; label: string; icon: typeof Activity }[] = [
  { key: "overview", label: "نظرة عامة", icon: Activity },
  { key: "scraper", label: "صيد عملاء", icon: Target },
  { key: "pipeline", label: "خط المبيعات", icon: Users },
  { key: "outreaches", label: "الرسائل", icon: Mail },
  { key: "settings", label: "الإعدادات", icon: Settings },
  { key: "docs", label: "التوثيق", icon: BookOpen },
];

const aiopsTabs: { key: AiopsTab; label: string; icon: typeof Activity }[] = [
  { key: "overview", label: "نظرة عامة", icon: Activity },
  { key: "services", label: "الخدمات", icon: Server },
  { key: "incidents", label: "الحوادث", icon: AlertTriangle },
  { key: "settings", label: "الإعدادات", icon: Settings },
  { key: "docs", label: "التوثيق", icon: BookOpen },
];

const omniTabs: { key: OmniTab; label: string; icon: typeof Activity }[] = [
  { key: "overview", label: "نظرة عامة", icon: Activity },
  { key: "conversations", label: "المحادثات", icon: MessageSquare },
  { key: "knowledge", label: "قاعدة المعرفة", icon: BookOpen },
  { key: "settings", label: "الإعدادات", icon: Settings },
  { key: "docs", label: "التوثيق", icon: BookOpen },
];

export default function Home() {
  const [project, setProject] = useState<ProjectKey | null>(null);
  const [cyberTab, setCyberTab] = useState<CyberTab>("overview");
  const [pixelTab, setPixelTab] = useState<PixelTab>("overview");
  const [seoTab, setSeoTab] = useState<SeoTab>("overview");
  const [dataTab, setDataTab] = useState<DataTab>("overview");
  const [spatialTab, setSpatialTab] = useState<SpatialTab>("overview");
  const [leadsTab, setLeadsTab] = useState<LeadsTab>("overview");
  const [aiopsTab, setAiopsTab] = useState<AiopsTab>("overview");
  const [omniTab, setOmniTab] = useState<OmniTab>("overview");

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
                  : project === "seo"
                  ? "from-emerald-500 to-teal-600"
                  : project === "data"
                  ? "from-amber-500 to-orange-600"
                  : project === "spatial"
                  ? "from-violet-500 to-purple-600"
                  : project === "leads"
                  ? "from-rose-500 to-pink-600"
                  : project === "aiops"
                  ? "from-blue-500 to-cyan-600"
                  : project === "omni"
                  ? "from-indigo-500 to-blue-600"
                  : "from-cyan-500 to-blue-600"
              }`}>
                {project === "pixel" ? <ImageIcon className="h-6 w-6" /> : project === "seo" ? <TrendingUp className="h-6 w-6" /> : project === "data" ? <Database className="h-6 w-6" /> : project === "spatial" ? <Box className="h-6 w-6" /> : project === "leads" ? <Target className="h-6 w-6" /> : project === "aiops" ? <Server className="h-6 w-6" /> : project === "omni" ? <MessageSquare className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
              </div>
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight cyber-text-glow truncate">
                {project === "pixel"
                  ? "Pixel-ZeroBaran"
                  : project === "seo"
                  ? "SEO-GhostBaran"
                  : project === "data"
                  ? "Data-Nexus ZeroBaran"
                  : project === "spatial"
                  ? "Spatial-ZeroBaran"
                  : project === "leads"
                  ? "Lead-Sniper ZeroBaran"
                  : project === "aiops"
                  ? "AIOps-ZeroBaran"
                  : project === "omni"
                  ? "Omni-Sales ZeroBaran"
                  : project === "cyber"
                  ? "Cyber-SentinelBaran"
                  : "Baran Innovation Suite"}
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {project === "pixel"
                  ? "استوديو تعديل ومعالجة الصور والتصميم الذاتي اللامركزي"
                  : project === "seo"
                  ? "منظومة الرصد والتجسس التسويقي ومحرك تحسين الظهور الذاتي"
                  : project === "data"
                  ? "منظومة تحليل وهندسة البيانات الذاتية واللامركزية"
                  : project === "spatial"
                  ? "الاستوديو الذاتي لتوليد ومعالجة المجسمات ثلاثية الأبعاد"
                  : project === "leads"
                  ? "المنظومة الذاتية لصيد العملاء والتسويق البارد اللامركزي"
                  : project === "aiops"
                  ? "المهندس الرقمي الذاتي لإدارة واستعادة الخوادم"
                  : project === "omni"
                  ? "الوكيل التجاري وخدمة العملاء الذاتي واللامركزي"
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
                8 مشاريع
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
          {project === "seo" && (
            <TabsBar tabs={seoTabs} active={seoTab} onChange={(k) => setSeoTab(k as SeoTab)} accent="emerald" />
          )}
          {project === "data" && (
            <TabsBar tabs={dataTabs} active={dataTab} onChange={(k) => setDataTab(k as DataTab)} accent="amber" />
          )}
          {project === "spatial" && (
            <TabsBar tabs={spatialTabs} active={spatialTab} onChange={(k) => setSpatialTab(k as SpatialTab)} accent="violet" />
          )}
          {project === "leads" && (
            <TabsBar tabs={leadsTabs} active={leadsTab} onChange={(k) => setLeadsTab(k as LeadsTab)} accent="rose" />
          )}
          {project === "aiops" && (
            <TabsBar tabs={aiopsTabs} active={aiopsTab} onChange={(k) => setAiopsTab(k as AiopsTab)} accent="blue" />
          )}
          {project === "omni" && (
            <TabsBar tabs={omniTabs} active={omniTab} onChange={(k) => setOmniTab(k as OmniTab)} accent="indigo" />
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {project === null ? (
          <ProjectLauncher onPick={setProject} />
        ) : (
          <motion.div
            key={`${project}-${project === "cyber" ? cyberTab : project === "pixel" ? pixelTab : project === "seo" ? seoTab : project === "data" ? dataTab : project === "spatial" ? spatialTab : project === "leads" ? leadsTab : project === "omni" ? omniTab : aiopsTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {project === "cyber" && <CyberContent tab={cyberTab} />}
            {project === "pixel" && <PixelContent tab={pixelTab} />}
            {project === "seo" && <SeoContent tab={seoTab} />}
            {project === "data" && <DataContent tab={dataTab} />}
            {project === "spatial" && <SpatialContent tab={spatialTab} />}
            {project === "leads" && <LeadsContent tab={leadsTab} />}
            {project === "aiops" && <AIOpsContent tab={aiopsTab} />}
            {project === "omni" && <OmniContent tab={omniTab} />}
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
  accent: "cyan" | "fuchsia" | "emerald" | "amber" | "violet" | "rose" | "sky" | "blue" | "indigo";
}) {
  const accentText = accent === "fuchsia" ? "text-fuchsia-600 dark:text-fuchsia-400"
    : accent === "emerald" ? "text-emerald-600 dark:text-emerald-400"
    : accent === "amber" ? "text-amber-600 dark:text-amber-400"
    : accent === "violet" ? "text-violet-600 dark:text-violet-400"
    : accent === "rose" ? "text-rose-600 dark:text-rose-400"
    : accent === "sky" ? "text-sky-600 dark:text-sky-400"
    : accent === "blue" ? "text-blue-600 dark:text-blue-400"
    : accent === "indigo" ? "text-indigo-600 dark:text-indigo-400"
    : "text-cyan-600 dark:text-cyan-400";
  const accentBg = accent === "fuchsia" ? "bg-fuchsia-500/10 border-b-2 border-fuchsia-500"
    : accent === "emerald" ? "bg-emerald-500/10 border-b-2 border-emerald-500"
    : accent === "amber" ? "bg-amber-500/10 border-b-2 border-amber-500"
    : accent === "violet" ? "bg-violet-500/10 border-b-2 border-violet-500"
    : accent === "rose" ? "bg-rose-500/10 border-b-2 border-rose-500"
    : accent === "sky" ? "bg-sky-500/10 border-b-2 border-sky-500"
    : accent === "blue" ? "bg-blue-500/10 border-b-2 border-blue-500"
    : accent === "indigo" ? "bg-indigo-500/10 border-b-2 border-indigo-500"
    : "bg-cyan-500/10 border-b-2 border-cyan-500";
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
                isActive ? accentText : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId={`active-tab-${accent}`}
                  className={`absolute inset-0 rounded-md -z-10 ${accentBg}`}
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
    {
      key: "seo" as ProjectKey,
      title: "SEO-GhostBaran",
      tagline: "منظومة الرصد والتجسس التسويقي",
      desc: "تتبع ترتيب الكلمات المفتاحية، تحليل محتوى المنافسين، وكشف الفجوات + توليد مقالات وصفحات هبوط SEO-Optimized جاهزة للنشر ليتصدّر موقعك نتائج البحث.",
      gradient: "from-emerald-500 to-teal-600",
      glow: "cyber-glow",
      icon: TrendingUp,
      features: [
        { icon: Search, label: "رصد يومي" },
        { icon: Brain, label: "AI يولّد محتوى" },
        { icon: TrendingUp, label: "تصدّر نتائج البحث" },
      ],
      stats: [
        { label: "كلمات مُتتبَّعة", value: "20" },
        { label: "منافسون", value: "6" },
        { label: "مقالات AI", value: "6" },
      ],
      number: "#12",
    },
    {
      key: "data" as ProjectKey,
      title: "Data-Nexus ZeroBaran",
      tagline: "منظومة تحليل وهندسة البيانات",
      desc: "جمع وتنظيف وتحليل قواعد البيانات الضخمة (CSV, JSON, SQL, APIs) تلقائياً. كشف الشذوذ، تنبؤ بالاتجاهات، وتوصيات AI عملية — دون Tableau أو Power BI.",
      gradient: "from-amber-500 to-orange-600",
      glow: "cyber-glow",
      icon: Database,
      features: [
        { icon: Database, label: "ETL تلقائي" },
        { icon: Brain, label: "AI تحليل تنبؤي" },
        { icon: AlertTriangle, label: "كشف الشذوذ" },
      ],
      stats: [
        { label: "مصادر بيانات", value: "8" },
        { label: "رؤى AI", value: "8" },
        { label: "شذوذ مكتشَف", value: "7" },
      ],
      number: "#11",
    },
    {
      key: "spatial" as ProjectKey,
      title: "Spatial-ZeroBaran",
      tagline: "استوديو المجسمات ثلاثية الأبعاد",
      desc: "تحويل النصوص أو الصور 2D إلى مجسمات 3D جاهزة لـ Unity/Unreal/Blender. أتمتة Decimation + UV Mapping + Texturing — دون شراء أصول مكلفة.",
      gradient: "from-violet-500 to-purple-600",
      glow: "cyber-glow",
      icon: Box,
      features: [
        { icon: Box, label: "توليد 3D فوري" },
        { icon: Layers, label: "Decimation آلي" },
        { icon: Sparkles, label: "Textures + UV" },
      ],
      stats: [
        { label: "مجسمات مُولَّدة", value: "12" },
        { label: "مضلعات مُقلَّصة", value: "1.4M" },
        { label: "توفير $", value: "2K+" },
      ],
      number: "#10",
    },
    {
      key: "leads" as ProjectKey,
      title: "Lead-Sniper ZeroBaran",
      tagline: "صيد العملاء والتسويق البارد",
      desc: "اكتشاف العملاء المحتملين آلياً، تحليل بياناتهم، توليد رسائل تواصل باردة شديدة التخصيص بـ AI، وإدارة خط المبيعات — دون Apollo أو Outreach.io.",
      gradient: "from-rose-500 to-pink-600",
      glow: "cyber-glow",
      icon: Target,
      features: [
        { icon: Target, label: "صيد آلي" },
        { icon: Brain, label: "AI تخصيص رسائل" },
        { icon: Trophy, label: "إدارة Pipeline" },
      ],
      stats: [
        { label: "عملاء محتملون", value: "22" },
        { label: "رسائل AI", value: "10" },
        { label: "صفقات مغلقة", value: "2" },
      ],
      number: "#9",
    },
    {
      key: "aiops" as ProjectKey,
      title: "AIOps-ZeroBaran",
      tagline: "المهندس الرقمي الذاتي للخوادم",
      desc: "مراقبة صحة الخوادم 24/7، اكتشاف الأعطال، تشخيص بالذكاء الاصطناعي، وإصلاح ذاتي تلقائي (Self-Healing) — دون Datadog أو New Relic.",
      gradient: "from-blue-500 to-cyan-600",
      glow: "cyber-glow",
      icon: Server,
      features: [
        { icon: Activity, label: "رصد 24/7" },
        { icon: Brain, label: "AI تشخيص" },
        { icon: Wrench, label: "إصلاح ذاتي" },
      ],
      stats: [
        { label: "خدمات مراقَبة", value: "10" },
        { label: "حوادث", value: "7" },
        { label: "إصلاح آلي", value: "8" },
      ],
      number: "#8",
    },
    {
      key: "omni" as ProjectKey,
      title: "Omni-Sales ZeroBaran",
      tagline: "الوكيل التجاري وخدمة العملاء",
      desc: "رد آلي 24/7 على استفسارات العملاء عبر تليجرام وواتساب والإيميل. فهم نية العميل، إجابة بـ RAG من كتالوج منتجاتك، التعامل مع الاعتراضات، وإرسال تفاصيل الدفع — دون Intercom أو Zendesk.",
      gradient: "from-indigo-500 to-blue-600",
      glow: "cyber-glow",
      icon: MessageSquare,
      features: [
        { icon: MessageSquare, label: "رد فوري 24/7" },
        { icon: Brain, label: "AI + RAG" },
        { icon: ShoppingBag, label: "إغلاق المبيعات" },
      ],
      stats: [
        { label: "محادثات", value: "10" },
        { label: "مبيعات", value: "5" },
        { label: "إيرادات", value: "$4.2K" },
      ],
      number: "#7",
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
            أمان، تصوير، تسويق، بيانات، 3D، عملاء، وصيانة و DevOps ودعم عملاء
            <br />
            <span className="bg-gradient-to-r from-cyan-500 via-fuchsia-500 via-amber-500 to-blue-500 bg-clip-text text-transparent">
              ثمانية منظومات ذكية — بلا تكلفة
            </span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            ثمانية مشاريع مبتكرة بُنيت بموارد مجانية بالكامل — اختر المشروع الذي تريده للبدء.
            كلها تعمل بالكامل محلياً مع سيادة وخصوصية تامة على بياناتك.
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-4">
        {projects.map((p, idx) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.12, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className={`group cursor-pointer rounded-2xl border border-border bg-card/50 backdrop-blur overflow-hidden transition-all hover:border-blue-500/40 ${p.glow}`}
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

function SeoContent({ tab }: { tab: SeoTab }) {
  return (
    <>
      {tab === "overview" && (
        <>
          <SeoStatsGrid />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SeoChartsGrid />
            </div>
            <div className="space-y-4">
              <CompetitorsList />
            </div>
          </div>
          <KeywordTracker />
        </>
      )}
      {tab === "keywords" && <KeywordTracker />}
      {tab === "content" && <ContentGenerator />}
      {tab === "competitors" && <CompetitorsList />}
      {tab === "settings" && <SeoSettingsPanel />}
      {tab === "docs" && <SeoArchitectureDocs />}
    </>
  );
}

function DataContent({ tab }: { tab: DataTab }) {
  return (
    <>
      {tab === "overview" && (
        <>
          <DataStatsGrid />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <DataChartsGrid />
            </div>
            <div className="space-y-4">
              <AnomaliesList />
            </div>
          </div>
          <DatasetsList />
        </>
      )}
      {tab === "datasets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <DatasetUploader />
          </div>
          <div className="lg:col-span-2">
            <DatasetsList />
          </div>
        </div>
      )}
      {tab === "insights" && <InsightsList />}
      {tab === "anomalies" && <AnomaliesList />}
      {tab === "settings" && <DataSettingsPanel />}
      {tab === "docs" && <DataArchitectureDocs />}
    </>
  );
}

function SpatialContent({ tab }: { tab: SpatialTab }) {
  return (
    <>
      {tab === "overview" && (
        <>
          <SpatialStatsGrid />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SpatialChartsGrid />
            </div>
            <div className="space-y-4">
              <AssetGenerator />
            </div>
          </div>
          <AssetsGallery />
        </>
      )}
      {tab === "generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AssetGenerator />
          <AssetsGallery />
        </div>
      )}
      {tab === "gallery" && <AssetsGallery />}
      {tab === "settings" && <SpatialSettingsPanel />}
      {tab === "docs" && <SpatialArchitectureDocs />}
    </>
  );
}

function LeadsContent({ tab }: { tab: LeadsTab }) {
  return (
    <>
      {tab === "overview" && (
        <>
          <LeadStatsGrid />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <LeadChartsGrid />
            </div>
            <div className="space-y-4">
              <LeadScraperConfig />
            </div>
          </div>
          <PipelineView />
        </>
      )}
      {tab === "scraper" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LeadScraperConfig />
          <PipelineView />
        </div>
      )}
      {tab === "pipeline" && <PipelineView />}
      {tab === "outreaches" && <OutreachList />}
      {tab === "settings" && <LeadSettingsPanel />}
      {tab === "docs" && <LeadArchitectureDocs />}
    </>
  );
}

function AIOpsContent({ tab }: { tab: AiopsTab }) {
  return (
    <>
      {tab === "overview" && (
        <>
          <AiopsStatsGrid />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <AiopsChartsGrid />
            </div>
            <div className="space-y-4">
              <IncidentList />
            </div>
          </div>
          <ServiceList />
        </>
      )}
      {tab === "services" && <ServiceList />}
      {tab === "incidents" && <IncidentList />}
      {tab === "settings" && <AiopsSettingsPanel />}
      {tab === "docs" && <AiopsArchitectureDocs />}
    </>
  );
}

function OmniContent({ tab }: { tab: OmniTab }) {
  return (
    <>
      {tab === "overview" && (
        <>
          <SalesStatsGrid />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SalesChartsGrid />
            </div>
            <div className="space-y-4">
              <ConversationList />
            </div>
          </div>
          <KnowledgeBaseList />
        </>
      )}
      {tab === "conversations" && <ConversationList />}
      {tab === "knowledge" && <KnowledgeBaseList />}
      {tab === "settings" && <SalesSettingsPanel />}
      {tab === "docs" && <SalesArchitectureDocs />}
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
              منصة تجمع ثمانية مشاريع مبتكرة بُنيت بموارد مجانية بالكامل:
              Cyber (#14)، Pixel (#13)، SEO (#12)، Data (#11)، Spatial (#10)، Leads (#9)، AIOps (#8)، و Omni-Sales (#7).
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
            © 2026 Baran Avisat — Baran Innovation Suite. جميع الحقوق محفوظة.
            المؤلف: Baran Avisat | رخصة MIT | المشاريع #7 إلى #14 في سجل قاعدة بيانات الابتكار البرمجي.
          </p>
          <p className="mt-1">
            صُمِّم وبُنِيَ بحب لمطوري ومصممي ومسوّقي ومؤسسات العالم العربي والإسلامي. 🛡️ + 🎨 + 📈 + 📊 + 🎭 + 🎯 + 🤖 + 💬
          </p>
        </div>
      </div>
    </footer>
  );
}
