"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransition } from "react";
import {
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  Download,
  UploadCloud,
} from "lucide-react";

const ASPECT_RATIOS = ["auto", "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"] as const;
const QUALITY_OPTIONS = ["1K", "2K", "4K"] as const;
const MODEL_OPTIONS = ["z-image-turbo", "nano-banana-2-lite", "gemini-3-pro-image-preview"] as const;
const MAX_REFERENCE_IMAGES = 5;
const MAX_UPLOAD_MB = 10;

type AspectRatio = (typeof ASPECT_RATIOS)[number];
type Quality = (typeof QUALITY_OPTIONS)[number];
type Model = (typeof MODEL_OPTIONS)[number];
type GenerationStatus = "idle" | "creating" | "polling" | "completed" | "failed";

type Scenario = { title: string; prompt: string; helper?: string };
type ReferenceItem = { id: string; url: string };

export default function NanoBananaLabPage() {
  const { t } = useTranslation();
  const scenarios: Scenario[] = t.ai.nanoBanana.scenarios ?? [];
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<Model>("z-image-turbo");
  const [size, setSize] = useState<AspectRatio>("3:4");
  const [quality, setQuality] = useState<Quality>("2K");
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      timer = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
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
        console.error("Nano Banana polling error:", error);
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

  const handleScenario = (scenarioPrompt: string) => {
    setPrompt(scenarioPrompt);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files?.length) return;
    const currentCount = references.length;
    if (currentCount >= MAX_REFERENCE_IMAGES) {
      toast.error(t.ai.nanoBanana.toasts.maxFiles ?? "Reached max images");
      return;
    }

    const incoming = Array.from(files).slice(0, MAX_REFERENCE_IMAGES - currentCount);
    startUpload(async () => {
      const uploaded: ReferenceItem[] = [];
      for (const file of incoming) {
        if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
          toast.error(t.ai.nanoBanana.toasts.fileTooLarge);
          continue;
        }
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/uploads", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || t.ai.nanoBanana.toasts.error);
          continue;
        }
        uploaded.push({ id: `${Date.now()}-${file.name}-${Math.random().toString(16).slice(2)}`, url: data.url });
      }
      if (uploaded.length) {
        setReferences((prev) => [...prev, ...uploaded].slice(0, MAX_REFERENCE_IMAGES));
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const finalPrompt = prompt.trim();
      if (!finalPrompt) {
        toast.error(t.ai.nanoBanana.toasts.requiredPrompt);
        return;
      }

      setIsSubmitting(true);
      setStatus("creating");
      setProgress(0);
      setImageUrl(null);
      setErrorMessage(null);
      setElapsedSeconds(0);
      setEstimatedTime(null);

      try {
        const referenceUrls = references.map((item) => item.url).slice(0, MAX_REFERENCE_IMAGES);

        const response = await fetch("/api/ai/nano-banana", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: finalPrompt,
            model,
            size,
            quality,
            referenceUrls: referenceUrls.length ? referenceUrls : undefined,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || t.ai.nanoBanana.toasts.error);
        }

        setEstimatedTime(data.estimatedTime ?? null);
        setTaskId(data.taskId);
        setStatus("polling");
      } catch (error) {
        console.error("Nano Banana generation error:", error);
        setStatus("failed");
        setErrorMessage((error as Error).message ?? t.ai.nanoBanana.toasts.error);
        toast.error(t.ai.nanoBanana.toasts.error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [prompt, model, size, quality, references, t],
  );

  const handleReset = () => {
    setPrompt("");
    setModel("z-image-turbo");
    setReferences([]);
    setImageUrl(null);
    setStatus("idle");
    setProgress(0);
    setTaskId(null);
    setEstimatedTime(null);
    setErrorMessage(null);
    setElapsedSeconds(0);
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      setIsDownloading(true);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "nano-banana-image.png";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error(t.ai.generator.toasts.downloadError ?? "Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{t.ai.nanoBanana.badges.model}</Badge>
          <Badge variant="outline">{t.ai.nanoBanana.badges.async}</Badge>
          <Badge variant="outline">{t.ai.nanoBanana.badges.expiry}</Badge>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{t.ai.nanoBanana.title}</h1>
          <p className="text-muted-foreground max-w-3xl">{t.ai.nanoBanana.subtitle}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.ai.nanoBanana.promptTitle}</CardTitle>
            <CardDescription>{t.ai.nanoBanana.promptDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {scenarios.map((scenario) => (
                <Button
                  key={scenario.title}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleScenario(scenario.prompt)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {scenario.title}
                </Button>
              ))}
            </div>
      <div className="space-y-2">
        <Label htmlFor="prompt">{t.ai.nanoBanana.promptLabel}</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={t.ai.nanoBanana.promptPlaceholder}
          className="min-h-[140px]"
        />
        <p className="text-xs text-muted-foreground">{t.ai.nanoBanana.promptHelper}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>{t.ai.nanoBanana.sizeLabel}</Label>
          <Select value={size} onValueChange={(value) => setSize(value as AspectRatio)}>
            <SelectTrigger>
              <SelectValue placeholder="Select ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASPECT_RATIOS.map((ratio) => (
                      <SelectItem key={ratio} value={ratio}>
                        {ratio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
        </div>
        <div className="space-y-2">
          <Label>{t.ai.nanoBanana.qualityLabel}</Label>
          <Select value={quality} onValueChange={(value) => setQuality(value as Quality)}>
            <SelectTrigger>
                    <SelectValue placeholder="Quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALITY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t.ai.nanoBanana.qualityHelper}</p>
      </div>
      <div className="space-y-2">
        <Label>{t.ai.nanoBanana.modelLabel}</Label>
        <Select value={model} onValueChange={(value) => setModel(value as Model)}>
          <SelectTrigger>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {t.ai.nanoBanana.models?.[option] ?? option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t.ai.nanoBanana.modelHelper}</p>
      </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.ai.nanoBanana.referencesTitle}</CardTitle>
            <CardDescription>{t.ai.nanoBanana.referencesDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className="border border-dashed rounded-md p-4 text-center hover:border-primary/70 transition cursor-pointer"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFileUpload(event.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm text-foreground">{t.ai.nanoBanana.referencesCta}</p>
              <p className="text-xs text-muted-foreground">{t.ai.nanoBanana.referencesHelper}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => handleFileUpload(event.target.files)}
              />
              {isUploading && (
                <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.ai.nanoBanana.uploading}
                </div>
              )}
            </div>
            {references.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {references.map((item, index) => (
                  <div key={item.id} className="relative rounded-md overflow-hidden border">
                    <img src={item.url} alt={`Reference ${index + 1}`} className="aspect-square object-cover" />
                    <div className="absolute top-1 left-1">
                      <Badge variant="outline">{index + 1}</Badge>
                    </div>
                    <button
                      className="absolute top-1 right-1 rounded-full bg-background/80 px-2 text-xs border"
                      onClick={(event) => {
                        event.stopPropagation();
                        setReferences((prev) => prev.filter((ref) => ref.id !== item.id));
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">{t.ai.nanoBanana.referenceHint}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="space-y-1.5">
            <CardTitle>{t.ai.nanoBanana.statusTitle}</CardTitle>
            <CardDescription>{t.ai.nanoBanana.statusDescription}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {statusIcons[status]}
              {statusLabels[status]}
            </Badge>
            <Badge variant="outline">{progress}%</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1" />
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {elapsedSeconds}s
              {estimatedTime ? ` • ~${estimatedTime}s ETA` : ""}
            </div>
          </div>
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" form="nano-form" disabled={isSubmitting || status === "polling"}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.ai.nanoBanana.generating}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t.ai.nanoBanana.generateCta}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t.ai.nanoBanana.resetCta}
            </Button>
            {imageUrl && (
              <Button type="button" variant="secondary" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.ai.nanoBanana.downloading}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t.ai.nanoBanana.downloadCta}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <form id="nano-form" className="grid lg:grid-cols-3 gap-6" onSubmit={handleSubmit}>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.ai.nanoBanana.resultTitle}</CardTitle>
            <CardDescription>{t.ai.nanoBanana.resultDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            {status === "completed" && imageUrl ? (
              <div className="relative overflow-hidden rounded-lg border bg-muted">
                <img src={imageUrl} alt="Generated" className="w-full object-contain" />
              </div>
            ) : status === "failed" ? (
              <div className="flex items-center justify-center py-12 text-destructive">
                <AlertTriangle className="mr-2 h-5 w-5" />
                {t.ai.nanoBanana.errorState}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <Skeleton key={index} className="aspect-[3/4] rounded-lg" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.ai.nanoBanana.checklistTitle}</CardTitle>
            <CardDescription>{t.ai.nanoBanana.checklistDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <ImageIcon className="h-4 w-4 mt-0.5 text-foreground" />
              <p>{t.ai.nanoBanana.checklistItems.references}</p>
            </div>
            <div className="flex gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 text-foreground" />
              <p>{t.ai.nanoBanana.checklistItems.prompt}</p>
            </div>
            <div className="flex gap-2">
              <Check className="h-4 w-4 mt-0.5 text-foreground" />
              <p>{t.ai.nanoBanana.checklistItems.quality}</p>
            </div>
            <div className="flex gap-2">
              <RefreshCw className="h-4 w-4 mt-0.5 text-foreground" />
              <p>{t.ai.nanoBanana.checklistItems.model}</p>
            </div>
            <div className="pt-2 text-xs text-muted-foreground">
              {t.ai.nanoBanana.linkNotice}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
