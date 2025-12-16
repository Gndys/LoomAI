"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  clearAiGenerationHistory,
  getAiGenerationHistory,
  removeAiGenerationHistoryItem,
  type AiGenerationHistoryItem,
} from "@/lib/ai-history";
import { Copy, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

const formatDateTime = (iso: string, locale: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(locale);
};

export default function AiHistoryPage() {
  const { locale } = useTranslation();
  const [items, setItems] = useState<AiGenerationHistoryItem[]>([]);

  useEffect(() => {
    setItems(getAiGenerationHistory());
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items]);

  const handleRemove = useCallback((id: string) => {
    removeAiGenerationHistoryItem(id);
    setItems(getAiGenerationHistory());
  }, []);

  const handleClear = useCallback(() => {
    clearAiGenerationHistory();
    setItems([]);
  }, []);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(locale === "en" ? "Prompt copied." : "提示词已复制。");
    } catch {
      toast.error(locale === "en" ? "Copy failed." : "复制失败。");
    }
  }, [locale]);

  const handleDownload = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("download failed");
      const blob = await response.blob();
      const extension = blob.type.split("/")[1] || "png";
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ai-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch {
      toast.error(locale === "en" ? "Download failed." : "下载失败。");
    }
  }, [locale]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{locale === "en" ? "Generation History" : "生成记录"}</h1>
          <p className="text-muted-foreground">
            {locale === "en"
              ? "Saved in your browser on this device."
              : "记录保存在当前设备浏览器中。"}
          </p>
        </div>
        <Button variant="destructive" onClick={handleClear} disabled={!items.length}>
          <Trash2 className="mr-2 size-4" />
          {locale === "en" ? "Clear" : "清空"}
        </Button>
      </div>

      {!sorted.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{locale === "en" ? "No records yet" : "还没有记录"}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            {locale === "en"
              ? "Generate an image and it will appear here."
              : "先生成一张图片，它就会出现在这里。"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-[4/3] w-full bg-muted">
                <img
                  src={item.imageUrl}
                  alt={item.prompt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{item.tool}</Badge>
                  <Badge variant="outline">{item.model}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDateTime(item.createdAt, locale)}
                </div>
                <div className="text-sm whitespace-pre-wrap line-clamp-4">{item.prompt}</div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => handleCopy(item.prompt)}>
                    <Copy className="mr-2 size-4" />
                    {locale === "en" ? "Copy" : "复制"}
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => handleDownload(item.imageUrl)}>
                    <Download className="mr-2 size-4" />
                    {locale === "en" ? "Download" : "下载"}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove(item.id)}>
                    <Trash2 className="mr-2 size-4" />
                    {locale === "en" ? "Remove" : "删除"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
