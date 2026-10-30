import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/aiops/services
 * قائمة خدمات مراقَبة مرتّبة حسب الأولوية ثم الاسم.
 * يدعم فلتر الحالة عبر ?status=up|down|degraded
 * يضم عدّاد الحوادث لكل خدمة.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const where: { currentStatus?: string; priority?: string; enabled?: boolean } = {};
    if (status) where.currentStatus = status;
    if (priority) where.priority = priority;

    const services = await db.monitoredService.findMany({
      where,
      orderBy: [{ priority: "asc" }, { name: "asc" }],
      include: {
        incidents: {
          select: { id: true, status: true, severity: true },
        },
      },
    });

    return NextResponse.json({
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        url: s.url,
        port: s.port,
        interval: s.interval,
        timeout: s.timeout,
        expectedCode: s.expectedCode,
        enabled: s.enabled,
        currentStatus: s.currentStatus,
        uptimePct: s.uptimePct,
        lastCheckedAt: s.lastCheckedAt,
        lastDownAt: s.lastDownAt,
        responseTimeMs: s.responseTimeMs,
        region: s.region,
        priority: s.priority,
        tags: s.tags,
        createdAt: s.createdAt,
        incidentsCount: s.incidents.length,
        openIncidents: s.incidents.filter((i) => i.status !== "resolved" && i.status !== "failed").length,
      })),
    });
  } catch (e) {
    console.error("[API /aiops/services GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
