import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/sales/knowledge-base
 * قائمة عناصر قاعدة المعرفة (الكتالوج + الأسئلة + السياسات + التسعير)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: { category?: string; active?: boolean } = { active: true };
    if (category) where.category = category;

    const items = await db.knowledgeBase.findMany({
      where,
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });

    return NextResponse.json({
      items: items.map((kb) => ({
        id: kb.id,
        title: kb.title,
        category: kb.category,
        content: kb.content,
        tags: kb.tags,
        price: kb.price,
        currency: kb.currency,
        sku: kb.sku,
        stock: kb.stock,
        imageUrl: kb.imageUrl,
        searchCount: kb.searchCount,
        lastUsedAt: kb.lastUsedAt,
        active: kb.active,
        createdAt: kb.createdAt,
      })),
      categories: Array.from(new Set(items.map((i) => i.category))),
    });
  } catch (e) {
    console.error("[API /sales/knowledge-base GET] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
