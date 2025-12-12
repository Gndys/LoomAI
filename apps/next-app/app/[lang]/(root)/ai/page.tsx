'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  RefreshCw,
  Download,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const ASPECT_RATIOS = ["3:4", "4:3", "1:1", "9:16", "16:9", "2:3"] as const;

type GenerationStatus = "idle" | "creating" | "polling" | "completed" | "failed";
type AspectRatio = (typeof ASPECT_RATIOS)[number];

const parseAspectRatio = (value: AspectRatio) => {
  const [width, height] = value.split(":").map(Number);
  if (!width || !height) return undefined;
  return width / height;
};

export default function LookbookGeneratorPage() {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<AspectRatio>("3:4");
  const [frameAspectRatio, setFrameAspectRatio] = useState<number | undefined>(parseAspectRatio("3:4"));
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const statusLabels = useMemo(
    () => ({
      idle: t.ai.generator.status.idle,
      creating: t.ai.generator.status.creating,
      polling: t.ai.generator.status.polling,
      completed: t.ai.generator.status.completed,
      failed: t.ai.generator.status.failed,
    }),
    [t],
  );

  const statusIcons: Record<GenerationStatus, JSX.Element> = {
    idle: <Sparkles className="size-3.5" />,
    creating: <Loader2 className="size-3.5 animate-spin" />,
    polling: <Loader2 className="size-3.5 animate-spin" />,
    completed: <Check className="size-3.5" />,
    failed: <AlertTriangle className="size-3.5" />,
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (status === "creating" || status === "polling") {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    if (status === "idle") {
      setElapsedSeconds(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status]);

  useEffect(() => {
    if (!taskId) return;
    let cancelled = false;
    let timeout: NodeJS.Timeout | undefined;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/ai/images/${taskId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || t.ai.generator.toasts.error);
        }

        if (cancelled) return;

        setProgress(data.progress ?? 0);

        if (data.status === "completed" && data.imageUrl) {
          setImageUrl(data.imageUrl);
          setStatus("completed");
          setTaskId(null);
          toast.success(t.ai.generator.toasts.completed);
          return;
        }

        if (data.status === "failed") {
          setStatus("failed");
          setErrorMessage(data.error || t.ai.generator.toasts.error);
          setTaskId(null);
          toast.error(t.ai.generator.toasts.error);
          return;
        }

        timeout = setTimeout(pollStatus, 2000);
      } catch (error) {
        if (cancelled) return;
        console.error("Image polling error:", error);
        setStatus("failed");
        setErrorMessage((error as Error).message ?? t.ai.generator.toasts.error);
        setTaskId(null);
        toast.error(t.ai.generator.toasts.error);
      }
    };

    pollStatus();

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [taskId, t]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const finalPrompt = prompt.trim();
      if (!finalPrompt) {
        toast.error(t.ai.generator.form.validation.requiredPrompt);
        return;
      }

      setIsSubmitting(true);
      setStatus("creating");
      setProgress(0);
      setImageUrl(null);
      setErrorMessage(null);
      setLastPrompt(finalPrompt);
      setElapsedSeconds(0);
      setEstimatedTime(null);
      setFrameAspectRatio(parseAspectRatio(size));

      try {
        const response = await fetch("/api/ai/images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            size,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || t.ai.generator.toasts.error);
        }

        setEstimatedTime(data.estimatedTime ?? null);
        setTaskId(data.taskId);
        setStatus("polling");
      } catch (error) {
        console.error("Image generation error:", error);
        setStatus("failed");
        setErrorMessage((error as Error).message ?? t.ai.generator.toasts.error);
        toast.error(t.ai.generator.toasts.error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [prompt, size, t.ai.generator.form.validation.requiredPrompt, t.ai.generator.toasts.error],
  );

  const handleNewRender = () => {
    setPrompt("");
    setImageUrl(null);
    setStatus("idle");
    setProgress(0);
    setEstimatedTime(null);
    setErrorMessage(null);
    setLastPrompt(null);
    setFrameAspectRatio(parseAspectRatio(size));
  };

  const handleDownloadPng = useCallback(async () => {
    if (!imageUrl || isDownloading) return;

    setIsDownloading(true);
    const triggerDownload = (blob: Blob) => {
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "loomai-output.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    };

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Failed to download image");
      }

      const blob = await response.blob();

      if (blob.type === "image/png") {
        triggerDownload(blob);
        return;
      }

      const imageBitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = imageBitmap.width || 1;
      canvas.height = imageBitmap.height || 1;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to create canvas context");
      }

      ctx.drawImage(imageBitmap, 0, 0);

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error("Failed to convert image to PNG"));
          }
        }, "image/png");
      });

      triggerDownload(pngBlob);
    } catch (error) {
      console.error("PNG download failed:", error);
      toast.error(t.ai.generator.toasts.error);
    } finally {
      setIsDownloading(false);
    }
  }, [imageUrl, isDownloading, t.ai.generator.toasts.error]);

  const formatElapsed = (seconds: number) => {
    if (seconds <= 0) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const samplePrompts = t.ai.generator.samples.items;
  const imageFrameStyle = frameAspectRatio ? { aspectRatio: frameAspectRatio } : undefined;

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="text-center space-y-4 pb-12">
          <Badge variant="secondary" className="text-xs uppercase tracking-wide">
            {t.ai.generator.badges.model}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t.ai.generator.title}
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">{t.ai.generator.subtitle}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <Badge variant="outline" className="gap-1">
              <Clock className="size-3.5" />
              {t.ai.generator.badges.turnaround}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <ImageIcon className="size-3.5" />
              {t.ai.generator.badges.usage}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t.ai.generator.form.title}</CardTitle>
              <CardDescription>{t.ai.generator.form.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="prompt">{t.ai.generator.form.promptLabel}</Label>
                  <Textarea
                    id="prompt"
                    minLength={5}
                    maxLength={2000}
                    rows={6}
                    placeholder={t.ai.generator.form.promptPlaceholder}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">{t.ai.generator.form.promptHelper}</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t.ai.generator.form.sizeLabel}</Label>
                    <Select value={size} onValueChange={(value) => setSize(value as AspectRatio)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t.ai.generator.form.sizePlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {ASPECT_RATIOS.map((ratio) => (
                          <SelectItem key={ratio} value={ratio}>
                            {t.ai.generator.form.ratioLabels[ratio] || ratio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">{t.ai.generator.form.sizeHelper}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.ai.generator.form.qualityLabel}</Label>
                    <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                      {t.ai.generator.form.qualityHelper}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {t.ai.generator.form.generating}
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        {t.ai.generator.form.submit}
                      </>
                    )}
                  </Button>
                  {status === "completed" && (
                    <Button type="button" variant="outline" onClick={handleNewRender} className="gap-2">
                      <RefreshCw className="size-4" />
                      {t.ai.generator.form.newRender}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.ai.generator.statusCard.title}</CardTitle>
                <CardDescription>{t.ai.generator.statusCard.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={status === "failed" ? "destructive" : status === "completed" ? "default" : "secondary"} className="gap-1">
                    {statusIcons[status]}
                    {statusLabels[status]}
                  </Badge>
                  {estimatedTime && (status === "creating" || status === "polling") && (
                    <Badge variant="outline">
                      {t.ai.generator.statusCard.eta.replace("{seconds}", `${estimatedTime}s`)}
                    </Badge>
                  )}
                  {(status === "creating" || status === "polling" || status === "completed") && (
                    <Badge variant="outline">
                      {t.ai.generator.statusCard.elapsed.replace("{time}", formatElapsed(elapsedSeconds))}
                    </Badge>
                  )}
                </div>

                {(status === "creating" || status === "polling") && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground">
                      {t.ai.generator.statusCard.progress.replace("{value}", `${progress}%`)}
                    </p>
                  </div>
                )}

                {errorMessage && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {errorMessage}
                  </div>
                )}

                {lastPrompt && (
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">{t.ai.generator.statusCard.lastPromptTitle}</p>
                    <p className="mt-1 text-sm text-foreground">{lastPrompt}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.ai.generator.samples.title}</CardTitle>
                <CardDescription>{t.ai.generator.samples.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {samplePrompts.map((sample: string) => (
                  <Button
                    key={sample}
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => setPrompt(sample)}
                  >
                    {sample}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t.ai.generator.result.title}</CardTitle>
            <CardDescription>{t.ai.generator.result.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {imageUrl ? (
              <div className="space-y-4">
                <div
                  className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border bg-muted/20 p-2 shadow-sm max-h-[80vh]"
                  style={imageFrameStyle}
                >
                  <img
                    src={imageUrl}
                    alt={t.ai.generator.result.alt}
                    className="h-full w-full rounded-xl object-contain shadow-lg"
                    onLoad={(event) => {
                      const { naturalWidth, naturalHeight } = event.currentTarget;
                      if (naturalWidth && naturalHeight) {
                        setFrameAspectRatio(naturalWidth / naturalHeight);
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" className="gap-2" onClick={handleDownloadPng} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                    {t.ai.generator.result.download} PNG
                  </Button>
                  <Button type="button" variant="outline" onClick={handleNewRender} className="gap-2">
                    <RefreshCw className="size-4" />
                    {t.ai.generator.result.newPrompt}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <div className="flex flex-col justify-center gap-2 rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
                  <Sparkles className="mx-auto size-8 text-primary" />
                  <p className="text-lg font-medium">{t.ai.generator.result.emptyTitle}</p>
                  <p>{t.ai.generator.result.emptyDescription}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
