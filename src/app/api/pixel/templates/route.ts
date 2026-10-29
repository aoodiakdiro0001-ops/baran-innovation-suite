import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/pixel/templates - قوالب الخلفيات التسويقية
 */
export async function GET() {
  try {
    const templates = await db.backgroundTemplate.findMany({
      orderBy: { usageCount: "desc" },
    });
    return NextResponse.json({ templates });
  } catch (e) {
    console.error("[API /pixel/templates GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
