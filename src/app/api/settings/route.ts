import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/settings - كل الإعدادات
 * PUT /api/settings - تحديث الإعدادات (كائن key->value)
 *
 * حماية الأسرار (نتيجة التدقيق الأمني):
 * - القيم الحساسة (مفاتيح API والتوكنات) تُرجَع فقط عندما يأتي الطلب من
 *   هذا الجهاز (localhost) — أي طلب خارجي يحصل على قيمة فارغة لها.
 * - المعلومات العامة (اسم المالك، البريد، الهاتف، عناوين الدفع، روابط
 *   المتجر) تبقى مقروءة للجميع لأن الواجهة تعتمدها لعرضها للزوار.
 * - الكتابة (PUT) محصورة محلياً: لا يوجد نظام مصادقة في التطبيق بعد،
 *   فسماح أي زائر بتعديل الإعدادات يعني تسريب المفاتيح وتعطيلها.
 */

const SECRET_KEY_RE = /(_KEY|_TOKEN|_SECRET|_PASSWORD|ANON)/i;

function isLocalRequest(req: Request): boolean {
  const host = (req.headers.get("host") || "")
    .split(":")[0]
    .toLowerCase()
    .replace(/^\[|\]$/g, "");
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

export async function GET(req: Request) {
  try {
    const local = isLocalRequest(req);
    const settings = await db.setting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = !local && SECRET_KEY_RE.test(s.key) ? "" : s.value;
    });
    return NextResponse.json({ settings: map });
  } catch (e) {
    console.error("[API /settings GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!isLocalRequest(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as Record<string, string>;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const results: { key: string; ok: boolean }[] = [];

    for (const [key, value] of Object.entries(body)) {
      const existing = await db.setting.findUnique({ where: { key } });
      if (existing) {
        await db.setting.update({ where: { key }, data: { value } });
      } else {
        await db.setting.create({ data: { key, value } });
      }
      results.push({ key, ok: true });
    }

    return NextResponse.json({ updated: results });
  } catch (e) {
    console.error("[API /settings PUT] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
