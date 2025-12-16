'use client';

import type { DragEvent, ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  UploadCloud,
  X,
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
import { addAiGenerationHistoryItem } from "@/lib/ai-history";

const ASPECT_RATIOS = ["auto", "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"] as const;
const MAX_REFERENCE_IMAGES = 5;
const MAX_REFERENCE_SIZE = 10 * 1024 * 1024; // 10 MB

type GenerationStatus = "idle" | "creating" | "polling" | "completed" | "failed";
type AspectRatio = (typeof ASPECT_RATIOS)[number];

const parseAspectRatio = (value: AspectRatio) => {
  const [width, height] = value.split(":").map(Number);
  if (!width || !height) return undefined;
  return width / height;
};

// Reads a File into a data URL for upload payloads
function encodeFileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read file"));
      }
    };
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

export default function LookbookGeneratorPage() {
  const { t, locale } = useTranslation();
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
  const [referenceImages, setReferenceImages] = useState<Array<{ id: string; file: File; preview: string }>>([]);
  const referenceInputRef = useRef<HTMLInputElement | null>(null);
  const referenceStoreRef = useRef(referenceImages);
  const [renderCreatedAt, setRenderCreatedAt] = useState<string | null>(null);
  const [renderModel, setRenderModel] = useState<string | null>(null);

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

  const statusIcons: Record<GenerationStatus, ReactElement> = {
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
          if (taskId && lastPrompt) {
            addAiGenerationHistoryItem({
              id: taskId,
              tool: "lookbook",
              imageUrl: data.imageUrl,
              prompt: lastPrompt,
              model: renderModel ?? "z-image-turbo",
              createdAt: renderCreatedAt ?? new Date().toISOString(),
            });
          }
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
      setRenderCreatedAt(new Date().toISOString());
      setRenderModel(referenceImages.length ? "nano-banana-2-lite" : "z-image-turbo");
      setElapsedSeconds(0);
      setEstimatedTime(null);
      setFrameAspectRatio(parseAspectRatio(size));

      try {
        let referencesPayload:
          | Array<{
              dataUrl: string;
              mimeType: string;
              size: number;
            }>
          | undefined;

        if (referenceImages.length) {
          referencesPayload = await Promise.all(
            referenceImages.map(async (item) => ({
              dataUrl: await encodeFileToDataUrl(item.file),
              mimeType: item.file.type,
              size: item.file.size,
            })),
          );
        }

        const response = await fetch("/api/ai/images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            size,
            references: referencesPayload,
          }),
        });

        if (response.status === 401) {
          toast.error(locale === "en" ? "Please sign in to use this feature." : "请先登录后使用该功能。");
          const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/${locale}/signin?returnTo=${returnTo}`;
          return;
        }

        const data = await response.json().catch(() => ({} as any));

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
    [
      prompt,
      referenceImages,
      size,
      encodeFileToDataUrl,
      t.ai.generator.form.validation.requiredPrompt,
      t.ai.generator.toasts.error,
    ],
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
  const referenceSlotsRemaining = MAX_REFERENCE_IMAGES - referenceImages.length;
  const sectionLinks = [
    { id: "fusion", label: t.ai.generator.sectionNav.fusion },
    { id: "prompt", label: t.ai.generator.sectionNav.prompt },
    { id: "status", label: t.ai.generator.sectionNav.status },
    { id: "result", label: t.ai.generator.sectionNav.result },
  ];

  useEffect(() => {
    referenceStoreRef.current = referenceImages;
  }, [referenceImages]);

  useEffect(() => {
    return () => {
      referenceStoreRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, []);

  const createReferenceId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2);
  };

  const addReferenceFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const availableSlots = MAX_REFERENCE_IMAGES - referenceImages.length;
      if (availableSlots <= 0) {
        toast.error(t.ai.generator.fusion.errors.maxFiles);
        return;
      }

      const files = Array.from(fileList).slice(0, availableSlots);
      const accepted: Array<{ id: string; file: File; preview: string }> = [];

      files.forEach((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(t.ai.generator.fusion.errors.invalidType);
          return;
        }

        if (file.size > MAX_REFERENCE_SIZE) {
          toast.error(t.ai.generator.fusion.errors.fileTooLarge);
          return;
        }

        accepted.push({
          id: createReferenceId(),
          file,
          preview: URL.createObjectURL(file),
        });
      });

      if (accepted.length) {
        setReferenceImages((prev) => [...prev, ...accepted]);
      }
    },
    [referenceImages.length, t.ai.generator.fusion.errors.fileTooLarge, t.ai.generator.fusion.errors.invalidType, t.ai.generator.fusion.errors.maxFiles],
  );

  const removeReferenceImage = useCallback((id: string) => {
    setReferenceImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const handleReferenceDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      addReferenceFiles(event.dataTransfer.files);
    },
    [addReferenceFiles],
  );

  const handleReferencePicker = () => {
    referenceInputRef.current?.click();
  };

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
                <input
                  ref={referenceInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    addReferenceFiles(event.target.files);
                    if (event.target) {
                      event.target.value = "";
                    }
                  }}
                />

                <div className="space-y-3" id="prompt">
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
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <p>{t.ai.generator.form.promptHelper}</p>
                    <span>
                      {prompt.length}/2000
                    </span>
                  </div>
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

                <div className="space-y-3 rounded-xl border bg-muted/10 p-4" id="fusion">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">
                        {t.ai.generator.fusion.title} · {t.ai.generator.fusion.badge}
                      </Label>
                      <p className="text-xs text-muted-foreground">{t.ai.generator.fusion.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {t.ai.generator.fusion.optionalLabel || "可选"}
                    </Badge>
                  </div>

                  <div
                    className="rounded-lg border-2 border-dashed border-muted-foreground/30 bg-background/60 p-4 transition hover:border-muted-foreground/60"
                    onDrop={handleReferenceDrop}
                    onDragOver={(event) => event.preventDefault()}
                    onClick={handleReferencePicker}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleReferencePicker();
                      }
                    }}
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                      <UploadCloud className="size-6 text-muted-foreground" />
                      <p className="text-sm text-foreground">{t.ai.generator.fusion.cta}</p>
                      <p className="text-xs">{t.ai.generator.fusion.helper}</p>
                    </div>

                    {referenceImages.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {referenceImages.map((image, index) => (
                            <div key={image.id} className="group relative overflow-hidden rounded-lg border bg-background/80">
                              <img
                                src={image.preview}
                                alt={t.ai.generator.fusion.previewAlt.replace("{index}", `${index + 1}`)}
                                className="h-48 w-full object-cover"
                              />
                              <div className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow">
                                {t.ai.generator.fusion.photoLabel.replace("{index}", `${index + 1}`)}
                              </div>
                              <button
                                type="button"
                                className="absolute right-2 top-2 rounded-full bg-background/90 p-1 text-muted-foreground shadow hover:bg-background hover:text-foreground"
                                onClick={() => removeReferenceImage(image.id)}
                                aria-label={t.ai.generator.fusion.removeLabel}
                              >
                                <X className="size-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                          <p>{t.ai.generator.fusion.orderHint}</p>
                          {referenceSlotsRemaining > 0 && (
                            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleReferencePicker}>
                              <UploadCloud className="size-3.5" />
                              {t.ai.generator.fusion.addMore.replace("{count}", `${referenceSlotsRemaining}`)}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{t.ai.generator.fusion.limit}</p>
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
            <Card id="status">
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

            <Card id="result">
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
