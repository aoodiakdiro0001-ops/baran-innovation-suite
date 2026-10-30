import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/leads/leads - قائمة العملاء المحتملين
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const stage = searchParams.get("stage");
    const industry = searchParams.get("industry");
    const limit = Number(searchParams.get("limit") || "30");

    const where: { status?: string; stage?: string; industry?: string } = {};
    if (status) where.status = status;
    if (stage) where.stage = stage;
    if (industry) where.industry = industry;

    const leads = await db.lead.findMany({
      where,
      orderBy: [{ score: "desc" }, { discoveredAt: "desc" }],
      take: limit,
      include: { outreaches: { select: { id: true, status: true, channel: true, type: true, personalizationScore: true } } },
    });

    return NextResponse.json({ leads });
  } catch (e) {
    console.error("[API /leads/leads GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

/**
 * PATCH /api/leads/leads?id=xxx - تحديث حالة عميل
 */
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();
    const { status, stage } = body;

    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

    const updated = await db.lead.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(stage && { stage }),
        ...(status === "won" && { convertedAt: new Date() }),
        ...(status === "contacted" && { lastContactAt: new Date() }),
      },
    });

    return NextResponse.json({ lead: updated });
  } catch (e) {
    console.error("[API /leads/leads PATCH] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
