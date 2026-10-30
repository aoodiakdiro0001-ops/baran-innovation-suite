import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/data/stats
 * يُرجع إحصائيات Data-Nexus ZeroBaran
 */
export async function GET() {
  try {
    const datasets = await db.dataset.findMany({
      orderBy: { uploadedAt: "desc" },
    });
    const pipelines = await db.pipeline.findMany();
    const insights = await db.insight.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    const anomalies = await db.anomaly.findMany({
      orderBy: { detectedAt: "desc" },
      take: 30,
    });
    const dailyStats = await db.dataDailyStat.findMany({
      orderBy: { date: "asc" },
      take: 14,
    });

    const totalDatasets = datasets.length;
    const analyzedDatasets = datasets.filter((d) => d.status === "analyzed").length;
    const cleanedDatasets = datasets.filter((d) => d.status === "cleaned").length;
    const processingDatasets = datasets.filter((d) => d.status === "processing").length;
    const rawDatasets = datasets.filter((d) => d.status === "raw").length;

    const totalRows = datasets.reduce((s, d) => s + d.rowCount, 0);
    const totalSize = datasets.reduce((s, d) => s + d.sizeBytes, 0);
    const avgQuality =
      datasets.length > 0
        ? Math.round(datasets.reduce((s, d) => s + d.qualityScore, 0) / datasets.length)
        : 0;

    const completedPipelines = pipelines.filter((p) => p.status === "completed").length;
    const avgPipelineMs = pipelines
      .filter((p) => p.durationMs)
      .reduce((s, p, _, arr) => s + (p.durationMs || 0) / arr.length, 0);

    const criticalInsights = insights.filter((i) => i.severity === "critical").length;
    const highInsights = insights.filter((i) => i.severity === "high").length;
    const mediumInsights = insights.filter((i) => i.severity === "medium").length;

    const criticalAnomalies = anomalies.filter((a) => a.severity === "critical").length;
    const highAnomalies = anomalies.filter((a) => a.severity === "high").length;
    const notifiedAnomalies = anomalies.filter((a) => a.notified).length;

    // توزيع حسب المصدر
    const sourceCounts: Record<string, number> = {};
    datasets.forEach((d) => {
      sourceCounts[d.source] = (sourceCounts[d.source] || 0) + 1;
    });

    return NextResponse.json({
      overview: {
        totalDatasets,
        analyzedDatasets,
        cleanedDatasets,
        processingDatasets,
        rawDatasets,
        totalRows,
        totalSize,
        avgQuality,
        completedPipelines,
        avgPipelineMs: Math.round(avgPipelineMs),
        totalInsights: insights.length,
        criticalInsights,
        highInsights,
        mediumInsights,
        totalAnomalies: anomalies.length,
        criticalAnomalies,
        highAnomalies,
        notifiedAnomalies,
      },
      sourceCounts,
      dailyStats: dailyStats.map((d) => ({
        date: d.date,
        datasets: d.datasetsProcessed,
        rows: d.totalRows,
        quality: d.avgQualityScore,
        insights: d.insightsGenerated,
        anomalies: d.anomaliesDetected,
        costSaved: d.costSavedUsd,
      })),
      recentDatasets: datasets.slice(0, 6),
      recentInsights: insights.slice(0, 6),
      recentAnomalies: anomalies.slice(0, 6),
    });
  } catch (e) {
    console.error("[API /data/stats] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
