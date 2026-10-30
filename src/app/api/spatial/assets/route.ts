import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/spatial/assets - قائمة المجسمات
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const limit = Number(searchParams.get("limit") || "30");

    const where: { status?: string; category?: string } = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const assets = await db.asset3D.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { versions: { select: { id: true, version: true, polygonCount: true, fileSizeBytes: true, processingType: true } } },
    });

    return NextResponse.json({ assets });
  } catch (e) {
    console.error("[API /spatial/assets GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
