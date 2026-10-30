import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/seo/stats
 * يُرجع إحصائيات SEO-GhostBaran للوحة التحكم
 */
export async function GET() {
  try {
    const keywords = await db.keyword.findMany({
      include: { snapshots: { orderBy: { capturedAt: "desc" }, take: 1 } },
    });
    const competitors = await db.competitor.findMany();
    const content = await db.generatedContent.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    const dailyStats = await db.seoDailyStat.findMany({
      orderBy: { date: "asc" },
      take: 14,
    });

    const totalKeywords = keywords.length;
    const trackedKeywords = keywords.filter((k) => k.status === "tracking").length;
    const wonKeywords = keywords.filter((k) => k.status === "won").length;
    const lostKeywords = keywords.filter((k) => k.status === "lost").length;
    const opportunityKeywords = keywords.filter((k) => k.status === "opportunity").length;

    const top1 = keywords.filter((k) => k.currentRank === 1).length;
    const top3 = keywords.filter((k) => k.currentRank > 0 && k.currentRank <= 3).length;
    const top10 = keywords.filter((k) => k.currentRank > 0 && k.currentRank <= 10).length;
    const top100 = keywords.filter((k) => k.currentRank > 0 && k.currentRank <= 100).length;

    const avgRank =
      keywords.length > 0
        ? Math.round((keywords.reduce((s, k) => s + (k.currentRank || 0), 0) / keywords.length) * 10) / 10
        : 0;

    // الكلمات التي تحسّنت
    const improved = keywords.filter((k) => k.currentRank < k.previousRank).length;
    const dropped = keywords.filter((k) => k.currentRank > k.previousRank).length;

    // إجمالي الزيارات المتوقعة من المحتوى
    const totalEstTraffic = content.reduce((s, c) => s + (c.estimatedTraffic || 0), 0);
    const avgSeoScore =
      content.length > 0
        ? Math.round(content.reduce((s, c) => s + (c.seoScore || 0), 0) / content.length)
        : 0;

    // إجمالي حجم البحث للكلمات
    const totalSearchVolume = keywords.reduce((s, k) => s + (k.searchVolume || 0), 0);

    return NextResponse.json({
      overview: {
        totalKeywords,
        trackedKeywords,
        wonKeywords,
        lostKeywords,
        opportunityKeywords,
        top1,
        top3,
        top10,
        top100,
        avgRank,
        improved,
        dropped,
        competitorsCount: competitors.length,
        contentCount: content.length,
        totalEstTraffic,
        avgSeoScore,
        totalSearchVolume,
      },
      dailyStats: dailyStats.map((d) => ({
        date: d.date,
        avgRank: d.avgRank,
        top10: d.top10Count,
        improvements: d.rankImprovements,
        drops: d.rankDrops,
        content: d.contentGenerated,
      })),
      recentContent: content.slice(0, 6),
      topCompetitors: competitors.slice(0, 6),
    });
  } catch (e) {
    console.error("[API /seo/stats] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
