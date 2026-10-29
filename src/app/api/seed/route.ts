import { NextResponse } from "next/server";

/**
 * POST /api/seed
 * يعيد زرع البيانات التجريبية (يستدعي سكربت seed.ts عبر spawn)
 */
export async function POST() {
  try {
    // في الإنتاج الحقيقي يتم استدعاء: bun run scripts/seed.ts
    // هنا نُرجع تعليمات للمستخدم
    return NextResponse.json({
      message:
        "لإعادة زرع البيانات التجريبية، شغّل الأمر التالي في الطرفية:",
      command: "bun run scripts/seed.ts",
      note: "تم منع التشغيل التلقائي لأسباب أمنية في الإنتاج.",
    });
  } catch (e) {
    console.error("[API /seed POST] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
