'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { toast } from "sonner";
import { UploadCloud, Image as ImageIcon, Copy, Loader2, Trash2, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

type ExtractionStatus = "idle" | "analyzing" | "success" | "error";
type Usage = { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null;

export default function PromptExtractorPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<ExtractionStatus>("idle");
  const [prompt, setPrompt] = useState("");
  const [usage, setUsage] = useState<Usage>(null);
  const [hints, setHints] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const statusLabel =
    t.ai.promptExtractor.statuses[status] ?? t.ai.promptExtractor.statuses.idle;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const nextFile = files[0];
      if (!ALLOWED_TYPES.has(nextFile.type.toLowerCase())) {
        toast.error(t.ai.promptExtractor.toasts.invalidType);
        return;
      }
      if (nextFile.size > MAX_UPLOAD_SIZE) {
        toast.error(t.ai.promptExtractor.toasts.fileTooLarge);
        return;
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setFile(nextFile);
      setPreviewUrl(URL.createObjectURL(nextFile));
      setStatus("idle");
      setPrompt("");
      setUsage(null);
    },
    [previewUrl, t.ai.promptExtractor.toasts.fileTooLarge, t.ai.promptExtractor.toasts.invalidType],
  );

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast.error(t.ai.promptExtractor.toasts.missingImage);
      return;
    }

    setIsSubmitting(true);
    setStatus("analyzing");
    setUsage(null);
    setPrompt("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (hints.trim()) {
        formData.append("hints", hints.trim());
      }

      const response = await fetch("/api/ai/prompt-extractor", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.ai.promptExtractor.toasts.error);
      }

      setPrompt(data.prompt ?? "");
      setUsage(data.usage ?? null);
      setStatus("success");
      toast.success(t.ai.promptExtractor.toasts.success);
    } catch (error) {
      console.error("Prompt extractor error:", error);
      setStatus("error");
      toast.error((error as Error).message || t.ai.promptExtractor.toasts.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    toast.success(t.ai.promptExtractor.copied);
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setPrompt("");
    setUsage(null);
    setStatus("idle");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="border-primary/50 bg-primary/5 text-primary">
            {t.ai.promptExtractor.badges.model}
          </Badge>
          <Badge variant="outline">{t.ai.promptExtractor.badges.endpoint}</Badge>
          <Badge variant="outline">{t.ai.promptExtractor.badges.vision}</Badge>
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t.ai.promptExtractor.title}</h1>
          <p className="mt-2 text-muted-foreground">{t.ai.promptExtractor.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{t.ai.promptExtractor.uploadTitle}</CardTitle>
            <CardDescription>{t.ai.promptExtractor.uploadDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/70"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="relative h-full w-full overflow-hidden rounded-xl">
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-3 top-3 bg-background/80 backdrop-blur"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFile();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-medium">{t.ai.promptExtractor.dropLabel}</p>
                    <p className="text-sm text-muted-foreground">{t.ai.promptExtractor.uploadLimit}</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hints">{t.ai.promptExtractor.hintsLabel}</Label>
              <Textarea
                id="hints"
                placeholder={t.ai.promptExtractor.hintsPlaceholder}
                value={hints}
                onChange={(event) => setHints(event.target.value)}
                className="min-h-[96px]"
              />
              <p className="text-sm text-muted-foreground">{t.ai.promptExtractor.helper}</p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <span>{file?.name ?? t.ai.promptExtractor.statuses.idle}</span>
              </div>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <Sparkles className="h-4 w-4" />
                <span>{isSubmitting ? t.ai.promptExtractor.analyzing : t.ai.promptExtractor.cta}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>{t.ai.promptExtractor.resultTitle}</CardTitle>
            <CardDescription>{t.ai.promptExtractor.resultDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Badge variant={status === "error" ? "destructive" : "secondary"}>{statusLabel}</Badge>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!prompt}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                <span>{t.ai.promptExtractor.copy}</span>
              </Button>
            </div>

            <Textarea
              readOnly
              value={prompt}
              placeholder={status === "analyzing" ? t.ai.promptExtractor.analyzing : ""}
              className="min-h-[220px] bg-muted/50"
            />

            {usage && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t.ai.promptExtractor.usageLabel}
                </p>
                <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">{usage.prompt_tokens ?? "—"}</p>
                    <p>{t.ai.promptExtractor.usageTokens.prompt}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{usage.completion_tokens ?? "—"}</p>
                    <p>{t.ai.promptExtractor.usageTokens.completion}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{usage.total_tokens ?? "—"}</p>
                    <p>{t.ai.promptExtractor.usageTokens.total}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
