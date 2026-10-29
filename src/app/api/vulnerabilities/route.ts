import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/vulnerabilities - قائمة الثغرات
 * PATCH /api/vulnerabilities?id=xxx - تحديث حالة ثغرة
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const scanId = searchParams.get("scanId");
    const limit = Number(searchParams.get("limit") || "50");

    const where: {
      severity?: string;
      status?: string;
      scanId?: string;
    } = {};
    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (scanId) where.scanId = scanId;

    const vulns = await db.vulnerability.findMany({
      where,
      orderBy: [
        { severity: "desc" },
        { detectedAt: "desc" },
      ],
      take: limit,
      include: { scan: { select: { target: true, scanType: true, startedAt: true } } },
    });

    return NextResponse.json({ vulnerabilities: vulns });
  } catch (e) {
    console.error("[API /vulnerabilities GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();
    const { status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id_and_status_required" }, { status: 400 });
    }

    const updated = await db.vulnerability.update({
      where: { id },
      data: {
        status,
        fixedAt: status === "fixed" ? new Date() : null,
      },
    });

    return NextResponse.json({ vulnerability: updated });
  } catch (e) {
    console.error("[API /vulnerabilities PATCH] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
