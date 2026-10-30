import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Baran Innovation Suite | 8 ZeroBaran Projects — Cyber, Pixel, SEO, Data, Spatial, Leads, AIOps, Omni-Sales ZeroBaran",
  description:
    "منصة تجمع ثمانية مشاريع مبتكرة بُنيت بموارد مجانية بالكامل: Cyber-SentinelBaran (الفحص الأمني)، Pixel-ZeroBaran (استوديو الصور)، SEO-GhostBaran (رصد SEO)، Data-Nexus ZeroBaran (تحليل البيانات)، Spatial-ZeroBaran (توليد 3D)، Lead-Sniper ZeroBaran (صيد العملاء)، AIOps-ZeroBaran (مهندس الخوادم الذاتي)، و Omni-Sales ZeroBaran (الوكيل التجاري وخدمة العملاء الذاتي عبر Omnichannel + RAG).",
  keywords: [
    "Cyber-SentinelBaran",
    "Pixel-ZeroBaran",
    "SEO-GhostBaran",
    "Data-Nexus ZeroBaran",
    "Spatial-ZeroBaran",
    "Lead-Sniper ZeroBaran",
    "AIOps-ZeroBaran",
    "Omni-Sales ZeroBaran",
    "Baran Innovation Suite",
    "أمان سيبراني",
    "اختبار اختراق",
    "فحص أمني",
    "OWASP Top 10",
    "Semgrep",
    "Nuclei",
    "Nmap",
    "إزالة خلفية",
    "rembg",
    "إعادة إضاءة",
    "توليد تسويقي",
    "SEO",
    "تتبع ترتيب",
    "توليد محتوى",
    "تحليل بيانات",
    "ETL Pipeline",
    "كشف شذوذ",
    "توليد 3D",
    "TripoSR",
    "Blender Headless",
    "صيد عملاء",
    "تسويق بارد",
    "Cold Outreach",
    "AI Personalization",
    "Sales Pipeline",
    "AIOps",
    "Self-Healing",
    "Uptime Monitoring",
    "Auto-Remediation",
    "Root Cause Analysis",
    "MTTR",
    "Server Monitoring",
    "Incident Response",
    "Datadog alternative",
    "New Relic alternative",
    "Omnichannel",
    "Customer Service",
    "Sales Agent",
    "RAG",
    "Retrieval-Augmented Generation",
    "AI Chatbot",
    "Telegram Bot",
    "WhatsApp Business",
    "Intent Detection",
    "Sentiment Analysis",
    "Intercom alternative",
    "Zendesk alternative",
    "LiveChat alternative",
    "Conversational AI",
    "pgvector",
    "Supabase",
    "Cloudflare Workers",
    "Gemini AI",
    "Groq API",
    "Z.ai SDK",
    "GitHub Actions",
    "DevOps",
    "SRE",
  ],
  authors: [{ name: "Baran Avisat" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Cyber-SentinelBaran",
    description: "منظومة الفحص الأمني واختبار الاختراق والحماية الذاتية اللامركزية",
    siteName: "Baran Innovation Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cyber-SentinelBaran",
    description: "منظومة الفحص الأمني واختبار الاختراق والحماية الذاتية اللامركزية",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
