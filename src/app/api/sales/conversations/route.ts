import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/sales/conversations
 * قائمة المحادثات مع الرسائل الكاملة (للعرض في الواجهة)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const channel = searchParams.get("channel");
    const limit = Number(searchParams.get("limit") || "30");

    const where: { status?: string; channel?: string } = {};
    if (status) where.status = status;
    if (channel) where.channel = channel;

    const conversations = await db.conversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      take: limit,
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({
      conversations: conversations.map((c) => ({
        id: c.id,
        channel: c.channel,
        customerName: c.customerName,
        customerEmail: c.customerEmail,
        customerPhone: c.customerPhone,
        subject: c.subject,
        status: c.status,
        intent: c.intent,
        sentiment: c.sentiment,
        satisfactionScore: c.satisfactionScore,
        productInterest: c.productInterest,
        leadScore: c.leadScore,
        escalated: c.escalated,
        escalatedAt: c.escalatedAt,
        closedAt: c.closedAt,
        totalMessages: c.totalMessages,
        aiHandled: c.aiHandled,
        responseTimeMs: c.responseTimeMs,
        conversionValue: c.conversionValue,
        converted: c.converted,
        startedAt: c.startedAt,
        lastMessageAt: c.lastMessageAt,
        messages: c.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          type: m.type,
          aiModel: m.aiModel,
          ragSources: m.ragSources,
          sentiment: m.sentiment,
          confidence: m.confidence,
          createdAt: m.createdAt,
        })),
      })),
    });
  } catch (e) {
    console.error("[API /sales/conversations GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
