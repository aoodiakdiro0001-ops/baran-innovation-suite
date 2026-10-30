import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/leads/campaigns - قائمة الحملات
 * POST /api/leads/campaigns - إنشاء حملة جديدة
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: { status?: string } = {};
    if (status) where.status = status;

    const campaigns = await db.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (e) {
    console.error("[API /leads/campaigns GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, targetIndustry, targetLocation, targetCompanySize, serviceOffered, value } = body;

    if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });

    const campaign = await db.campaign.create({
      data: {
        name,
        description: description || null,
        targetIndustry: targetIndustry || null,
        targetLocation: targetLocation || null,
        targetCompanySize: targetCompanySize || null,
        serviceOffered: serviceOffered || null,
        value: value || 0,
        status: "active",
        crontab: "0 9 * * 1-5",
      },
    });

    return NextResponse.json({
      campaign,
      message: `تم إنشاء حملة "${name}". سيبدأ البحث التلقائي عن العملاء مطابقاً للمعايير.`,
    });
  } catch (e) {
    console.error("[API /leads/campaigns POST] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
