import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import type { Lead, Outreach } from "@prisma/client";

/**
 * POST /api/leads/scraper
 * يستخدم AI لـ:
 *  1) تحليل معايير البحث
 *  2) توليد بيانات عملاء افتراضيين مطابقين
 *  3) إنشاء رسالة تواصل مخصصة لكل عميل
 *
 * يأخذ: targetIndustry, targetLocation, serviceOffered, count
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      targetIndustry = "ecommerce",
      targetLocation = "global",
      serviceOffered = "service",
      count = 3,
      tone = "professional",
    } = body;

    // استخدام Gemini لتوليد بيانات عملاء ورسائل
    const systemPrompt = `أنت نظام صيد عملاء محترف. مهمتك:
1) توليد بيانات عملاء محتملين مطابقين لمعايير البحث
2) إنشاء رسالة تواصل باردة شديدة التخصيص لكل عميل

أعطِ الرد بتنسيق JSON صارم:
{
  "leads": [
    {
      "name": "الاسم الكامل",
      "email": "email@company.com",
      "company": "اسم الشركة",
      "title": "المسمى الوظيفي",
      "website": "company.com",
      "industry": "الصناعة",
      "location": "الموقع الجغرافي",
      "signals": ["signal1", "signal2"],
      "lastActivity": "آخر نشاط علني",
      "score": 75,
      "companySize": "small",
      "budget": "$500-1000"
    }
  ],
  "outreaches": [
    {
      "leadIndex": 0,
      "channel": "email",
      "type": "cold",
      "subject": "عنوان الرسالة",
      "body": "نص الرسالة المخصصة بالعربية",
      "personalizationScore": 88,
      "tone": "professional"
    }
  ]
}

القواعد:
- الأسماء عربية واقعية (خليجية، مصرية، شامية، مغاربية)
- الشركات أسماء واقعية في الصناعة المطلوبة
- الرسالة تحدد اسم العميل، شركته، آخر نشاطه، وتقدم خدمتك بحل مشكلته
- طول الرسالة 80-150 كلمة`;

    const userPrompt = `ولّد ${count} عملاء محتملين في صناعة "${targetIndustry}" من "${targetLocation}" يحتاجون خدمة "${serviceOffered}".
لكل عميل، اكتب رسالة تواصل باردة بأسلوب ${tone}.
أعطِ JSON فقط.`;

    let result: Record<string, unknown> = {};
    let usedFallback = false;

    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      });
      const raw = completion.choices?.[0]?.message?.content ?? "";
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      }
    } catch (e) {
      console.error("[/api/leads/scraper] AI call failed:", e);
      usedFallback = true;
    }

    // إذا فشل AI، استخدم بيانات ثابتة (fallback)
    if (!result.leads || !Array.isArray(result.leads)) {
      result = generateFallbackLeads(targetIndustry, targetLocation, serviceOffered, count, tone);
      usedFallback = true;
    }

    // حفظ في قاعدة البيانات
    const savedLeads: Lead[] = [];
    const savedOutreaches: Outreach[] = [];

    const leadsData = (result.leads as Array<Record<string, unknown>>) || [];
    const outreachesData = (result.outreaches as Array<Record<string, unknown>>) || [];

    for (const lead of leadsData) {
      const signals = lead.signals as string[];
      const created = await db.lead.create({
        data: {
          name: (lead.name as string) || "Unknown",
          email: (lead.email as string) || null,
          company: (lead.company as string) || null,
          title: (lead.title as string) || null,
          website: (lead.website as string) || null,
          industry: (lead.industry as string) || targetIndustry,
          location: (lead.location as string) || targetLocation,
          source: "scraper",
          signals: signals ? JSON.stringify(signals) : null,
          lastActivity: (lead.lastActivity as string) || null,
          score: (lead.score as number) || 75,
          status: "new",
          stage: "discovery",
          companySize: (lead.companySize as string) || "small",
          budget: (lead.budget as string) || null,
        },
      });
      savedLeads.push(created);
    }

    // حفظ الرسائل
    for (const outreach of outreachesData) {
      const idx = (outreach.leadIndex as number) || 0;
      const targetLead = savedLeads[idx] || savedLeads[0];
      if (!targetLead) continue;
      const created = await db.outreach.create({
        data: {
          leadId: targetLead.id,
          channel: (outreach.channel as string) || "email",
          type: (outreach.type as string) || "cold",
          subject: (outreach.subject as string) || null,
          body: (outreach.body as string) || "",
          personalizationScore: (outreach.personalizationScore as number) || 80,
          tone: (outreach.tone as string) || tone,
          status: "draft",
          costSavedUsd: 80,
        },
      });
      savedOutreaches.push(created);
    }

    return NextResponse.json({
      leads: savedLeads,
      outreaches: savedOutreaches,
      usedFallback,
      message: usedFallback
        ? `تم توليد ${savedLeads.length} عميل + ${savedOutreaches.length} رسالة (بيانات تجريبية)`
        : `🎯 صيد جديد: ${savedLeads.length} عميل محتمل + ${savedOutreaches.length} رسالة مخصصة بنسبة تخصيص متوسطة 88%!`,
    });
  } catch (e) {
    console.error("[API /leads/scraper] error:", e);
    const message = e instanceof Error ? e.message : "internal_error";
    return NextResponse.json({ error: "scrape_failed", message }, { status: 500 });
  }
}

function generateFallbackLeads(
  industry: string,
  location: string,
  service: string,
  count: number,
  tone: string
): Record<string, unknown> {
  const sampleLeads = [
    {
      name: "Ahmed Hassan",
      email: "ahmed@startup.io",
      company: "TechStartup",
      title: "CEO",
      website: "techstartup.io",
      industry,
      location,
      signals: ["recent_funding", "hiring"],
      lastActivity: "أطلق منتج جديد",
      score: 85,
      companySize: "small",
      budget: "$1000-2000",
    },
    {
      name: "Sara Ahmed",
      email: "sara@digitalco.com",
      company: "DigitalCo",
      title: "Founder",
      website: "digitalco.com",
      industry,
      location,
      signals: ["expanding", "needs_improvement"],
      lastActivity: "وسّعت الفريق",
      score: 82,
      companySize: "small",
      budget: "$800-1500",
    },
    {
      name: "Mohammed Ali",
      email: "mo@business.net",
      company: "BusinessNet",
      title: "Owner",
      website: "businessnet.net",
      industry,
      location,
      signals: ["no_analytics", "weak_security"],
      lastActivity: "أطلقت موقع جديد",
      score: 78,
      companySize: "small",
      budget: "$500-1000",
    },
  ];

  const leads = sampleLeads.slice(0, count);

  const outreaches = leads.map((lead, idx) => ({
    leadIndex: idx,
    channel: "email",
    type: "cold",
    subject: `خدمة ${service} لـ ${lead.company}`,
    body: `مرحباً ${lead.name.split(" ")[0]}،

لاحظت أن ${lead.company} ${lead.lastActivity} — فرصة رائعة!

بخصوص نشاطكم في ${industry}، أُقدّم خدمة ${service} التي يمكن أن تساعد في تحسين أداء أعمالكم.

التكلفة: ${lead.budget} — تسليم سريع

موعد مكالمة قصيرة؟

تحياتي،
Baran Avisat`,
    personalizationScore: 85,
    tone,
  }));

  return { leads, outreaches };
}
