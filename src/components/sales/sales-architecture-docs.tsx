"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Brain,
  Database,
  Send,
  Workflow,
  Terminal,
  Cloud,
  Sparkles,
  Globe,
  Zap,
} from "lucide-react";

const layers = [
  {
    icon: Cloud,
    title: "1. طبقة الاستقبال (Ingestion)",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    tools: ["Cloudflare Workers", "Telegram Webhook", "WhatsApp Cloud API", "Email IMAP"],
    description:
      "Cloudflare Workers تستقبل رسائل العميل من تليجرام وواتساب والإيميل وموقع الويب وإنستغرام في نقطة دخول موحّدة، بزمن استجابة تحت 50ms، وتوجّهها فوراً لطبقة RAG.",
  },
  {
    icon: Database,
    title: "2. قاعدة المعرفة و RAG (Knowledge & Retrieval)",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    tools: ["Supabase pgvector", "PostgreSQL", "Embeddings", "Keyword Search"],
    description:
      "كتالوج المنتجات والأسئلة والسياسات والتسعير مخزّن في Supabase. يتم البحث بالمطابقة الدلالية (pgvector) + مطابقة الكلمات المفتاحية لاسترجاع أفضل 3 نتائج ذات صلة بسؤال العميل.",
  },
  {
    icon: Brain,
    title: "3. العقل التجاري (Sales AI Core)",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    tools: ["Gemini API", "Groq API", "Z.ai SDK", "Intent Detection"],
    description:
      "يأخذ سؤال العميل + سياق RAG + تاريخ المحادثة، وينتج رداً احترافياً موجهاً لإتمام البيع أو حل المشكلة. يكتشف النية (sales / pricing / complaint / booking)، يحلل المشاعر، ويقرر التحويل لموظف بشري عند اللزوم.",
  },
  {
    icon: Send,
    title: "4. الطبقة النهائية (Persistence & Delivery)",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    tools: ["Supabase", "Telegram Bot", "WhatsApp API", "Dashboard"],
    description:
      "يُحفظ الرد وسجل المحادثة في Supabase، يُرسل للعميل عبر القناة الأصلية، ويُبعَث تنبيه فوري للوحة التحكم. عند التحويل لموظف، يُرسل تنبيه Telegram لفريق الدعم البشري.",
  },
];

const workflow = [
  { step: "وصول", icon: MessageSquare, text: "العميل يرسل رسالة عبر تليجرام/واتساب/إيميل/ويب/إنستغرام" },
  { step: "استقبال", icon: Cloud, text: "Cloudflare Worker يستقبل الرسالة ويوحّد الصيغة" },
  { step: "RAG", icon: Database, text: "بحث دلالي + كلمات في قاعدة المعرفة Supabase" },
  { step: "AI", icon: Brain, text: "Gemini يولّد رداً احترافياً بناءً على المعرفة المُسترجَعة" },
  { step: "رد", icon: Send, text: "الرد يُرسل للعميل + يُحفظ في Supabase + تنبيه Dashboard" },
  { step: "متابعة", icon: Workflow, text: "تُحَدَّث حالة المحادثة، الـ intent، الـ sentiment، وتم التحويل للبشري" },
];

