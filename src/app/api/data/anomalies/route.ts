import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/data/anomalies - قائمة الشذوذ المكتشَف
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get("severity");
    const limit = Number(searchParams.get("limit") || "30");

    const where: { severity?: string } = {};
    if (severity) where.severity = severity;

    const anomalies = await db.anomaly.findMany({
      where,
      orderBy: { detectedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ anomalies });
  } catch (e) {
    console.error("[API /data/anomalies GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
