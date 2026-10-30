import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/aiops/remediations
 * قائمة إجراءات الإصلاح مرتّبة حسب تاريخ الإنشاء (desc).
 * يدعم فلتر الحالة:
 *   ?status=pending|executing|success|failed|skipped
 * يضم عنوان الحادثة المرتبطة.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const incidentId = searchParams.get("incidentId");
    const limit = Number(searchParams.get("limit") || "30");

    const where: { status?: string; incidentId?: string } = {};
    if (status) where.status = status;
    if (incidentId) where.incidentId = incidentId;

    const remediations = await db.remediation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        incident: { select: { id: true, title: true, severity: true, status: true, type: true } },
      },
    });

    return NextResponse.json({
      remediations: remediations.map((r) => ({
        id: r.id,
        incidentId: r.incidentId,
        incidentTitle: r.incident?.title || "—",
        incidentSeverity: r.incident?.severity || "info",
        incidentStatus: r.incident?.status || "—",
        type: r.type,
        action: r.action,
        aiSuggested: r.aiSuggested,
        aiReasoning: r.aiReasoning,
        status: r.status,
        output: r.output,
        executedAt: r.executedAt,
        durationMs: r.durationMs,
        costSavedUsd: r.costSavedUsd,
        createdAt: r.createdAt,
      })),
    });
  } catch (e) {
    console.error("[API /aiops/remediations GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
