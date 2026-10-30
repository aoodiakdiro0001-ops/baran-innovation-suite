import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/data/upload
 * يقبل بيانات ملف مرفوع (metadata فقط) وينشئ سجل Dataset
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, fileSize, source = "csv", schema } = body;

    if (!fileName || !fileSize) {
      return NextResponse.json({ error: "fileName_and_fileSize_required" }, { status: 400 });
    }

    // تقدير عدد الصفوف بناء على الحجم (متوسط 200 bytes/row)
    const estimatedRows = Math.floor(fileSize / 200);
    const estimatedCols = schema ? JSON.parse(schema).length : 8;

    const dataset = await db.dataset.create({
      data: {
        name: fileName.replace(/\.(csv|json|sql|xml|txt)$/i, ""),
        source,
        fileName,
        rowCount: estimatedRows,
        columnCount: estimatedCols,
        sizeBytes: fileSize,
        schema: schema || JSON.stringify([{ name: "auto_detected", type: "string" }]),
        qualityScore: Math.floor(Math.random() * 25) + 70,
        missingValues: Math.floor(estimatedRows * 0.04),
        duplicates: Math.floor(estimatedRows * 0.015),
        status: "raw",
      },
    });

    // محاكاة بدء ETL
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
    }, 1500);

    return NextResponse.json({
      dataset,
      estimatedRows,
      estimatedCols,
      message: "تم رفع الملف! سيبدأ ETL Pipeline تلقائياً خلال لحظات.",
    });
  } catch (e) {
    console.error("[API /data/upload] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
