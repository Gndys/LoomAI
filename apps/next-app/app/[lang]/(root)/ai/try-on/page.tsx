"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Sparkles, UploadCloud, Repeat, AlertTriangle, Clock, Image as ImageIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type GenerationStatus = "idle" | "creating" | "polling" | "completed" | "failed";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

interface TryOnHistoryItem {
  id: string;
  url: string;
  timestamp: string;
  garmentLabel: string;
}

export default function VirtualTryOnPage() {
  const { t } = useTranslation();
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [modelPreview, setModelPreview] = useState<string | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const modelInputRef = useRef<HTMLInputElement | null>(null);
  const garmentInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [backgroundMode, setBackgroundMode] = useState("preserve");
  const [fitTightness, setFitTightness] = useState(60);
  const [preserveAccessories, setPreserveAccessories] = useState(true);
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState<TryOnHistoryItem[]>([]);
  const [garmentLabel, setGarmentLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const heroHighlights = t.ai.tryOn.hero.highlights ?? [];

  const statusLabels = useMemo(
    () => ({
      idle: t.ai.tryOn.status.idle,
      creating: t.ai.tryOn.status.creating,
      polling: t.ai.tryOn.status.polling,
      completed: t.ai.tryOn.status.completed,
      failed: t.ai.tryOn.status.failed,
    }),
    [t],
  );

  const statusIcons: Record<GenerationStatus, JSX.Element> = {
    idle: <Sparkles className="size-3.5" />,
    creating: <UploadCloud className="size-3.5 animate-spin" />,
    polling: <Clock className="size-3.5 animate-spin" />,
    completed: <ImageIcon className="size-3.5" />,
    failed: <AlertTriangle className="size-3.5" />,
  };

  useEffect(() => {
    const urls = [modelPreview, garmentPreview];
    return () => {
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [modelPreview, garmentPreview]);

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

  const backgroundOptions = useMemo(() => t.ai.tryOn.controls.backgroundOptions, [t]);

  const makePreview = (file: File, setter: (url: string) => void) => {
    const url = URL.createObjectURL(file);
    setter(url);
  };

  const validateFile = (file: File | undefined | null) => {
    if (!file) return false;
    if (!file.type.startsWith("image/")) {
      toast.error(t.ai.tryOn.toasts.invalidFileType);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t.ai.tryOn.toasts.fileTooLarge);
      return false;
    }
    return true;
  };

  const handleModelUpload = (file: File | null) => {
    if (!file) {
      setModelFile(null);
      setModelPreview(null);
      return;
    }
    if (!validateFile(file)) return;
    setModelFile(file);
    setImageUrl(null);
    makePreview(file, (url) => setModelPreview(url));
  };

  const handleGarmentUpload = (file: File | null) => {
    if (!file) {
      setGarmentFile(null);
      setGarmentPreview(null);
      setGarmentLabel("");
      return;
    }
    if (!validateFile(file)) return;
    setGarmentFile(file);
    setGarmentLabel(file.name.replace(/\.[^.]+$/, ""));
    setImageUrl(null);
    makePreview(file, (url) => setGarmentPreview(url));
  };

  const resetAll = () => {
    setModelFile(null);
    setGarmentFile(null);
    setModelPreview(null);
    setGarmentPreview(null);
    setStatus("idle");
    setTaskId(null);
    setProgress(0);
    setEstimatedTime(null);
    setImageUrl(null);
    setGarmentLabel("");
    setNotes("");
    setHistory([]);
  };

  const startTryOn = async () => {
    if (!modelFile) {
      toast.error(t.ai.tryOn.toasts.modelRequired);
      return;
    }
    if (!garmentFile) {
      toast.error(t.ai.tryOn.toasts.garmentRequired);
      return;
    }

    setIsSubmitting(true);
    setStatus("creating");
    setProgress(0);
    setEstimatedTime(null);
    setImageUrl(null);
    setTaskId(null);

    const formData = new FormData();
    formData.append("modelImage", modelFile);
    formData.append("garmentImage", garmentFile);
    formData.append("backgroundMode", backgroundMode);
    formData.append("fitTightness", fitTightness.toString());
    formData.append("preserveAccessories", preserveAccessories ? "true" : "false");
    formData.append("notes", notes);

    try {
      const response = await fetch("/api/ai/try-on", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t.ai.tryOn.toasts.error);
      }
      setTaskId(data.taskId);
      setEstimatedTime(data.estimatedTime ?? null);
      setStatus("polling");
    } catch (error) {
      console.error("Try-on error:", error);
      toast.error((error as Error).message ?? t.ai.tryOn.toasts.error);
      setStatus("failed");
      setTaskId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!taskId) return;
    let cancelled = false;
    let timeout: NodeJS.Timeout | undefined;

    const poll = async () => {
      try {
        const response = await fetch(`/api/ai/images/${taskId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || t.ai.tryOn.toasts.error);
        }
        if (cancelled) return;
        setProgress(data.progress ?? 0);
        if (data.status === "completed" && data.imageUrl) {
          const completedTaskId =
            data.taskId ??
            taskId ??
            (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
          setStatus("completed");
          setTaskId(null);
          setImageUrl(data.imageUrl);
          toast.success(t.ai.tryOn.toasts.completed);
          setHistory((prev) => [
            {
              id: completedTaskId,
              url: data.imageUrl,
              timestamp: new Date().toISOString(),
              garmentLabel: garmentLabel || t.ai.tryOn.history.defaultLabel,
            },
            ...prev,
          ]);
          return;
        }
        if (data.status === "failed") {
          setStatus("failed");
          setTaskId(null);
          toast.error(data.error || t.ai.tryOn.toasts.error);
          return;
        }
        timeout = setTimeout(poll, 2000);
      } catch (error) {
        if (cancelled) return;
        console.error("Try-on polling error:", error);
        setStatus("failed");
        setTaskId(null);
        toast.error((error as Error).message ?? t.ai.tryOn.toasts.error);
      }
    };

    poll();
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [taskId, t, garmentLabel]);

  const downloadImage = useCallback(
    async (url: string, filename: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to download image");
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error("Download failed:", error);
        toast.error(t.ai.tryOn.toasts.error);
      }
    },
    [t],
  );

  const formatElapsed = (seconds: number) => {
    if (seconds <= 0) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="text-center space-y-3 pb-10">
          <Badge variant="secondary" className="uppercase tracking-wide text-xs">
            {t.ai.tryOn.hero.badge}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t.ai.tryOn.hero.title}
          </h1>
          <p className="text-lg text-muted-foreground mx-auto max-w-3xl">{t.ai.tryOn.hero.subtitle}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {heroHighlights.map((highlight: string) => (
              <Badge key={highlight} variant="outline" className="text-xs">
                {highlight}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>{t.ai.tryOn.uploadSection.title}</CardTitle>
              <CardDescription>{t.ai.tryOn.uploadSection.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <UploadPanel
                  title={t.ai.tryOn.modelUpload.title}
                  description={t.ai.tryOn.modelUpload.description}
                  previewUrl={modelPreview}
                  fileName={modelFile?.name}
                  inputRef={modelInputRef}
                  onFile={handleModelUpload}
                  helper={t.ai.tryOn.modelUpload.helper}
                  limitText={t.ai.tryOn.uploadSection.limit}
                  replaceLabel={t.ai.tryOn.uploadSection.replace}
                  clearLabel={t.ai.tryOn.uploadSection.clear}
                />
                <UploadPanel
                  title={t.ai.tryOn.garmentUpload.title}
                  description={t.ai.tryOn.garmentUpload.description}
                  previewUrl={garmentPreview}
                  fileName={garmentFile?.name}
                  inputRef={garmentInputRef}
                  onFile={handleGarmentUpload}
                  helper={t.ai.tryOn.garmentUpload.helper}
                  limitText={t.ai.tryOn.uploadSection.limit}
                  replaceLabel={t.ai.tryOn.uploadSection.replace}
                  clearLabel={t.ai.tryOn.uploadSection.clear}
                />
              </div>

              <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t.ai.tryOn.controls.backgroundLabel}</Label>
                    <Select value={backgroundMode} onValueChange={setBackgroundMode}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.ai.tryOn.controls.backgroundPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {backgroundOptions.map((option: { value: string; label: string; helper: string }) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">{option.label}</p>
                              <p className="text-xs text-muted-foreground">{option.helper}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>{t.ai.tryOn.controls.fitLabel}</Label>
                      <span className="text-xs text-muted-foreground">{fitTightness}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={fitTightness}
                      onChange={(event) => setFitTightness(Number(event.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">{t.ai.tryOn.controls.fitHelper}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t.ai.tryOn.controls.accessoriesLabel}</Label>
                      <p className="text-xs text-muted-foreground">{t.ai.tryOn.controls.accessoriesHelper}</p>
                    </div>
                    <Switch checked={preserveAccessories} onCheckedChange={setPreserveAccessories} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t.ai.tryOn.controls.notesLabel}</Label>
                  <Textarea
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder={t.ai.tryOn.controls.notesPlaceholder}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              <Button type="button" className="gap-2" onClick={startTryOn} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Repeat className="size-4 animate-spin" />
                    {t.ai.tryOn.actions.generating}
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    {t.ai.tryOn.actions.cta}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetAll}>
                {t.ai.tryOn.actions.reset}
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.ai.tryOn.statusCard.title}</CardTitle>
                <CardDescription>{t.ai.tryOn.statusCard.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={status === "failed" ? "destructive" : status === "completed" ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {statusIcons[status]}
                    {statusLabels[status]}
                  </Badge>
                  {estimatedTime && (status === "creating" || status === "polling") && (
                    <Badge variant="outline">
                      {t.ai.tryOn.statusCard.eta.replace("{seconds}", `${estimatedTime}s`)}
                    </Badge>
                  )}
                  {(status === "creating" || status === "polling" || status === "completed") && (
                    <Badge variant="outline">
                      {t.ai.tryOn.statusCard.elapsed.replace("{time}", formatElapsed(elapsedSeconds))}
                    </Badge>
                  )}
                </div>
                {(status === "creating" || status === "polling") && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-xs text-muted-foreground">
                      {t.ai.tryOn.statusCard.progress.replace("{value}", `${progress}%`)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.ai.tryOn.result.title}</CardTitle>
                <CardDescription>{t.ai.tryOn.result.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {imageUrl ? (
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border">
                      <img src={imageUrl} alt={t.ai.tryOn.result.alt} className="w-full object-cover" />
                    </div>
                    <Button
                      type="button"
                      className="gap-2"
                      onClick={() => downloadImage(imageUrl, garmentLabel || "loomai-tryon")}
                    >
                      <Download className="size-4" />
                      {t.ai.tryOn.result.download}
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-muted-foreground/30 p-6 text-center">
                    <p className="text-sm font-medium text-foreground">{t.ai.tryOn.result.emptyTitle}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t.ai.tryOn.result.emptyDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-foreground">{t.ai.tryOn.history.title}</h2>
            <p className="text-muted-foreground">{t.ai.tryOn.history.subtitle}</p>
          </div>
          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-muted-foreground/30 p-8 text-center">
              <p className="text-sm font-semibold text-foreground">{t.ai.tryOn.history.emptyTitle}</p>
              <p className="text-sm text-muted-foreground">{t.ai.tryOn.history.emptyDescription}</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {history.map((item) => (
                <Card key={item.id}>
                  <CardContent className="space-y-4 pt-6">
                    <div className="overflow-hidden rounded-xl border">
                      <img src={item.url} alt={item.garmentLabel} className="w-full object-cover" />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.garmentLabel}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.ai.tryOn.history.generatedAt.replace(
                            "{time}",
                            new Date(item.timestamp).toLocaleString(),
                          )}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => downloadImage(item.url, item.garmentLabel.replace(/\s+/g, "-").toLowerCase())}
                      >
                        <Download className="size-3.5" />
                        {t.ai.tryOn.history.download}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface UploadPanelProps {
  title: string;
  description: string;
  helper: string;
  limitText: string;
  replaceLabel: string;
  clearLabel: string;
  previewUrl: string | null;
  fileName?: string;
  onFile: (file: File | null) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

function UploadPanel({
  title,
  description,
  helper,
  limitText,
  replaceLabel,
  clearLabel,
  previewUrl,
  fileName,
  onFile,
  inputRef,
}: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div
        className={cn(
          "mt-3 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isDragging) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
      >
        {previewUrl ? (
          <div className="relative w-full overflow-hidden rounded-xl">
            <img src={previewUrl} alt={title} className="h-auto w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-3 space-y-0.5 text-left text-white">
              <p className="text-xs uppercase tracking-wide opacity-80">{helper}</p>
              <p className="text-sm font-medium">{fileName}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <UploadCloud className="mx-auto size-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{helper}</p>
              <p className="text-xs text-muted-foreground">{limitText}</p>
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button type="button" size="sm" onClick={() => inputRef.current?.click()}>
            {replaceLabel}
          </Button>
          {previewUrl && (
            <Button type="button" size="sm" variant="outline" onClick={() => onFile(null)}>
              {clearLabel}
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            onFile(file ?? null);
          }}
        />
      </div>
    </div>
  );
}
