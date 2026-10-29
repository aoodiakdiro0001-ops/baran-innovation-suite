import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/scans - قائمة جميع الفحوصات
 * POST /api/scans - إنشاء فحص جديد (يدوياً)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const scanType = searchParams.get("scanType");
    const limit = Number(searchParams.get("limit") || "50");

    const where: {
      status?: string;
      scanType?: string;
    } = {};
    if (status) where.status = status;
    if (scanType) where.scanType = scanType;

    const scans = await db.scan.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: limit,
      include: { vulnerabilities: { select: { id: true, severity: true, status: true } } },
    });

    return NextResponse.json({ scans });
  } catch (e) {
    console.error("[API /scans GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { target, scanType = "full", triggeredBy = "manual" } = body;

    if (!target) {
      return NextResponse.json({ error: "target_required" }, { status: 400 });
    }

    const scan = await db.scan.create({
      data: {
        target,
        scanType,
        status: "pending",
        triggeredBy,
      },
    });

    // محاكاة بدء الفحص
    setTimeout(async () => {
      try {
        await db.scan.update({
          where: { id: scan.id },
          data: {
            status: "running",
            startedAt: new Date(),
          },
        });
      } catch {}
    }, 500);

    return NextResponse.json({ scan, message: "تم إنشاء الفحص وسيبدأ تنفيذه قريباً" });
  } catch (e) {
    console.error("[API /scans POST] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
