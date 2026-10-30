import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/leads/outreaches - قائمة رسائل التواصل
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const leadId = searchParams.get("leadId");
    const limit = Number(searchParams.get("limit") || "30");

    const where: { status?: string; leadId?: string } = {};
    if (status) where.status = status;
    if (leadId) where.leadId = leadId;

    const outreaches = await db.outreach.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { lead: { select: { name: true, company: true, email: true, industry: true, score: true } } },
    });

    return NextResponse.json({ outreaches });
  } catch (e) {
    console.error("[API /leads/outreaches GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

/**
 * PATCH /api/leads/outreaches?id=xxx - تحديث حالة outreach (موافقة/إرسال)
 */
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();
    const { status } = body;

    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });

    const updated = await db.outreach.update({
      where: { id },
      data: {
        status,
        approved: status === "approved" || status === "sent",
        approvedAt: status === "approved" || status === "sent" ? new Date() : null,
        sentAt: status === "sent" ? new Date() : null,
      },
    });

    return NextResponse.json({ outreach: updated });
  } catch (e) {
    console.error("[API /leads/outreaches PATCH] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
