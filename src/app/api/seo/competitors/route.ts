import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/seo/competitors - قائمة المنافسين
 */
export async function GET() {
  try {
    const competitors = await db.competitor.findMany({
      orderBy: { estTraffic: "desc" },
    });
    return NextResponse.json({ competitors });
  } catch (e) {
    console.error("[API /seo/competitors GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
