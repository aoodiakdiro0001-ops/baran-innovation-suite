import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/seo/keywords - قائمة الكلمات المفتاحية المُتتبَّعة
 * POST /api/seo/keywords - إضافة كلمة مفتاحية جديدة
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = Number(searchParams.get("limit") || "50");

    const where: { status?: string } = {};
    if (status) where.status = status;

    const keywords = await db.keyword.findMany({
      where,
      orderBy: [{ currentRank: "asc" }, { searchVolume: "desc" }],
      take: limit,
      include: {
        snapshots: {
          orderBy: { capturedAt: "asc" },
          take: 14,
          select: { rank: true, capturedAt: true, competitorRank: true },
        },
      },
    });

    return NextResponse.json({ keywords });
  } catch (e) {
    console.error("[API /seo/keywords GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { keyword, locale = "ar", searchVolume = 0, difficulty = 0, intent = "informational", url = "" } = body;

    if (!keyword) {
      return NextResponse.json({ error: "keyword_required" }, { status: 400 });
    }

    // محاكاة ترتيب أولي
    const initialRank = Math.floor(Math.random() * 50) + 1;

    const created = await db.keyword.create({
      data: {
        keyword,
        locale,
        searchVolume,
        difficulty,
        intent,
        url,
        currentRank: initialRank,
        previousRank: initialRank,
        bestRank: initialRank,
        worstRank: initialRank,
        status: "tracking",
      },
    });

    // لقطة أولية
    await db.rankSnapshot.create({
      data: {
        keywordId: created.id,
        rank: initialRank,
        competitorRank: Math.max(1, initialRank - Math.floor(Math.random() * 10)),
      },
    });

    return NextResponse.json({
      keyword: created,
      message: `تمت إضافة الكلمة "${keyword}" للرصد. الترتيب الأولي: #${initialRank}`,
    });
  } catch (e) {
    console.error("[API /seo/keywords POST] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
