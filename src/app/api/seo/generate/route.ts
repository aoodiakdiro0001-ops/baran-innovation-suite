import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

/**
 * POST /api/seo/generate
 * يستخدم Gemini/Z.ai لتوليد مقال متوافق مع SEO
 *
 * يأخذ: keyword, contentType, targetWordCount
 * يُرجع: title, slug, metaTitle, metaDesc, body, headings, seoScore
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { keyword, contentType = "article", targetWordCount = 2000, locale = "ar", save = true } = body;

    if (!keyword) {
      return NextResponse.json({ error: "keyword_required" }, { status: 400 });
    }

    const systemPrompt = `أنت كاتب محتوى SEO محترف متخصص في تصدّير نتائج البحث.
مهامك:
1) كتابة مقال كامل بالعربية حول الكلمة المفتاحية: "${keyword}"
2) توزيع الكلمة الرئيسية ومتغيراتها بشكل طبيعي (1-2% كثافة)
3) بنية H1 / H2 / H3 متكاملة
4) عنوان ميتا جذاب < 60 حرف
5) وصف ميتا < 160 حرف
6) استخدام قائمة نقطية وفقرات قصيرة لتحسين القراءة
7) 2000 كلمة على الأقل
8) ذكر التاريخ الحالي: 2026

أعطِ الرد بتنسيق JSON صارم:
{
  "title": "<string>",
  "slug": "<english-kebab-case>",
  "metaTitle": "<string <60 char>",
  "metaDesc": "<string <160 char>",
  "body": "<full markdown article>",
  "headings": {"h1": [], "h2": [], "h3": []},
  "suggestedTags": ["tag1", "tag2"],
  "seoScore": <0-100>,
  "readabilityScore": <0-100>,
  "estimatedTraffic": <number>
}`;

    const userPrompt = `اكتب مقال SEO احترافي عن: "${keyword}"
النوع: ${contentType}
اللغة: ${locale === "ar" ? "العربية" : "الإنجليزية"}
عدد الكلمات المستهدف: ${targetWordCount}

القواعد:
- الكلمة الرئيسية يجب أن تظهر في العنوان H1 والفقرة الأولى وفي 3-5 عناوين H2
- استخدم كلمات مرادفة (LSI) بشكل طبيعي
- كل فقرة 3-5 جمل
- استخدم قوائم نقطية ومرقمة
- أضف CTA في النهاية
- تجنب التكرار المفرط

أعطِ JSON فقط بدون تعليقات إضافية.`;

    let aiResult: Record<string, unknown> = {};
    let rawResponse = "";
    let usedFallback = false;

    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });
      rawResponse = completion.choices?.[0]?.message?.content ?? "";
    } catch (e) {
      console.error("[/api/seo/generate] AI call failed, using fallback:", e);
      usedFallback = true;
    }

    // استخراج JSON من الرد
    try {
      const match = rawResponse.match(/\{[\s\S]*\}/);
      if (match) {
        aiResult = JSON.parse(match[0]);
      } else {
        // Fallback content
        aiResult = generateFallbackContent(keyword, contentType, locale);
        usedFallback = true;
      }
    } catch {
      aiResult = generateFallbackContent(keyword, contentType, locale);
      usedFallback = true;
    }

    // التأكد من وجود الحقول المطلوبة
    const finalResult = {
      title: (aiResult.title as string) || `دليل شامل: ${keyword} في 2026`,
      slug: (aiResult.slug as string) || keywordToSlug(keyword),
      metaTitle: (aiResult.metaTitle as string) || `${keyword}: الدليل الكامل 2026`,
      metaDesc: (aiResult.metaDesc as string) || `تعلّم كل ما تحتاج معرفته عن ${keyword} في 2026. دليل شامل ومحدّث بأحدث المعلومات.`,
      body: (aiResult.body as string) || `# ${keyword}\n\nمقدمة شاملة حول ${keyword}...\n\n## الأساسيات\n\n[محتوى]\n\n## استراتيجيات متقدمة\n\n[محتوى]\n\n## خاتمة\n\nختاماً، ${keyword} هو موضوع حيوي...`,
      headings: (aiResult.headings as Record<string, string[]>) || { h1: [keyword], h2: ["الأساسيات", "استراتيجيات", "أدوات", "خاتمة"], h3: [] },
      suggestedTags: (aiResult.suggestedTags as string[]) || ["seo", "content", keyword],
      seoScore: (aiResult.seoScore as number) || 85,
      readabilityScore: (aiResult.readabilityScore as number) || 78,
      estimatedTraffic: (aiResult.estimatedTraffic as number) || 1500,
    };

    // حفظ في قاعدة البيانات
    let saved: Awaited<ReturnType<typeof db.generatedContent.create>> | null = null;
    if (save) {
      saved = await db.generatedContent.create({
        data: {
          title: finalResult.title,
          slug: finalResult.slug,
          contentType,
          wordCount: finalResult.body.split(/\s+/).length,
          metaTitle: finalResult.metaTitle,
          metaDesc: finalResult.metaDesc,
          body: finalResult.body,
          headings: JSON.stringify(finalResult.headings),
          suggestedTags: JSON.stringify(finalResult.suggestedTags),
          seoScore: finalResult.seoScore,
          readabilityScore: finalResult.readabilityScore,
          status: "draft",
          estimatedTraffic: finalResult.estimatedTraffic,
        },
      });
    }

    return NextResponse.json({
      content: saved || finalResult,
      generated: finalResult,
      usedFallback,
      message: usedFallback
        ? "تم توليد محتوى تجريبي (الفالباك). للحصول على محتوى AI حقيقي، تأكد من وجود مفتاح z-ai-web-dev-sdk صحيح."
        : "تم توليد مقال SEO احترافي بنجاح!",
    });
  } catch (e) {
    console.error("[API /seo/generate] error:", e);
    const message = e instanceof Error ? e.message : "internal_error";
    return NextResponse.json({ error: "generation_failed", message }, { status: 500 });
  }
}

function keywordToSlug(keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

function generateFallbackContent(keyword: string, contentType: string, locale: string): Record<string, unknown> {
  const isArabic = locale === "ar";
  const title = isArabic ? `الدليل الشامل لـ ${keyword} في 2026` : `Complete Guide: ${keyword} in 2026`;
  const slug = keywordToSlug(keyword);
  const body = isArabic
    ? `# ${keyword}: الدليل الشامل 2026

## مقدمة
في هذا الدليل سنتناول كل ما يتعلق بـ **${keyword}** بشكل عملي ومحدّث. يعتبر ${keyword} من المواضيع الحيوية التي يحتاجها كل مختص في 2026.

## لماذا ${keyword} مهم؟
- يساعد في تحقيق أهدافك المهنية
- يوفّر الوقت والجهد
- يفتح آفاقاً جديدة للنمو
- يعزز من قدرتك التنافسية

## أساسيات ${keyword}
قبل البدء، إليك المبادئ الأساسية:
1. فهم السياق العام
2. تحديد الأهداف بوضوح
3. اختيار الأدوات المناسبة
4. التطبيق التدريجي

## استراتيجيات متقدمة في ${keyword}
بعد إتقان الأساسيات، يمكن الانتقال للاستراتيجيات المتقدمة:
- التحليل العميق للبيانات
- الأتمتة الذكية للعمليات
- القياس المستمر للنتائج
- التطوير المستمر

## أفضل ممارسات ${keyword}
لتقديم أفضل نتائج في ${keyword}، اتبع هذه الممارسات:
- التحديث المستمر للمعلومات
- التفاعل مع المجتمع المتخصص
- الاطلاع على الدراسات الحديثة
- التطبيق العملي لا النظري فقط

## أدوات ${keyword} الموصى بها
1. أدوات مفتوحة المصدر
2. أدوات سحابية مجانية
3. أدوات الذكاء الاصطناعي
4. أدوات التحليل المتقدم

## خاتمة
في ختام هذا الدليل الشامل حول ${keyword}، نؤكد على أن النجاح في هذا المجال يتطلب التعلم المستمر والتطبيق العملي. ابدأ اليوم وكن من الرواد في 2026!`
    : `# ${keyword}: Complete Guide 2026\n\n## Introduction\n[Content]\n\n## Why ${keyword}?\n[Content]`;

  return {
    title,
    slug,
    metaTitle: isArabic ? `${keyword}: الدليل الكامل 2026` : `${keyword}: Complete Guide 2026`,
    metaDesc: isArabic
      ? `تعلّم كل ما تحتاج معرفته عن ${keyword} في 2026. دليل شامل ومحدّث بأحدث المعلومات والاستراتيجيات.`
      : `Learn everything about ${keyword} in 2026. Complete updated guide.`,
    body,
    headings: {
      h1: [title],
      h2: isArabic ? ["مقدمة", "لماذا مهم؟", "الأساسيات", "استراتيجيات متقدمة", "أفضل ممارسات", "أدوات موصى بها", "خاتمة"] : ["Introduction", "Why?", "Basics", "Strategies", "Best Practices", "Tools", "Conclusion"],
      h3: [],
    },
    suggestedTags: ["seo", "guide", "2026", keyword.substring(0, 20)],
    seoScore: 84,
    readabilityScore: 78,
    estimatedTraffic: 1500,
  };
}
