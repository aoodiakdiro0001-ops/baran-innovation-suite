import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/pixel/stats
 * يُرجع إحصائيات Pixel-ZeroBaran للوحة التحكم
 */
export async function GET() {
  try {
    const jobs = await db.imageJob.findMany({
      orderBy: { startedAt: "desc" },
      take: 200,
    });
    const templates = await db.backgroundTemplate.findMany();
    const dailyStats = await db.pixelDailyStat.findMany({
      orderBy: { date: "asc" },
      take: 14,
    });

    const totalJobs = jobs.length;
    const completedJobs = jobs.filter((j) => j.status === "completed").length;
    const processingJobs = jobs.filter((j) => j.status === "processing").length;
    const failedJobs = jobs.filter((j) => j.status === "failed").length;

    // إجمالي التوفير بالدولار
    const totalCostSaved = jobs.reduce((sum, j) => sum + (j.costSavedUsd || 0), 0);

    // متوسط زمن المعالجة
    const completedWithTime = jobs.filter((j) => j.processingTimeMs);
    const avgProcessingMs = completedWithTime.length
      ? Math.round(
          completedWithTime.reduce((sum, j) => sum + (j.processingTimeMs || 0), 0) /
            completedWithTime.length
        )
      : 0;

    // توزيع أنواع المعالجة
    const processTypes = {
      rembg: jobs.filter((j) => j.processType === "rembg").length,
      relight: jobs.filter((j) => j.processType === "relight").length,
      composite: jobs.filter((j) => j.processType === "composite").length,
      full: jobs.filter((j) => j.processType === "full").length,
    };

    // توزيع مصادر الطلب
    const sources = {
      telegram: jobs.filter((j) => j.source === "telegram").length,
      web: jobs.filter((j) => j.source === "web").length,
      api: jobs.filter((j) => j.source === "api").length,
      github: jobs.filter((j) => j.source === "github").length,
    };

    // توزيع أنماط الخلفية
    const styleCounts: Record<string, number> = {};
    jobs.forEach((j) => {
      if (j.backgroundStyle) {
        styleCounts[j.backgroundStyle] = (styleCounts[j.backgroundStyle] || 0) + 1;
      }
    });

    // معدل النجاح
    const successRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

    return NextResponse.json({
      overview: {
        totalJobs,
        completedJobs,
        processingJobs,
        failedJobs,
        totalCostSaved: Math.round(totalCostSaved * 100) / 100,
        avgProcessingMs,
        successRate,
        totalTemplates: templates.length,
      },
      processTypes,
      sources,
      styleCounts,
      dailyStats: dailyStats.map((d) => ({
        date: d.date,
        jobs: d.totalJobs,
        completed: d.completedJobs,
        costSaved: d.totalCostSavedUsd,
      })),
      recentJobs: jobs.slice(0, 8),
      templates,
    });
  } catch (e) {
    console.error("[API /pixel/stats] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
