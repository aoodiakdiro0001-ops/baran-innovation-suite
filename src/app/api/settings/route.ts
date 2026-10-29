import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/settings - كل الإعدادات
 * PUT /api/settings - تحديث الإعدادات (كائن key->value)
 */
export async function GET() {
  try {
    const settings = await db.setting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));
    return NextResponse.json({ settings: map });
  } catch (e) {
    console.error("[API /settings GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
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
