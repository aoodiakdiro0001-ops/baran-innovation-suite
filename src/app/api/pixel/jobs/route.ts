import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/pixel/jobs - قائمة مهام معالجة الصور
 * POST /api/pixel/jobs - إنشاء مهمة معالجة جديدة (محاكاة)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const limit = Number(searchParams.get("limit") || "50");

    const where: {
      status?: string;
      source?: string;
    } = {};
    if (status) where.status = status;
    if (source) where.source = source;

    const jobs = await db.imageJob.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ jobs });
  } catch (e) {
    console.error("[API /pixel/jobs GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fileName,
      fileSize,
      width,
      height,
      processType = "full",
      backgroundStyle = "studio",
      source = "web",
    } = body;

    if (!fileName) {
      return NextResponse.json({ error: "fileName_required" }, { status: 400 });
    }

    // تقدير التوفير المتوقع (متوسط الاستوديو = $65)
    const expectedSavings =
      processType === "rembg" ? 25 : processType === "relight" ? 50 : processType === "composite" ? 80 : 65;

    const job = await db.imageJob.create({
      data: {
        source,
        originalUrl: `/uploads/${fileName}`,
        fileName,
        fileSize: fileSize || 0,
        width: width || null,
        height: height || null,
        processType,
        backgroundStyle,
        status: "processing",
        triggeredBy: source,
        costSavedUsd: expectedSavings,
      },
    });

    // محاكاة اكتمال المعالجة بعد 3-8 ثوان
    const processingMs = 3000 + Math.floor(Math.random() * 5000);
    setTimeout(async () => {
      try {
        const resultFileName = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, "") + "_processed.png";
        const resultUrl = `/results/${resultFileName}`;
        await db.imageJob.update({
          where: { id: job.id },
          data: {
            status: "completed",
            finishedAt: new Date(),
            processingTimeMs: processingMs,
            resultUrl,
            resultSize: Math.floor((fileSize || 1500000) * 1.2),
          },
        });
      } catch {}
    }, processingMs);

    return NextResponse.json({
      job,
      message: "تم استلام الصورة وبدأت المعالجة. النتيجة ستظهر خلال ثوانٍ.",
      estimatedProcessingMs: processingMs,
    });
  } catch (e) {
    console.error("[API /pixel/jobs POST] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
