import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/spatial/stats
 * يُرجع إحصائيات Spatial-ZeroBaran
 */
export async function GET() {
  try {
    const assets = await db.asset3D.findMany({
      orderBy: { createdAt: "desc" },
    });
    const dailyStats = await db.spatialDailyStat.findMany({
      orderBy: { date: "asc" },
      take: 14,
    });

    const totalAssets = assets.length;
    const readyAssets = assets.filter((a) => a.status === "ready").length;
    const processingAssets = assets.filter((a) => a.status === "processing").length;
    const failedAssets = assets.filter((a) => a.status === "failed").length;

    const totalPolygonsReduced = assets.reduce(
      (s, a) => s + (a.originalPolyCount - a.polygonCount),
      0
    );
    const totalSizeBytes = assets.reduce((s, a) => s + a.fileSizeBytes, 0);
    const totalCostSaved = assets.reduce((s, a) => s + a.costSavedUsd, 0);

    const avgDecimationRatio =
      assets.length > 0
        ? Math.round(
            (assets.reduce((s, a) => {
              if (a.originalPolyCount === 0) return s;
              return s + ((a.originalPolyCount - a.polygonCount) / a.originalPolyCount) * 100;
            }, 0) / assets.length) * 10
          ) / 10
        : 0;

    const avgGenerationMs =
      assets.filter((a) => a.processingMs > 0).length > 0
        ? Math.round(
            assets.filter((a) => a.processingMs > 0).reduce((s, a) => s + a.processingMs, 0) /
              assets.filter((a) => a.processingMs > 0).length
          )
        : 0;

    // توزيع حسب الفئة
    const categoryCounts: Record<string, number> = {};
    assets.forEach((a) => {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });

    // توزيع حسب المصدر
    const sourceCounts: Record<string, number> = {};
    assets.forEach((a) => {
      sourceCounts[a.modelSource] = (sourceCounts[a.modelSource] || 0) + 1;
    });

    // توزيع حسب المحرك المستخدم
    const engineCounts: Record<string, number> = {};
    assets.forEach((a) => {
      if (a.usedIn) {
        engineCounts[a.usedIn] = (engineCounts[a.usedIn] || 0) + 1;
      }
    });

    return NextResponse.json({
      overview: {
        totalAssets,
        readyAssets,
        processingAssets,
        failedAssets,
        totalPolygonsReduced,
        totalSizeBytes,
        totalCostSaved: Math.round(totalCostSaved * 100) / 100,
        avgDecimationRatio,
        avgGenerationMs,
      },
      categoryCounts,
      sourceCounts,
      engineCounts,
      dailyStats: dailyStats.map((d) => ({
        date: d.date,
        assets: d.assetsGenerated,
        polygonsReduced: d.totalPolygonsReduced,
        costSaved: d.totalCostSavedUsd,
        successRate: d.successRate,
      })),
      recentAssets: assets.slice(0, 8),
    });
  } catch (e) {
    console.error("[API /spatial/stats] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
