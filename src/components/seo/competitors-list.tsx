"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, ExternalLink, Globe } from "lucide-react";
import { motion } from "framer-motion";

type Competitor = {
  id: string;
  domain: string;
  name: string | null;
  totalKeywords: number;
  avgRank: number;
  topKeywords: number;
  estTraffic: number;
  strengths: string | null;
};

export function CompetitorsList() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch("/api/seo/competitors");
        const d = await r.json();
        if (mounted) {
          setCompetitors(d.competitors || []);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const formatNum = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const parseStrengths = (s: string | null) => {
    if (!s) return null;
    try {
      return JSON.parse(s) as { backlinks?: number; contentLength?: number; da?: number };
    } catch {
      return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-cyan-500" />
          <CardTitle className="text-sm">المنافسون المُراقَبون</CardTitle>
          <Badge variant="outline" className="text-xs">{competitors.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[360px] custom-scroll pr-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-md bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {competitors.map((comp, idx) => {
                const strengths = parseStrengths(comp.strengths);
                return (
                  <motion.div
                    key={comp.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="p-3 rounded-lg border border-border bg-card/40 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-md bg-cyan-500/10 shrink-0">
                          <Globe className="h-3.5 w-3.5 text-cyan-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{comp.name || comp.domain}</div>
                          <div className="text-[10px] text-muted-foreground font-mono" dir="ltr">
                            {comp.domain}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0"
                        asChild
                      >
                        <a href={`https://${comp.domain}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-muted-foreground">كلمات</div>
                        <div className="font-semibold">{comp.totalKeywords}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">متوسط ترتيب</div>
                        <div className="font-semibold">#{comp.avgRank.toFixed(1)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">في أول 10</div>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">{comp.topKeywords}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">زيارات/شهر</div>
                        <div className="font-semibold text-cyan-600 dark:text-cyan-400">
                          {formatNum(comp.estTraffic)}
                        </div>
                      </div>
                    </div>

                    {strengths && (
                      <div className="mt-2 pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
                        {strengths.backlinks !== undefined && (
                          <Badge variant="outline" className="text-[10px] font-mono">
                            🔗 {formatNum(strengths.backlinks)} Backlinks
                          </Badge>
                        )}
                        {strengths.contentLength !== undefined && (
                          <Badge variant="outline" className="text-[10px] font-mono">
                            📝 {strengths.contentLength}w avg
                          </Badge>
                        )}
                        {strengths.da !== undefined && (
                          <Badge variant="outline" className="text-[10px] font-mono">
                            🎯 DA: {strengths.da}
                          </Badge>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
