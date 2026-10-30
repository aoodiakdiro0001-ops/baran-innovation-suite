import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/sales/stats
 * يُرجع إحصائيات Omni-Sales ZeroBaran (الوكيل التجاري الذاتي)
 */
export async function GET() {
  try {
    const conversations = await db.conversation.findMany({
      orderBy: { lastMessageAt: "desc" },
      include: { messages: { select: { id: true, role: true, createdAt: true } } },
    });
    const messages = await db.chatMessage.findMany({ orderBy: { createdAt: "desc" } });
    const kbItems = await db.knowledgeBase.findMany();
    const dailyStats = await db.salesDailyStat.findMany({
      orderBy: { date: "asc" },
      take: 14,
    });

    const totalConversations = conversations.length;
    const activeConversations = conversations.filter((c) => c.status === "active").length;
    const aiHandled = conversations.filter((c) => c.aiHandled).length;
    const humanEscalated = conversations.filter((c) => c.escalated).length;
    const converted = conversations.filter((c) => c.converted).length;
    const totalRevenue = conversations.reduce((s, c) => s + (c.conversionValue || 0), 0);
    const satisfied = conversations.filter((c) => c.satisfactionScore > 0);
    const avgSatisfaction =
      satisfied.length > 0
        ? Math.round((satisfied.reduce((s, c) => s + c.satisfactionScore, 0) / satisfied.length) * 10) / 10
        : 0;
    const withResponse = conversations.filter((c) => c.responseTimeMs > 0);
    const avgResponseMs =
      withResponse.length > 0
        ? Math.round(withResponse.reduce((s, c) => s + c.responseTimeMs, 0) / withResponse.length)
        : 0;
    const totalMessages = messages.length;
    const kbItemsCount = kbItems.length;

    // توزيع القنوات
    const channelCounts: Record<string, number> = {};
    conversations.forEach((c) => {
      channelCounts[c.channel] = (channelCounts[c.channel] || 0) + 1;
    });

    // توزيع النية
    const intentCounts: Record<string, number> = {};
    conversations.forEach((c) => {
      if (c.intent) intentCounts[c.intent] = (intentCounts[c.intent] || 0) + 1;
    });

    return NextResponse.json({
      overview: {
        totalConversations,
        activeConversations,
        aiHandled,
        humanEscalated,
        converted,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        avgSatisfaction,
        avgResponseMs,
        totalMessages,
        kbItemsCount,
      },
      dailyStats: dailyStats.map((d) => ({
        date: d.date,
        totalConversations: d.totalConversations,
        aiHandled: d.aiHandled,
        humanEscalated: d.humanEscalated,
        resolvedConvos: d.resolvedConvos,
        converted: d.converted,
        totalRevenue: d.totalRevenueUsd,
        avgSatisfaction: d.avgSatisfaction,
        avgResponseMs: d.avgResponseMs,
        totalMessages: d.totalMessages,
        costSaved: d.costSavedUsd,
      })),
      channelCounts,
      intentCounts,
      recentConversations: conversations.slice(0, 6).map((c) => ({
        id: c.id,
        customerName: c.customerName,
        channel: c.channel,
        status: c.status,
        intent: c.intent,
        sentiment: c.sentiment,
        leadScore: c.leadScore,
        satisfactionScore: c.satisfactionScore,
        productInterest: c.productInterest,
        conversionValue: c.conversionValue,
        converted: c.converted,
        totalMessages: c.totalMessages,
        lastMessageAt: c.lastMessageAt,
      })),
    });
  } catch (e) {
    console.error("[API /sales/stats] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
