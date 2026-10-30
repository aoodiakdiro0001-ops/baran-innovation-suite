import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/data/datasets - قائمة مصادر البيانات
 * POST /api/data/datasets - إضافة مصدر بيانات جديد
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const limit = Number(searchParams.get("limit") || "30");

    const where: { status?: string; source?: string } = {};
    if (status) where.status = status;
    if (source) where.source = source;

    const datasets = await db.dataset.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
      take: limit,
      include: {
        pipelines: { select: { id: true, type: true, status: true, durationMs: true, operations: true } },
        insights: { select: { id: true, type: true, title: true, severity: true, confidence: true } },
      },
    });

    return NextResponse.json({ datasets });
  } catch (e) {
    console.error("[API /data/datasets GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, source = "csv", fileName, rowCount, columnCount, sizeBytes, schema } = body;

    if (!name) {
      return NextResponse.json({ error: "name_required" }, { status: 400 });
    }

    // محاكاة quality score و missing values
    const qualityScore = Math.floor(Math.random() * 30) + 65;
    const missingValues = Math.floor((rowCount || 1000) * 0.05);
    const duplicates = Math.floor((rowCount || 1000) * 0.01);

    const dataset = await db.dataset.create({
      data: {
        name,
        source,
        fileName,
        rowCount: rowCount || 1000,
        columnCount: columnCount || 8,
        sizeBytes: sizeBytes || 500000,
        schema: schema || JSON.stringify([{ name: "id", type: "int" }]),
        qualityScore,
        missingValues,
        duplicates,
        status: "raw",
      },
    });

    // محاكاة بدء ETL pipeline تلقائياً
    setTimeout(async () => {
      try {
        await db.dataset.update({
          where: { id: dataset.id },
          data: { status: "processing" },
        });
        await db.pipeline.create({
          data: {
            datasetId: dataset.id,
            type: "etl",
            status: "running",
            startedAt: new Date(),
          },
        });
      } catch {}
    }, 1000);

    return NextResponse.json({
      dataset,
      message: "تمت إضافة مصدر البيانات وبدأ ETL Pipeline تلقائياً",
    });
  } catch (e) {
    console.error("[API /data/datasets POST] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
