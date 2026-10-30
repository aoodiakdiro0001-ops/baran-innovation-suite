"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PenLine, Sparkles, Loader2, Eye, Download, Send, Wand2, FileText, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Content = {
  id: string;
  title: string;
  slug: string;
  contentType: string;
  wordCount: number;
  metaTitle: string | null;
  metaDesc: string | null;
  body: string;
  headings: string | null;
  suggestedTags: string | null;
  seoScore: number;
  readabilityScore: number;
  status: string;
  estimatedTraffic: number;
  createdAt: string;
};

const contentTypeLabel: Record<string, string> = {
  article: "مقال",
  landing: "صفحة هبوط",
  product: "صفحة منتج",
  blog: "مدونة",
};

const statusLabel: Record<string, string> = {
  draft: "مسودة",
  ready: "جاهز للنشر",
  published: "منشور",
};

export function ContentGenerator() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [contentType, setContentType] = useState("article");
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState<Content | null>(null);

  const load = async () => {
    try {
      const r = await fetch("/api/seo/content?limit=20");
      const d = await r.json();
      setContent(d.content || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetch("/api/seo/content?limit=20")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setContent(d.content || []);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    const handler = () => load();
    window.addEventListener("seo-content-requested", handler);
    return () => {
      active = false;
      window.removeEventListener("seo-content-requested", handler);
    };
  }, []);

  const generate = async () => {
    if (!keyword.trim()) {
      toast.error("أدخل كلمة مفتاحية");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/seo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keyword.trim(),
          contentType,
          targetWordCount: 2000,
          locale: "ar",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("✨ تم توليد المقال بنجاح!");
        setKeyword("");
        load();
      } else {
        toast.error("فشل التوليد: " + (data.message || "غير معروف"));
      }
    } catch {
      toast.error("خطأ في الاتصال بمحرك AI");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  const downloadAsMarkdown = (c: Content) => {
    const md = `# ${c.title}\n\n> ${c.metaDesc}\n\n${c.body}`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${c.slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تنزيل المقال بصيغة Markdown");
  };

  const parseTags = (tagsStr: string | null) => {
    if (!tagsStr) return [];
    try {
      return JSON.parse(tagsStr) as string[];
    } catch {
      return [];
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 text-purple-500" />
          <CardTitle className="text-sm">محرّر المحتوى الذكي (AI)</CardTitle>
          <Badge variant="outline" className="text-xs">{content.length} مقال</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Generator Form */}
        <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5 space-y-3">
          <div className="text-xs font-semibold flex items-center gap-1.5">
            <Wand2 className="h-3.5 w-3.5 text-purple-500" />
            توليد مقال SEO جديد
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="md:col-span-2">
              <Label htmlFor="gen-keyword" className="text-xs mb-1 block">الكلمة المفتاحية المستهدفة</Label>
              <Input
                id="gen-keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="مثال: فحص أمني تلقائي"
                className="text-xs h-9"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">نوع المحتوى</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">مقال</SelectItem>
                  <SelectItem value="landing">صفحة هبوط</SelectItem>
                  <SelectItem value="product">صفحة منتج</SelectItem>
                  <SelectItem value="blog">مقال مدونة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={generate}
            disabled={generating || !keyword.trim()}
            className="w-full text-xs h-9 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            {generating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 ml-1.5 animate-spin" />
                Gemini يكتب المقال الآن...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 ml-1.5" />
                توليد مقال SEO متكامل
              </>
            )}
          </Button>
        </div>

        {/* Content List */}
        <ScrollArea className="h-[360px] custom-scroll pr-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-md bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : content.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <PenLine className="h-10 w-10 mx-auto mb-2 opacity-30" />
              لا يوجد محتوى مُولَّد بعد. ابدأ بكتابة كلمة مفتاحية بالأعلى.
            </div>
          ) : (
            <div className="space-y-2">
              {content.map((c, idx) => {
                const tags = parseTags(c.suggestedTags);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelected(c)}
                    className="group p-3 rounded-md border border-border bg-card/50 hover:border-purple-500/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium line-clamp-2">{c.title}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-1" dir="ltr">
                          /{c.slug}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge
                          className={`text-xs ${
                            c.seoScore >= 90 ? "severity-low"
                            : c.seoScore >= 70 ? "severity-medium"
                            : "severity-high"
                          }`}
                        >
                          SEO: {c.seoScore}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {statusLabel[c.status] || c.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <FileText className="h-3 w-3" />
                        {c.wordCount} كلمة
                      </span>
                      <span>•</span>
                      <span>{contentTypeLabel[c.contentType] || c.contentType}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ~{c.estimatedTraffic} زيارة/شهر
                      </span>
                      {tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px] font-mono">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scroll">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <PenLine className="h-5 w-5 text-purple-500" />
                  {selected.title}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  <span className="inline-flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className="severity-low text-xs">SEO: {selected.seoScore}</Badge>
                    <Badge variant="outline" className="text-xs">قراءة: {selected.readabilityScore}</Badge>
                    <Badge variant="outline" className="text-xs">{selected.wordCount} كلمة</Badge>
                    <Badge variant="outline" className="text-xs">~{selected.estimatedTraffic} زيارة/شهر</Badge>
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Meta info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-2 rounded-md bg-muted/20">
                    <div className="text-[10px] text-muted-foreground mb-1">عنوان الميتا ({selected.metaTitle?.length || 0}/60)</div>
                    <div className="text-xs font-medium" dir="auto">{selected.metaTitle}</div>
                  </div>
                  <div className="p-2 rounded-md bg-muted/20">
                    <div className="text-[10px] text-muted-foreground mb-1">وصف الميتا ({selected.metaDesc?.length || 0}/160)</div>
                    <div className="text-xs" dir="auto">{selected.metaDesc}</div>
                  </div>
                </div>

                {/* Tags */}
                {selected.suggestedTags && (
                  <div className="flex flex-wrap gap-1.5">
                    {parseTags(selected.suggestedTags).map((t) => (
                      <Badge key={t} variant="outline" className="text-xs font-mono">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Body preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">معاينة المقال</h4>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => copyToClipboard(selected.body, "المقال")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md bg-muted/20 border border-border text-sm leading-relaxed max-h-[400px] overflow-y-auto custom-scroll"
                    dir="auto"
                  >
                    <pre className="whitespace-pre-wrap font-sans text-sm">{selected.body}</pre>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    onClick={() => downloadAsMarkdown(selected)}
                  >
                    <Download className="h-3.5 w-3.5 ml-1.5" />
                    تنزيل Markdown
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => toast.success("تم نسخ المقال كاملاً للحافظة")}
                  >
                    <Copy className="h-3.5 w-3.5 ml-1.5" />
                    نسخ المقال
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => toast.success("تم إرسال المقال عبر تليجرام (محاكاة)")}
                  >
                    <Send className="h-3.5 w-3.5 ml-1.5" />
                    إرسال لتليجرام
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
