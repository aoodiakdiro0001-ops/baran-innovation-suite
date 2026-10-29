import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/alerts - سجل التنبيهات
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || "30");
    const channel = searchParams.get("channel");

    const where: { channel?: string } = {};
    if (channel) where.channel = channel;

    const alerts = await db.alertLog.findMany({
      where,
      orderBy: { sentAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ alerts });
  } catch (e) {
    console.error("[API /alerts GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

/**
 * POST /api/alerts - إرسال تنبيه تجريبي عبر Telegram
 * في الإنتاج، يستخدم Bot Token من الإعدادات
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, body: msgBody, channel = "telegram" } = body;

    if (!subject || !msgBody) {
      return NextResponse.json({ error: "subject_and_body_required" }, { status: 400 });
    }

    // محاكاة إرسال تنبيه عبر Telegram
    const settings = await db.setting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));

    let telegramResponse: Record<string, unknown> = { simulated: true };

    if (map.TELEGRAM_BOT_TOKEN && map.TELEGRAM_CHAT_ID) {
      try {
        const text = `${subject}\n\n${msgBody}`;
        const url = `https://api.telegram.org/bot${map.TELEGRAM_BOT_TOKEN}/sendMessage`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: map.TELEGRAM_CHAT_ID,
            text,
            parse_mode: "Markdown",
          }),
        });
        telegramResponse = await res.json();
      } catch (e) {
        telegramResponse = { error: e instanceof Error ? e.message : "telegram_failed" };
      }
    }

    const alert = await db.alertLog.create({
      data: {
        channel,
        recipient: map.TELEGRAM_CHAT_ID || "@demo",
        subject,
        body: msgBody,
        status: "sent",
      },
    });

    return NextResponse.json({ alert, telegram: telegramResponse });
  } catch (e) {
    console.error("[API /alerts POST] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
