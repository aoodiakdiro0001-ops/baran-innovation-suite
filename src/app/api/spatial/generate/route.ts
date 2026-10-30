import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/spatial/generate
 * ينشئ مهمة توليد مجسم ثلاثي الأبعاد جديد
 *
 * يأخذ: prompt, inputType (text/image), modelSource, category, format
 * يُنشئ سجل Asset3D بحالة "generating" ويحاكي المعالجة
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt,
      inputType = "text",
      inputUrl,
      modelSource = "TripoSR",
      category = "generic",
      format = "glb",
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: "prompt_required" }, { status: 400 });
    }

    // محاكاة الأرقام الأولية قبل المعالجة
    const originalPolyCount = Math.floor(Math.random() * 200000) + 30000;

    const asset = await db.asset3D.create({
      data: {
        name: prompt.substring(0, 50),
        prompt,
        inputType,
        inputUrl: inputType === "image" ? inputUrl : null,
        modelSource,
        format,
        originalPolyCount,
        polygonCount: originalPolyCount,
        status: "generating",
      },
    });

    // محاكاة المعالجة عبر TripoSR + Blender
    const processingMs = 6000 + Math.floor(Math.random() * 12000);
    setTimeout(async () => {
      try {
        // محاكاة Decimation
        const finalPolyCount = Math.floor(originalPolyCount * (0.1 + Math.random() * 0.15));
        const finalSize = Math.floor(originalPolyCount * 18);
        const costSaved = 80 + Math.floor(Math.random() * 250);
        const slug = prompt.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "_").substring(0, 40);
        const fileName = `${slug}.${format}`;
        const failed = Math.random() < 0.1; // 10% احتمال فشل

        if (failed) {
          await db.asset3D.update({
            where: { id: asset.id },
            data: {
              status: "failed",
              finishedAt: new Date(),
              errorMessage: "HuggingFace Inference API timeout — سيتم إعادة المحاولة تلقائياً",
            },
          });
        } else {
          const updated = await db.asset3D.update({
            where: { id: asset.id },
            data: {
              status: "ready",
              finishedAt: new Date(),
              processingMs,
              polygonCount: finalPolyCount,
              fileSizeBytes: finalSize,
              downloadUrl: `/assets/${fileName}`,
              previewGifUrl: `/assets/${slug}_preview.gif`,
              rating: 3 + Math.floor(Math.random() * 3),
              costSavedUsd: costSaved,
              hasUVMap: true,
              hasTextures: true,
            },
          });

          // إنشاء 3 إصدارات
          await db.assetVersion.create({
            data: {
              assetId: asset.id,
              version: 1,
              format: "obj",
              fileSizeBytes: originalPolyCount * 32,
              polygonCount: originalPolyCount,
              processingType: "raw",
            },
          });
          await db.assetVersion.create({
            data: {
              assetId: asset.id,
              version: 2,
              format: "obj",
              fileSizeBytes: Math.floor(originalPolyCount * 18),
              polygonCount: Math.floor(originalPolyCount * 0.7),
              processingType: "cleaned",
            },
          });
          await db.assetVersion.create({
            data: {
              assetId: asset.id,
              version: 3,
              format,
              fileSizeBytes: finalSize,
              polygonCount: finalPolyCount,
              downloadUrl: updated.downloadUrl,
              processingType: "decimated",
            },
          });
        }
      } catch {}
    }, 1500); // ابدأ بـ 1.5s محاكاة (في الإنتاج 6-18 ثانية)

    return NextResponse.json({
      asset,
      message: "🚀 بدأ التوليد! المجسم سيكون جاهزاً خلال 6-18 ثانية.",
      estimatedTimeMs: processingMs,
    });
  } catch (e) {
    console.error("[API /spatial/generate] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
