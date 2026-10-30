import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/data/insights - قائمة رؤى AI
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get("severity");
    const type = searchParams.get("type");
    const limit = Number(searchParams.get("limit") || "30");

    const where: { severity?: string; type?: string } = {};
    if (severity) where.severity = severity;
    if (type) where.type = type;

    const insights = await db.insight.findMany({
      where,
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        dataset: { select: { name: true, source: true } },
      },
    });

    return NextResponse.json({ insights });
  } catch (e) {
    console.error("[API /data/insights GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
