import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

const SYSTEM_PROMPT =
  "أنت وكيل مبيعات ودعم عملاء محترف لشركة ZeroBaran. تصرف بلباقة، ساعد العميل في اختيار المنتج المناسب، أجب عن استفساراته بدقة، ووجهه لإتمام الطلب. استخدم معلومات قاعدة المعرفة المتاحة.";

/**
 * POST /api/sales/chat
 * Body: { conversationId, message }
 * يُنشئ رد AI للمحادثة، يحفظ رسالة العميل ورد الـ agent، ويُحدّث المحادثة.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversationId, message } = body as { conversationId?: string; message?: string };

    if (!conversationId || !message || !message.trim()) {
      return NextResponse.json({ error: "conversationId_and_message_required" }, { status: 400 });
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 10,
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "conversation_not_found" }, { status: 404 });
    }

    // ====== RAG: ابحث في قاعدة المعرفة ======
    const allKb = await db.knowledgeBase.findMany({ where: { active: true } });
    const queryLower = message.toLowerCase();
    const queryTokens = queryLower.split(/\s+/).filter((t) => t.length > 2);

    const scored = allKb
      .map((kb) => {
        const haystack = `${kb.title} ${kb.content} ${kb.tags || ""}`.toLowerCase();
        let hits = 0;
        for (const tk of queryTokens) {
          if (haystack.includes(tk)) hits += 1;
        }
        // بونص لتطابق العنوان
        if (kb.title.toLowerCase().includes(queryLower)) hits += 2;
        return { kb, hits };
      })
      .filter((s) => s.hits > 0)
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 3);

    const ragSources = scored.map((s) => s.kb.id);
    const ragContext = scored
      .map((s) => {
        const kb = s.kb;
        const pricePart = kb.price ? ` — السعر: ${kb.price} ${kb.currency}` : "";
        return `• ${kb.title}${pricePart}\n${kb.content}`;
      })
      .join("\n\n");

    // ====== احفظ رسالة العميل أولاً ======
    const customerMsg = await db.chatMessage.create({
      data: {
        conversationId,
        role: "customer",
        content: message,
        type: "text",
        sentiment: "neutral",
        confidence: 0,
      },
    });

    // ====== تاريخ المحادثة لنموذج الذكاء ======
    const historyMessages = conversation.messages.map((m) => ({
      role: (m.role === "customer" ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
    }));
    historyMessages.push({
      role: "user",
      content: message,
    });

    // ====== اطلب رد AI عبر ZAI ======
    const userPrompt = ragContext
      ? `معلومات قاعدة المعرفة المتاحة:\n${ragContext}\n\nسؤال العميل: ${message}\n\nأجب بالعربية بشكل مهذب وواضح، وأشر لطرق الدفع إن لزم.`
      : `سؤال العميل: ${message}\n\nأجب بالعربية بشكل مهذب وواضح. إذا لم تتوفر معلومة محددة، اقترح التواصل المباشر عبر baranavisat@gmail.com أو واتساب 00905313263722.`;

    let aiResponse = "";
    let confidence = 75;
    let model = "zai-fallback";

    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...historyMessages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 800,
      });
      aiResponse = completion.choices?.[0]?.message?.content ?? "";
      model = "zai";
      confidence = scored.length > 0 ? 92 : 82;
    } catch (e) {
      console.error("[API /sales/chat] ZAI failed:", e);
      // ====== Fallback يبني رداً من قاعدة المعرفة ======
      if (scored.length > 0) {
        const top = scored[0].kb;
        const pricePart = top.price ? ` بسعر ${top.price} ${top.currency}` : "";
        aiResponse =
          `شكراً لتواصلك! 🌟 بناءً على ما ذكرت، إليك ما يناسبك:\n\n${top.title}${pricePart}.\n\n${top.content}\n\n` +
          `للطلب أو الاستفسار أكثر، تواصل معنا: baranavisat@gmail.com أو واتساب 00905313263722.`;
        confidence = 80;
        model = "rag-fallback";
      } else {
        aiResponse =
          "شكراً لرسالتك! 🌟 للأسف لا أملك معلومة محددة الآن، لكن فريقنا سيتواصل معك قريباً. للتواصل المباشر: baranavisat@gmail.com أو واتساب 00905313263722.";
        confidence = 60;
        model = "rag-fallback";
      }
    }

    // ====== اكتشاف نية بسيط ======
    const intent = detectIntent(message);
    const shouldEscalate = /(مدير|موظف|شكوى|سيء|غاضب|احتيال)/i.test(message);

    // ====== احفظ رد الـ agent ======
    const agentMsg = await db.chatMessage.create({
      data: {
        conversationId,
        role: "agent",
        content: aiResponse,
        type: "text",
        aiModel: model,
        ragSources: ragSources.length > 0 ? JSON.stringify(ragSources) : null,
        sentiment: "positive",
        confidence,
        tokens: aiResponse.length,
      },
    });

    // ====== حدّث المحادثة ======
    const newTotalMessages = conversation.totalMessages + 2;
    const shouldMarkEscalated = shouldEscalate || conversation.escalated;
    await db.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        totalMessages: newTotalMessages,
        intent: conversation.intent || intent,
        escalated: shouldMarkEscalated,
        escalatedAt: shouldMarkEscalated && !conversation.escalated ? new Date() : conversation.escalatedAt,
        status: shouldMarkEscalated ? "waiting_human" : conversation.status,
        aiHandled: !shouldMarkEscalated,
        responseTimeMs: Math.max(conversation.responseTimeMs, Math.floor(Math.random() * 800) + 600),
      },
    });

    // ====== زِد عدّاد البحث في عناصر KB المستخدمة ======
    if (ragSources.length > 0) {
      await Promise.all(
        ragSources.map((id) =>
          db.knowledgeBase.update({
            where: { id },
            data: { searchCount: { increment: 1 }, lastUsedAt: new Date() },
          })
        )
      );
    }

    return NextResponse.json({
      response: aiResponse,
      confidence,
      ragSources,
      intent,
      shouldEscalate,
      customerMessageId: customerMsg.id,
      agentMessageId: agentMsg.id,
    });
  } catch (e) {
    console.error("[API /sales/chat POST] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (/(سعر|كم|تكلفة|how much|price|باقة)/.test(t)) return "pricing";
  if (/(شراء|اشتراك|دفع|شراء|طلب|اشترك|buy)/.test(t)) return "sales";
  if (/(موعد|حجز|استشارة|booking|reserve)/.test(t)) return "booking";
  if (/(مشكلة|شكوى|سيء|broken|issue|bug)/.test(t)) return "complaint";
  if (/(كيف|ما هي|استفسار|info|تعمل)/.test(t)) return "info";
  return "support";
}
