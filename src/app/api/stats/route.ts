import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/stats
 * يُرجع إحصائيات لوحة التحكم الرئيسية
 */
export async function GET() {
  try {
    const scans = await db.scan.findMany({
      orderBy: { startedAt: "desc" },
      take: 100,
    });

    const vulnerabilities = await db.vulnerability.findMany();
    const alerts = await db.alertLog.findMany({
      orderBy: { sentAt: "desc" },
      take: 50,
    });
    const aiReports = await db.aiReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const totalScans = scans.length;
    const completedScans = scans.filter((s) => s.status === "completed").length;
    const runningScans = scans.filter((s) => s.status === "running").length;
    const failedScans = scans.filter((s) => s.status === "failed").length;

    const openVulns = vulnerabilities.filter((v) => v.status === "open").length;
    const fixedVulns = vulnerabilities.filter((v) => v.status === "fixed").length;
    const inProgressVulns = vulnerabilities.filter((v) => v.status === "in_progress").length;
    const ignoredVulns = vulnerabilities.filter((v) => v.status === "ignored").length;

    const bySeverity = {
      critical: vulnerabilities.filter((v) => v.severity === "critical").length,
      high: vulnerabilities.filter((v) => v.severity === "high").length,
      medium: vulnerabilities.filter((v) => v.severity === "medium").length,
      low: vulnerabilities.filter((v) => v.severity === "low").length,
      info: vulnerabilities.filter((v) => v.severity === "info").length,
    };

    // OWASP Top 10 distribution
    const owaspCounts: Record<string, number> = {};
    vulnerabilities.forEach((v) => {
      const key = v.category.split(" - ")[0];
      owaspCounts[key] = (owaspCounts[key] || 0) + 1;
    });

    // 14-day timeline
    const now = new Date();
    const days: { date: string; scans: number; vulns: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dayScans = scans.filter((s) => s.startedAt >= dayStart && s.startedAt < dayEnd).length;
      const dayVulns = vulnerabilities.filter((v) => v.detectedAt >= dayStart && v.detectedAt < dayEnd).length;
      days.push({
        date: dayStart.toISOString().split("T")[0],
        scans: dayScans,
        vulns: dayVulns,
      });
    }

    const avgRisk =
      aiReports.length > 0
        ? Math.round(aiReports.reduce((sum, r) => sum + r.riskScore, 0) / aiReports.length)
        : 0;

    return NextResponse.json({
      overview: {
        totalScans,
        completedScans,
        runningScans,
        failedScans,
        openVulns,
        fixedVulns,
        inProgressVulns,
        ignoredVulns,
        totalVulns: vulnerabilities.length,
        avgRisk,
        totalAlerts: alerts.length,
        sentAlerts: alerts.filter((a) => a.status === "sent").length,
      },
      bySeverity,
      owasp: owaspCounts,
      timeline: days,
      recentScans: scans.slice(0, 8),
      recentAlerts: alerts.slice(0, 6),
    });
  } catch (e) {
    console.error("[API /stats] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
