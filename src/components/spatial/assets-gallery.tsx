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
import {
  Box,
  CheckCircle2,
  Loader2,
  XCircle,
  Download,
  Send,
  Star,
  Layers,
  FileBox,
  Calendar,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type AssetVersion = {
  id: string;
  version: number;
  format: string;
  fileSizeBytes: number;
  polygonCount: number;
  downloadUrl: string | null;
  processingType: string;
};

type Asset = {
  id: string;
  name: string;
  prompt: string | null;
  inputType: string;
  inputUrl: string | null;
  modelSource: string;
  format: string;
  fileSizeBytes: number;
  polygonCount: number;
  originalPolyCount: number;
  textureRes: number;
  hasUVMap: boolean;
  hasTextures: boolean;
  category: string;
  status: string;
  downloadUrl: string | null;
  rating: number;
  usedIn: string | null;
  costSavedUsd: number;
  processingMs: number;
  finishedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  versions: AssetVersion[];
};

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string; spin?: boolean }> = {
  ready: { label: "جاهز", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  generating: { label: "قيد التوليد", icon: Loader2, color: "text-yellow-500", bg: "bg-yellow-500/10", spin: true },
  processing: { label: "معالجة", icon: Loader2, color: "text-cyan-500", bg: "bg-cyan-500/10", spin: true },
  failed: { label: "فشل", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  pending: { label: "مُعلّق", icon: Loader2, color: "text-muted-foreground", bg: "bg-muted/10" },
};

const categoryEmoji: Record<string, string> = {
  furniture: "🪑",
  character: "🧝",
  vehicle: "🚗",
  prop: "⚔️",
  environment: "🏰",
  generic: "📦",
};

const categoryLabel: Record<string, string> = {
  furniture: "أثاث",
  character: "شخصية",
  vehicle: "مركبة",
  prop: "أغراض",
  environment: "بيئة",
  generic: "أخرى",
};

export function AssetsGallery() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Asset | null>(null);

  const load = async () => {
    try {
      const r = await fetch("/api/spatial/assets?limit=30");
      const d = await r.json();
      setAssets(d.assets || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const r = await fetch("/api/spatial/assets?limit=30");
        const d = await r.json();
        setAssets(d.assets || []);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchInitial();
    const t = setInterval(load, 5000);
    const handler = () => load();
    window.addEventListener("spatial-asset-created", handler);
    return () => {
      clearInterval(t);
      window.removeEventListener("spatial-asset-created", handler);
    };
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatNum = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-violet-500" />
          <CardTitle className="text-sm">معرض المجسمات ثلاثية الأبعاد</CardTitle>
          <Badge variant="outline" className="text-xs">{assets.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[480px] custom-scroll pr-2">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {assets.map((asset, idx) => {
                const cfg = statusConfig[asset.status] || statusConfig.pending;
                const StatusIcon = cfg.icon;
                const decimationRatio =
                  asset.originalPolyCount > 0
                    ? Math.round(((asset.originalPolyCount - asset.polygonCount) / asset.originalPolyCount) * 100)
                    : 0;
                return (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelected(asset)}
                    className="group rounded-lg overflow-hidden border border-border bg-card/40 hover:border-violet-500/40 transition-colors cursor-pointer"
                  >
                    {/* Preview placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 flex items-center justify-center relative">
                      <div className="text-5xl opacity-60 group-hover:scale-110 transition-transform">
                        {categoryEmoji[asset.category] || "📦"}
                      </div>
                      {/* Status badge */}
                      <div className="absolute top-1.5 right-1.5">
                        <Badge className={`text-[10px] ${cfg.bg} ${cfg.color} border-0`}>
                          <StatusIcon className={`h-2.5 w-2.5 ml-0.5 ${cfg.spin ? "animate-spin" : ""}`} />
                          {cfg.label}
                        </Badge>
                      </div>
                      {/* Rating stars */}
                      {asset.status === "ready" && asset.rating > 0 && (
                        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-background/80 backdrop-blur px-1.5 py-0.5 rounded-full">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-2.5 w-2.5 ${s <= asset.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2.5 space-y-1.5">
                      <div className="text-xs font-medium truncate" title={asset.name}>{asset.name}</div>
                      <div className="flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">{asset.modelSource}</Badge>
                        <Badge variant="outline" className="text-[10px]">{asset.format.toUpperCase()}</Badge>
                      </div>
                      {asset.status === "ready" && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          {formatNum(asset.polygonCount)} polygons • {decimationRatio}% decimation
                        </div>
                      )}
                      {asset.status === "ready" && asset.costSavedUsd > 0 && (
                        <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          ${asset.costSavedUsd} توفير
                        </div>
                      )}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <Box className="h-5 w-5 text-violet-500" />
                  {selected.name}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  <span className="inline-flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">{categoryEmoji[selected.category]} {categoryLabel[selected.category]}</Badge>
                    <Badge variant="outline" className="text-xs">{selected.modelSource}</Badge>
                    <Badge variant="outline" className="text-xs">{selected.format.toUpperCase()}</Badge>
                    {selected.usedIn && (
                      <Badge variant="outline" className="text-xs">استُخدم في: {selected.usedIn}</Badge>
                    )}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Preview */}
                <div className="aspect-video bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 rounded-lg flex items-center justify-center relative border border-violet-500/20">
                  <div className="text-7xl opacity-70">{categoryEmoji[selected.category]}</div>
                </div>

                {/* Prompt */}
                {selected.prompt && (
                  <div className="p-3 rounded-md bg-muted/20 border border-border">
                    <div className="text-[10px] text-muted-foreground mb-1">الـ Prompt المُستخدم:</div>
                    <div className="text-xs font-mono leading-relaxed" dir="ltr">{selected.prompt}</div>
                  </div>
                )}

                {/* Stats grid */}
                {selected.status === "ready" && (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-md bg-muted/20">
                      <Layers className="h-3.5 w-3.5 mx-auto text-cyan-500 mb-1" />
                      <div className="text-[10px] text-muted-foreground">المضلعات</div>
                      <div className="text-xs font-bold">{formatNum(selected.polygonCount)}</div>
                    </div>
                    <div className="p-2 rounded-md bg-muted/20">
                      <FileBox className="h-3.5 w-3.5 mx-auto text-purple-500 mb-1" />
                      <div className="text-[10px] text-muted-foreground">الحجم</div>
                      <div className="text-xs font-bold">{formatBytes(selected.fileSizeBytes)}</div>
                    </div>
                    <div className="p-2 rounded-md bg-muted/20">
                      <TrendingDown className="h-3.5 w-3.5 mx-auto text-emerald-500 mb-1" />
                      <div className="text-[10px] text-muted-foreground">Decimation</div>
                      <div className="text-xs font-bold text-emerald-600">
                        {Math.round(((selected.originalPolyCount - selected.polygonCount) / selected.originalPolyCount) * 100)}%
                      </div>
                    </div>
                    <div className="p-2 rounded-md bg-emerald-500/10">
                      <DollarSign className="h-3.5 w-3.5 mx-auto text-emerald-500 mb-1" />
                      <div className="text-[10px] text-muted-foreground">التوفير</div>
                      <div className="text-xs font-bold text-emerald-600">${selected.costSavedUsd}</div>
                    </div>
                  </div>
                )}

                {/* Original → Final comparison */}
                {selected.status === "ready" && (
                  <div className="p-3 rounded-md bg-muted/20 border border-border">
                    <div className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                      مقارنة قبل/بعد المعالجة
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-1">المضلعات الأصلية</div>
                        <div className="font-mono font-bold text-red-600 dark:text-red-400">{formatNum(selected.originalPolyCount)}</div>
                        <div className="text-[10px] text-muted-foreground">~{formatBytes(selected.originalPolyCount * 32)} تقديرياً</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-1">بعد الـ Decimation</div>
                        <div className="font-mono font-bold text-emerald-600">{formatNum(selected.polygonCount)}</div>
                        <div className="text-[10px] text-muted-foreground">{formatBytes(selected.fileSizeBytes)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Versions */}
                {selected.versions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">إصدارات المجسم ({selected.versions.length})</h4>
                    <div className="space-y-1.5">
                      {selected.versions.map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-2 rounded-md bg-muted/20 text-xs">
                          <span className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">v{v.version}</Badge>
                            <Badge variant="outline" className="text-[10px]">{v.processingType}</Badge>
                            <span className="font-mono">{v.format.toUpperCase()}</span>
                          </span>
                          <span className="text-muted-foreground">
                            {formatNum(v.polygonCount)} poly • {formatBytes(v.fileSizeBytes)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Failed message */}
                {selected.status === "failed" && selected.errorMessage && (
                  <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400">
                    <XCircle className="h-4 w-4 inline ml-1" />
                    {selected.errorMessage}
                  </div>
                )}

                {/* Actions */}
                {selected.status === "ready" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="text-xs bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                      onClick={() => toast.success(`بدأ تنزيل ${selected.name}.${selected.format}`)}
                    >
                      <Download className="h-3.5 w-3.5 ml-1.5" />
                      تنزيل {selected.format.toUpperCase()}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => toast.success("تم إرسال المجسم عبر تليجرام")}
                    >
                      <Send className="h-3.5 w-3.5 ml-1.5" />
                      إرسال لتليجرام
                    </Button>
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  أُنشئ: {new Date(selected.createdAt).toLocaleString("ar")}
                  {selected.processingMs > 0 && (
                    <span className="ml-2">• زمن المعالجة: {(selected.processingMs / 1000).toFixed(1)}s</span>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
