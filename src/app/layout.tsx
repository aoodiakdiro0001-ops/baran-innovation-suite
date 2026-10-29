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
  title: "Baran Innovation Suite | Cyber-SentinelBaran + Pixel-ZeroBaran",
  description:
    "منصة تجمع مشروعين مبتكرين بُنيا بموارد مجانية بالكامل: Cyber-SentinelBaran (الفحص الأمني واختبار الاختراق) و Pixel-ZeroBaran (استوديو تعديل ومعالجة الصور).",
  keywords: [
    "Cyber-SentinelBaran",
    "Pixel-ZeroBaran",
    "Baran Innovation Suite",
    "اختبار الاختراق",
    "الفحص الأمني",
    "OWASP Top 10",
    "Semgrep",
    "Nuclei",
    "Nmap",
    "Gemini AI",
    "Supabase",
    "Telegram Bot",
    "GitHub Actions",
    "rembg",
    "Hugging Face",
    "إزالة الخلفية",
    "إعادة الإضاءة",
    "توليد تسويقي",
    "حماية الذاتية اللامركزية",
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