export function SalesArchitectureDocs() {
  return (
    <div className="space-y-4">
      <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-background to-blue-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
            ما هو Omni-Sales ZeroBaran؟
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Omni-Sales ZeroBaran</strong> هو الوكيل التجاري الذاتي
            الذي يرد على استفسارات عملائك 24/7 عبر تليجرام وواتساب والإيميل والموقع وإنستغرام،
            بفهم عميق لنية العميل، وإجابات مبنية على RAG من كتالوج منتجاتك، والتعامل مع الاعتراضات،
            وإرسال تفاصيل الدفع — دون Intercom أو Zendesk أو LiveChat. يستخدم Gemini AI + Supabase pgvector،
            ويحوّل المحادثات الصعبة لموظف بشري تلقائياً عند الحاجة.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-xs font-semibold mb-1 text-emerald-600 dark:text-emerald-400">💰 توفير مال فلكي</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                منصات خدمة العملاء (Intercom $74/مستخدم/شهر، Zendesk $115/مستخدم/شهر) مكلفة جداً؛ هذا النظام يرد آلياً على 85% من الاستفسارات بتكلفة صفر.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5">
              <div className="text-xs font-semibold mb-1 text-indigo-600 dark:text-indigo-400">⚡ رد فوري 24/7</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                زمن استجابة &lt; 1 ثانية بدلاً من انتظار موظف بشري ساعات. يخدم العملاء في كل المناطق الزمنية، ولا ينام.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5">
              <div className="text-xs font-semibold mb-1 text-purple-600 dark:text-purple-400">🎯 إغلاق مبيعات</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                AI مدرّب على كتالوج منتجاتك لعرض الأنسب، التعامل مع الاعتراضات، تقديم الدفع، ورفع نسبة التحويل 30-50%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {layers.map((layer, idx) => {
          const Icon = layer.icon;
          return (
            <Card key={idx} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${layer.bg}`}>
                    <Icon className={`h-4 w-4 ${layer.color}`} />
                  </div>
                  {layer.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">{layer.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {layer.tools.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px] font-mono">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Workflow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Workflow className="h-4 w-4 text-indigo-500" />
            مسار العمل من البداية للنهاية (End-to-End Workflow)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3">
            {workflow.map((w, idx) => {
              const Icon = w.icon;
              return (
                <div key={idx} className="relative">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="relative">
                      <div className="p-3 rounded-full bg-card border border-indigo-500/30">
                        <Icon className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">{w.step}</Badge>
                    <p className="text-[11px] text-muted-foreground leading-snug">{w.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Free Tech Stack */}
      <Card className="border-emerald-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            الموارد المجانية البحتة (Free Tech Stack)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground border-b">
                <tr>
                  <th className="text-right py-2 font-medium">المكوّن</th>
                  <th className="text-right py-2 font-medium">التقنية المجانية</th>
                  <th className="text-right py-2 font-medium">الدور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">طبقة الاستقبال (Ingestion)</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Cloudflare Workers</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Telegram Webhook</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">استقبال رسائل العميل من كل القنوات في نقطة موحّدة</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">قاعدة المعرفة + RAG</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Supabase</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">pgvector</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">تخزين الكتالوج + الأسئلة + البحث الدلالي للمعلومات</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">العقل التجاري</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Gemini API</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Groq API</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Z.ai SDK</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">توليد رد احترافي + اكتشاف النية + تحليل المشاعر</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">قاعدة بيانات المحادثات</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Supabase</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">PostgreSQL</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">حفظ كل محادثة، رسالة، وتحويل مع سجل كامل للمراجعة</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">قناة التسليم</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="font-mono text-[10px]">Telegram Bot</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">WhatsApp Cloud</Badge>{" "}
                    <Badge variant="outline" className="font-mono text-[10px]">Vercel Dashboard</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">إرسال رد AI للعميل + تنبيه فوري لفريق الدعم</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5">محرّك الجدولة</td>
                  <td className="py-2.5"><Badge variant="outline" className="font-mono text-[10px]">GitHub Actions</Badge></td>
                  <td className="py-2.5 text-muted-foreground">تشغيل RAG Search + AI كل 10 دقائق لردود المحادثات المعلّقة</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Commands */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Terminal className="h-4 w-4 text-orange-500" />
            أوامر التشغيل السريعة
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {[
            { cmd: "python scanner/sales/rag_search.py --query='باقة أمان' --category=product --limit=3", desc: "بحث RAG في الكتالوج عن باقة الأمان" },
            { cmd: "python scanner/sales/ai_agent.py --message='كم سعر الباقة؟' --conversation-id=abc --kb-context=kb.json", desc: "توليد رد AI على سؤال تسعير" },
            { cmd: "python scanner/sales/ai_agent.py --message='أريد الشراء' --tone=professional", desc: "ردود بيع بأسلوب احترافي" },
            { cmd: "python scanner/sales/telegram_handler.py --chat-id=123 --message='رد العميل' --type=response", desc: "إرسال رد للعميل عبر تليجرام" },
            { cmd: "python scanner/sales/telegram_handler.py --chat-id=admin --type=escalation --message='شكوى تحتاج متابعة'", desc: "إشعار التحويل لموظف" },
            { cmd: "gh workflow run sales-agent.yml -f test_message='كم تكلفة الباقة؟' -f conversation_id=abc", desc: "إطلاق دورة AI عبر GitHub Actions" },
          ].map((c, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2 rounded-md bg-muted/20 border border-border">
              <Zap className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <code className="text-xs font-mono text-indigo-600 dark:text-indigo-400 block" dir="ltr">
                  $ {c.cmd}
                </code>
                <p className="text-[10px] text-muted-foreground mt-1">{c.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
