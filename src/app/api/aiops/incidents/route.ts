import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/aiops/incidents
 * قائمة الحوادث مرتّبة حسب الشدة (desc) ثم تاريخ البدء (desc).
 * يدعم فلتر الحالة والشدة:
 *   ?status=open|investigating|diagnosed|healing|resolved|failed
 *   ?severity=critical|high|medium|low
 * يضم اسم الخدمة + الإصلاحات (remediations).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const limit = Number(searchParams.get("limit") || "30");

    const where: { status?: string; severity?: string } = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const incidents = await db.incident.findMany({
      where,
      orderBy: [{ severity: "desc" }, { startedAt: "desc" }],
      take: limit,
      include: {
        service: { select: { id: true, name: true, type: true, priority: true } },
        remediations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({
      incidents: incidents.map((i) => ({
        id: i.id,
        serviceId: i.serviceId,
        serviceName: i.service?.name || "—",
        serviceType: i.service?.type || "—",
        servicePriority: i.service?.priority || "normal",
        severity: i.severity,
        status: i.status,
        type: i.type,
        title: i.title,
        description: i.description,
        logs: i.logs,
        rootCause: i.rootCause,
        startedAt: i.startedAt,
        detectedAt: i.detectedAt,
        diagnosedAt: i.diagnosedAt,
        healedAt: i.healedAt,
        resolvedAt: i.resolvedAt,
        durationSec: i.durationSec,
        affectedUsers: i.affectedUsers,
        costImpactUsd: i.costImpactUsd,
        remediations: i.remediations,
      })),
    });
  } catch (e) {
    console.error("[API /aiops/incidents GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
