"use client";

import Image from "next/image";
import { useMemo } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { caseItems } from "./cases-data";

export default function CasesPage() {
  const { t, locale } = useTranslation();
  const isChinese = locale !== "en";

  const items = useMemo(() => {
    return caseItems.map((item) => ({
      ...item,
      promptText: isChinese ? item.prompt.zh : item.prompt.en,
    }));
  }, [isChinese]);

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success(t.cases.copied);
    } catch {
      toast.error(t.common.unexpectedError);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{t.cases.title}</h1>
          <p className="text-muted-foreground max-w-2xl">{t.cases.description}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative aspect-[4/3] w-full bg-muted">
              <Image
                src={item.imageSrc}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={item.id === "case-01"}
              />
            </div>

            <CardHeader className="space-y-2">
              <CardTitle className="text-base leading-6">{item.title}</CardTitle>
              <CardDescription className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div
                className={cn(
                  "rounded-md border bg-muted/40 p-3 text-sm leading-6",
                  "max-h-[140px] overflow-auto whitespace-pre-wrap"
                )}
              >
                {item.promptText}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleCopyPrompt(item.promptText)}
              >
                <Copy className="mr-2 h-4 w-4" />
                {t.cases.copyPrompt}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

