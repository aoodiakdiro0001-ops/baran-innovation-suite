import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/pixel/upload
 * يقبل بيانات صورة مرفوعة (file metadata فقط — لا يخزن ملف فعلي)
 * يُنشئ سجل ImageJob جديد ويحاكي بدء المعالجة
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, fileSize, width, height, processType = "full", backgroundStyle = "studio" } = body;

    if (!fileName || !fileSize) {
      return NextResponse.json({ error: "fileName_and_fileSize_required" }, { status: 400 });
    }

    const expectedSavings =
      processType === "rembg" ? 25 : processType === "relight" ? 50 : processType === "composite" ? 80 : 65;

    const job = await db.imageJob.create({
      data: {
        source: "web",
        originalUrl: `/uploads/${fileName}`,
        fileName,
        fileSize,
        width: width || null,
        height: height || null,
        processType,
        backgroundStyle,
        status: "processing",
        triggeredBy: "web",
        costSavedUsd: expectedSavings,
      },
    });

    // محاكاة المعالجة
    const processingMs = 3000 + Math.floor(Math.random() * 5000);
    setTimeout(async () => {
      try {
        const resultFileName = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, "") + "_processed.png";
        await db.imageJob.update({
          where: { id: job.id },
          data: {
            status: "completed",
            finishedAt: new Date(),
            processingTimeMs: processingMs,
            resultUrl: `/results/${resultFileName}`,
            resultSize: Math.floor(fileSize * 1.2),
          },
        });
      } catch {}
    }, processingMs);

    return NextResponse.json({
      jobId: job.id,
      status: "processing",
      estimatedProcessingMs: processingMs,
      estimatedSavingsUsd: expectedSavings,
      message: "تم استلام الصورة! المعالجة بدأت. النتيجة ستظهر في معرض النتائج.",
    });
  } catch (e) {
    console.error("[API /pixel/upload] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
