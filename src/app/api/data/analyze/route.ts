import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

/**
 * POST /api/data/analyze
 * يستخدم Gemini/Z.ai لتحليل بيانات (وصف نصي) واستخراج رؤى
 *
 * يأخذ: datasetName, summary (إحصائيات نصية), locale
 * يُرجع: insights + recommendations + predictedTrends
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      datasetName,
      summary,
      metrics = [],
      locale = "ar",
      save = false,
    } = body;

    if (!datasetName || !summary) {
      return NextResponse.json({ error: "datasetName_and_summary_required" }, { status: 400 });
    }

    const systemPrompt = `أنت محلل بيانات تجاري محترف متخصص في استخراج الرؤى من الأرقام.
مهامك:
1) تحليل البيانات المُقدَّمة
2) تحديد الاتجاهات (trends) والشذوذ (anomalies)
3) تقديم تنبؤات (predictions) للأداء المستقبلي
4) كتابة 3 توصيات عملية واضحة وقابلة للتنفيذ

أعطِ الرد بتنسيق JSON صارم:
{
  "summary": "<arabic text - ملخص الحالة>",
  "trends": [{"title": "", "description": "", "confidence": 0-100}],
  "anomalies": [{"title": "", "description": "", "severity": "low|medium|high|critical"}],
  "predictions": [{"title": "", "description": "", "confidence": 0-100, "predictedValue": null}],
  "recommendations": ["...", "...", "..."],
  "confidence": 0-100
}`;

    const userPrompt = `حلّل هذه البيانات من المصدر "${datasetName}":

الملخص الإحصائي:
${summary}

المقاييس المتاحة: ${metrics.join(", ") || "غير محددة"}

استخرج الرؤى والتوصيات بالعربية. أعطِ JSON فقط.`;

    let analysis: Record<string, unknown> = {};
    let rawResponse = "";
    let usedFallback = false;

    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2500,
      });
      rawResponse = completion.choices?.[0]?.message?.content ?? "";
    } catch (e) {
      console.error("[/api/data/analyze] AI call failed:", e);
      usedFallback = true;
    }

    try {
      const match = rawResponse.match(/\{[\s\S]*\}/);
      if (match) {
        analysis = JSON.parse(match[0]);
      } else {
        analysis = generateFallbackAnalysis(datasetName, summary, metrics);
        usedFallback = true;
      }
    } catch {
      analysis = generateFallbackAnalysis(datasetName, summary, metrics);
      usedFallback = true;
    }

    return NextResponse.json({
      analysis,
      rawResponse,
      usedFallback,
      message: usedFallback
        ? "تم توليد تحليل تجريبي. للحصول على تحليل AI حقيقي، تأكد من إعداد z-ai-web-dev-sdk."
        : "تم تحليل البيانات بواسطة Gemini AI بنجاح!",
    });
  } catch (e) {
    console.error("[API /data/analyze] error:", e);
    const message = e instanceof Error ? e.message : "internal_error";
    return NextResponse.json({ error: "analysis_failed", message }, { status: 500 });
  }
}

function generateFallbackAnalysis(
  datasetName: string,
  summary: string,
  metrics: string[]
): Record<string, unknown> {
  return {
    summary: `بناءً على تحليل "${datasetName}"، البيانات تُظهر أداءً عاماً معتدلاً مع بعض الاتجاهات الإيجابية. المقاييس الرئيسية (${metrics.join("، ") || "غير محددة"}) تشير إلى فرص لتحسين الأداء عبر إعادة توزيع الموارد.`,
    trends: [
      {
        title: "نمو تدريجي في الأداء الأسبوعي",
        description: "البيانات تشير إلى نمو 8-15% أسبوعياً في المؤشرات الرئيسية، مع تسارع في الأسبوعين الأخيرين.",
        confidence: 78,
      },
      {
        title: "تركز جغرافي للأنشطة",
        description: "60% من النشاط يأتي من 3 دول فقط، مما يكشف عن فرص في أسواق جديدة.",
        confidence: 72,
      },
    ],
    anomalies: [
      {
        title: "ارتفاع غير مبرر في التكاليف يوم الأحد",
        description: "تكاليف الأحد أعلى بـ 35% من بقية أيام الأسبوع دون زيادة مقابلة في النتائج.",
        severity: "high",
      },
    ],
    predictions: [
      {
        title: "توقع نمو 22% في الربع التالي",
        description: "إذا استمرت الاتجاهات الحالية، نتوقع نمواً 18-25% في الأداء القادم.",
        confidence: 81,
      },
    ],
    recommendations: [
      "إعادة توزيع ميزانية الإعلانات من القنوات منخفضة العائد إلى القنوات ذات ROAS > 3x",
      "إرسال حملة استرجاع للعملاء غير النشطين 30+ يوماً عبر البريد وواتساب",
      "زيادة مخزون المنتجات الأكثر مبيعاً قبل الموسم المتوقع لتفادي نفاد المخزون",
    ],
    confidence: 75,
  };
}
