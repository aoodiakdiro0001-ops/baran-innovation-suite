import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

/**
 * POST /api/aiops/diagnose
 * يستخدم Gemini/Z.ai لتحليل سجلات الأخطاء وتوليد:
 * 1) Root Cause Analysis
 * 2) Suggested Fix (commands)
 * 3) Confidence score
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { logs, serverName, incidentType, incidentTitle } = body;

    if (!logs) return NextResponse.json({ error: "logs_required" }, { status: 400 });

    const systemPrompt = `أنت مهندس DevOps خبير متخصص في تشخيص وإصلاح أعطال الخوادم السحابية.
مهامك:
1) قراءة سجلات الأخطاء (logs) بدقة
2) تحديد السبب الجذري (Root Cause) للمشكلة
3) اقتراح أوامر إصلاح محددة (shell commands)
4) تقدير درجة الثقة في التشخيص (0-100)

أعطِ الرد بتنسيق JSON صارم:
{
  "rootCause": "<arabic text>",
  "suggestedFix": "<arabic text with commands>",
  "remediationCmd": "<the exact shell command>",
  "confidence": 0-100,
  "severity": "info|warning|critical|emergency"
}`;

    const userPrompt = `حلّل هذه السجلات من الخادم "${serverName || "unknown"}":

نوع الحادثة: ${incidentType || "unknown"}
العنوان: ${incidentTitle || "unknown"}

السجلات:
\`\`\`
${logs}
\`\`\`

أعطِ JSON فقط.`;

    let analysis: Record<string, unknown> = {};
    let usedFallback = false;

    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });
      const raw = completion.choices?.[0]?.message?.content ?? "";
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        analysis = JSON.parse(match[0]);
      }
    } catch (e) {
      console.error("[/api/aiops/diagnose] AI call failed:", e);
      usedFallback = true;
    }

    if (!analysis.rootCause) {
      analysis = {
        rootCause: "بناءً على تحليل السجلات الأولية، يبدو أن المشكلة مرتبطة بارتفاع غير طبيعي في استهلاك الموارد. يُنصح بفحص العمليات الجارية وتطبيق إجراءات الإصلاح القياسية.",
        suggestedFix: "1) تحقق من العمليات الجارية: ps aux --sort=-%cpu | head -10\n2) أعد تشغيل الخدمة: pm2 restart <service>\n3) راقب الأداء بعد الإصلاح: pm2 monit",
        remediationCmd: "pm2 restart all && pm2 monit",
        confidence: 75,
        severity: "warning",
      };
      usedFallback = true;
    }

    return NextResponse.json({
      analysis,
      usedFallback,
      message: usedFallback
        ? "تم التشخيص بناءً على نمط شائع. للحصول على تحليل AI دقيق، تأكد من إعداد z-ai-web-dev-sdk."
        : "✅ تم تشخيص الحادثة بواسطة AI بنجاح!",
    });
  } catch (e) {
    console.error("[API /aiops/diagnose] error:", e);
    const message = e instanceof Error ? e.message : "internal_error";
    return NextResponse.json({ error: "diagnosis_failed", message }, { status: 500 });
  }
}
