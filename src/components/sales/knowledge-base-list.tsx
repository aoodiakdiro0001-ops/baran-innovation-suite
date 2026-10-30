"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { BookOpen, Package, Tag, Search } from "lucide-react";

type KbItem = {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string | null;
  price: number | null;
  currency: string;
  sku: string | null;
  stock: number;
  imageUrl: string | null;
  searchCount: number;
  active: boolean;
};

const categoryConfig: Record<string, { label: string; class: string; icon: typeof Package }> = {
  product: { label: "منتج", class: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30", icon: Package },
  service: { label: "خدمة", class: "bg-purple-500/15 text-purple-500 border-purple-500/30", icon: Tag },
  faq: { label: "سؤال", class: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30", icon: BookOpen },
  policy: { label: "سياسة", class: "bg-amber-500/15 text-amber-500 border-amber-500/30", icon: BookOpen },
  pricing: { label: "تسعير", class: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30", icon: Tag },
};

function parseTags(s: string | null): string[] {
  if (!s) return [];
  try {
    return JSON.parse(s) as string[];
  } catch {
    return [];
  }
}

export function KnowledgeBaseList() {
  const [items, setItems] = useState<KbItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const url = filter === "all" ? "/api/sales/knowledge-base" : `/api/sales/knowledge-base?category=${filter}`;
        const r = await fetch(url);
        const d = await r.json();
        setItems(d.items || []);
        if (d.categories) setCategories(d.categories);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [filter]);

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-500" />
          <CardTitle className="text-sm">قاعدة المعرفة (RAG Catalog)</CardTitle>
          <Badge variant="outline" className="text-xs">{items.length} عنصر</Badge>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48 h-8 text-xs">
            <SelectValue placeholder="كل الفئات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفئات</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {categoryConfig[c]?.label || c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="max-h-[640px] custom-scroll pr-2">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 rounded-md bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item, idx) => {
                const cat = categoryConfig[item.category] || { label: item.category, class: "bg-muted text-muted-foreground border-border", icon: BookOpen };
                const CatIcon = cat.icon;
                const tags = parseTags(item.tags);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-3 rounded-md border border-border bg-card/50 hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={`text-[10px] ${cat.class}`}>
                        <CatIcon className="h-2.5 w-2.5 ml-0.5" />
                        {cat.label}
                      </Badge>
                      {item.price != null && (
                        <div className="text-sm font-bold text-indigo-500">
                          ${item.price}
                          <span className="text-[10px] text-muted-foreground font-normal"> {item.currency}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium mb-1 line-clamp-2" dir="auto">{item.title}</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3" dir="auto">
                      {item.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {item.sku && (
                        <Badge variant="outline" className="text-[9px] font-mono">SKU: {item.sku}</Badge>
                      )}
                      {tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="text-[9px]">#{t}</Badge>
                      ))}
                      {item.searchCount > 0 && (
                        <Badge variant="outline" className="text-[9px]">
                          <Search className="h-2 w-2 ml-0.5" />
                          {item.searchCount}
                        </Badge>
                      )}
                    </div>
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
