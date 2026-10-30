import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/seo/content - قائمة المحتوى المُولَّد
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = Number(searchParams.get("limit") || "30");

    const where: { status?: string } = {};
    if (status) where.status = status;

    const content = await db.generatedContent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ content });
  } catch (e) {
    console.error("[API /seo/content GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
