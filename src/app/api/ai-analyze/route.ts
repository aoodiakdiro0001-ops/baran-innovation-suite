import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

/**
 * POST /api/ai-analyze
 * يأخذ تقرير ثغرة خام، يطلب من Gemini تحليلها وإصدار:
 * 1) تقدير الخطورة (Risk Score 0-100)
 * 2) شرح الثغرة
 * 3) كود الإصلاح المقترح
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, severity, category, codeSnippet, description, language = "ar" } = body;

    if (!title) {
      return NextResponse.json({ error: "title_required" }, { status: 400 });
    }

    const systemPrompt = `أنت خبير أمن سيبراني متخصص في تحليل ثغرات الكود واقتراح إصلاحات آمنة.
مهامك:
1) تقييم درجة الخطورة من 0 إلى 100
2) شرح موجز للثغرة بالعربية
3) كتابة كود الإصلاح المقترح بلغة ${language} بشكل آمن ومباشر
أعطِ الرد بتنسيق JSON صارم:
{
  "riskScore": <number>,
  "explanation": "<string>",
  "fixCode": "<string>",
  "recommendations": "<string>"
}`;

    const userPrompt = `ثغرة: ${title}
الخطورة المبدئية: ${severity}
الفئة: ${category}
الوصف: ${description}
الكود المصاب:
\`\`\`
${codeSnippet || "(لا يوجد كود متاح)"}
\`\`\`

حلل وأعطِ الرد بصيغة JSON فقط بدون أي تعليق إضافي.`;

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1200,
    });

    const rawText = completion.choices?.[0]?.message?.content ?? "";

    let analysis: Record<string, unknown> = {};
    try {
      // محاولة استخراج JSON من الرد
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        analysis = JSON.parse(match[0]);
      } else {
        analysis = {
          riskScore: severity === "critical" ? 90 : severity === "high" ? 70 : 40,
          explanation: rawText,
          fixCode: "",
          recommendations: "",
        };
      }
    } catch {
      analysis = {
        riskScore: severity === "critical" ? 85 : severity === "high" ? 65 : 35,
        explanation: rawText,
        fixCode: "",
        recommendations: "",
      };
    }

    return NextResponse.json({ analysis, rawResponse: rawText });
  } catch (e) {
    console.error("[API /ai-analyze] error:", e);
    const message = e instanceof Error ? e.message : "internal_error";
    return NextResponse.json({ error: "ai_failed", message }, { status: 500 });
  }
}
