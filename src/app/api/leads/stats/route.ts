import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/leads/stats
 * يُرجع إحصائيات Lead-Sniper ZeroBaran
 */
export async function GET() {
  try {
    const leads = await db.lead.findMany({
      orderBy: { discoveredAt: "desc" },
    });
    const outreaches = await db.outreach.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const campaigns = await db.campaign.findMany();
    const dailyStats = await db.leadDailyStat.findMany({
      orderBy: { date: "asc" },
      take: 14,
    });

    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === "new").length;
    const contactedLeads = leads.filter((l) => l.status === "contacted").length;
    const interestedLeads = leads.filter((l) => l.status === "interested").length;
    const wonLeads = leads.filter((l) => l.status === "won").length;
    const lostLeads = leads.filter((l) => l.status === "lost").length;

    const totalOutreaches = outreaches.length;
    const approvedOutreaches = outreaches.filter((o) => o.status === "approved").length;
    const sentOutreaches = outreaches.filter((o) => o.status === "sent").length;
    const repliedOutreaches = outreaches.filter((o) => o.status === "replied").length;
    const draftOutreaches = outreaches.filter((o) => o.status === "draft").length;

    // متوسط التخصيص
    const avgPersonalization =
      outreaches.length > 0
        ? Math.round(outreaches.reduce((s, o) => s + o.personalizationScore, 0) / outreaches.length)
        : 0;

    // متوسط النقاط
    const avgScore =
      leads.length > 0
        ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length)
        : 0;

    // إجمالي التوفير والإيرادات
    const totalCostSaved = outreaches.reduce((s, o) => s + o.costSavedUsd, 0);
    const totalRevenue = leads
      .filter((l) => l.status === "won")
      .reduce((s, l) => s + (l.budget ? parseInt(l.budget.replace(/[^0-9]/g, "").slice(0, 6) || "0") : 0), 0);

    // معدل التحويل (won / totalLeads)
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 1000) / 10 : 0;

    // معدل الاستجابة (replies / sent)
    const replyRate = sentOutreaches > 0 ? Math.round((repliedOutreaches / sentOutreaches) * 100) : 0;

    // توزيع حسب الصناعة
    const industryCounts: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.industry) industryCounts[l.industry] = (industryCounts[l.industry] || 0) + 1;
    });

    // توزيع حسب المرحلة
    const stageCounts: Record<string, number> = {};
    leads.forEach((l) => {
      stageCounts[l.stage] = (stageCounts[l.stage] || 0) + 1;
    });

    return NextResponse.json({
      overview: {
        totalLeads,
        newLeads,
        contactedLeads,
        interestedLeads,
        wonLeads,
        lostLeads,
        totalOutreaches,
        approvedOutreaches,
        sentOutreaches,
        repliedOutreaches,
        draftOutreaches,
        avgPersonalization,
        avgScore,
        totalCostSaved: Math.round(totalCostSaved * 100) / 100,
        totalRevenue,
        conversionRate,
        replyRate,
        activeCampaigns: campaigns.filter((c) => c.status === "active").length,
        totalCampaigns: campaigns.length,
      },
      industryCounts,
      stageCounts,
      dailyStats: dailyStats.map((d) => ({
        date: d.date,
        leads: d.leadsDiscovered,
        outreaches: d.outreachesGenerated,
        approved: d.outreachesApproved,
        sent: d.outreachesSent,
        replies: d.repliesReceived,
        won: d.dealsWon,
        revenue: d.totalRevenueUsd,
        costSaved: d.totalCostSavedUsd,
      })),
      recentLeads: leads.slice(0, 6),
      topCampaigns: campaigns.slice(0, 5),
    });
  } catch (e) {
    console.error("[API /leads/stats] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
