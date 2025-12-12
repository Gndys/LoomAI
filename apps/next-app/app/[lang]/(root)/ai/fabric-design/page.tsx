"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Layers,
  Wand2,
  UploadCloud,
  Download,
  AlertTriangle,
  Clock,
  Image as ImageIcon,
  Play,
  XCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type GenerationStatus = "idle" | "creating" | "polling" | "completed" | "failed";
const FABRIC_KEYS = ["silk", "denim", "knit", "custom"] as const;
type FabricType = (typeof FABRIC_KEYS)[number];

interface FabricJobConfig {
  fabric: FabricType;
  fabricLabel: string;
  patternPrompt: string;
  advancedPrompt: string;
  textureStrength: number;
  patternScale: number;
  lockModel: boolean;
  preserveBackground: boolean;
}

interface GalleryItem {
  id: string;
  url: string;
  fabricLabel: string;
  fabricType: FabricType;
  timestamp: string;
  patternPrompt: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function FabricDesignPage() {
  const { t } = useTranslation();
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFabrics, setSelectedFabrics] = useState<Set<FabricType>>(() => new Set<FabricType>(["silk"]));
  const [customFabricName, setCustomFabricName] = useState("");
  const [patternPrompt, setPatternPrompt] = useState("");
  const [advancedNotes, setAdvancedNotes] = useState("");
  const [textureStrength, setTextureStrength] = useState(60);
  const [patternScale, setPatternScale] = useState(100);
  const [lockModel, setLockModel] = useState(true);
  const [preserveBackground, setPreserveBackground] = useState(true);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<FabricJobConfig | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const jobQueueRef = useRef<FabricJobConfig[]>([]);

  const heroHighlights = t.ai.fabricDesigner.hero.highlights ?? [];

  const featureCards = [
    {
      icon: <Layers className="size-5 text-primary" />,
      title: t.ai.fabricDesigner.featureCards.materialSwap.title,
      description: t.ai.fabricDesigner.featureCards.materialSwap.description,
    },
    {
      icon: <Wand2 className="size-5 text-primary" />,
      title: t.ai.fabricDesigner.featureCards.textureLab.title,
      description: t.ai.fabricDesigner.featureCards.textureLab.description,
    },
    {
      icon: <Sparkles className="size-5 text-primary" />,
      title: t.ai.fabricDesigner.featureCards.previewDeck.title,
      description: t.ai.fabricDesigner.featureCards.previewDeck.description,
    },
  ];

  const fabricOptions = useMemo(
    () => [
      {
        key: "silk" as FabricType,
        title: t.ai.fabricDesigner.fabrics.silk.title,
        description: t.ai.fabricDesigner.fabrics.silk.description,
      },
      {
        key: "denim" as FabricType,
        title: t.ai.fabricDesigner.fabrics.denim.title,
        description: t.ai.fabricDesigner.fabrics.denim.description,
      },
      {
        key: "knit" as FabricType,
        title: t.ai.fabricDesigner.fabrics.knit.title,
        description: t.ai.fabricDesigner.fabrics.knit.description,
      },
      {
        key: "custom" as FabricType,
        title: t.ai.fabricDesigner.fabrics.custom.title,
        description: t.ai.fabricDesigner.fabrics.custom.description,
      },
    ],
    [t],
  );

  const fabricLabelMap: Record<FabricType, string> = {
    silk: fabricOptions[0]?.title ?? "Silk",
    denim: fabricOptions[1]?.title ?? "Denim",
    knit: fabricOptions[2]?.title ?? "Knit",
    custom: customFabricName.trim() || t.ai.fabricDesigner.customFabric.placeholder,
  };

  const statusLabels = useMemo(
    () => ({
      idle: t.ai.fabricDesigner.status.idle,
      creating: t.ai.fabricDesigner.status.creating,
      polling: t.ai.fabricDesigner.status.polling,
      completed: t.ai.fabricDesigner.status.completed,
      failed: t.ai.fabricDesigner.status.failed,
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
    if (!previewUrl) return () => {};
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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

  const handleFileSelection = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t.ai.fabricDesigner.toasts.invalidFileType);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t.ai.fabricDesigner.toasts.fileTooLarge);
      return;
    }

    setReferenceFile(file);
    setImageUrl(null);
    setGallery([]);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const toggleFabric = (fabric: FabricType) => {
    setSelectedFabrics((prev) => {
      const next = new Set(prev);
      if (next.has(fabric)) {
        next.delete(fabric);
      } else {
        next.add(fabric);
      }
      return next;
    });
  };

  const handleResetReference = () => {
    setReferenceFile(null);
    setPreviewUrl(null);
    setImageUrl(null);
    setGallery([]);
  };

  const downloadImage = useCallback(async (url: string, prefix: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to download image");
      }
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${prefix}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(t.ai.fabricDesigner.toasts.error);
    }
  }, [t]);

  const runJob = useCallback(
    async (job: FabricJobConfig) => {
      if (!referenceFile) {
        toast.error(t.ai.fabricDesigner.toasts.imageRequired);
        return;
      }

      setActiveJob(job);
      setStatus("creating");
      setProgress(0);
      setEstimatedTime(null);
      setTaskId(null);
      setImageUrl(null);
      setElapsedSeconds(0);

      const formData = new FormData();
      formData.append("image", referenceFile);
      formData.append("fabricType", job.fabric);
      formData.append("fabricLabel", job.fabricLabel);
      formData.append("patternPrompt", job.patternPrompt);
      formData.append("advancedPrompt", job.advancedPrompt);
      formData.append("textureStrength", job.textureStrength.toString());
      formData.append("patternScale", job.patternScale.toString());
      formData.append("lockModel", job.lockModel ? "true" : "false");
      formData.append("preserveBackground", job.preserveBackground ? "true" : "false");

      try {
        const response = await fetch("/api/ai/fabric", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || t.ai.fabricDesigner.toasts.error);
        }

        setTaskId(data.taskId);
        setEstimatedTime(data.estimatedTime ?? null);
        setStatus("polling");
      } catch (error) {
        console.error("Fabric generation error:", error);
        setStatus("failed");
        setTaskId(null);
        jobQueueRef.current = [];
        setActiveJob(null);
        toast.error((error as Error).message ?? t.ai.fabricDesigner.toasts.error);
      }
    },
    [referenceFile, t],
  );

  useEffect(() => {
    if (!taskId) return;

    let cancelled = false;
    let timeout: NodeJS.Timeout | undefined;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/ai/images/${taskId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || t.ai.fabricDesigner.toasts.error);
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
          const jobSnapshot = activeJob;
          setImageUrl(data.imageUrl);
          setStatus("completed");
          setTaskId(null);
          toast.success(t.ai.fabricDesigner.toasts.completed);

          if (jobSnapshot) {
            setGallery((prev) => [
              {
                id: completedTaskId,
                url: data.imageUrl,
                fabricLabel: jobSnapshot.fabricLabel,
                fabricType: jobSnapshot.fabric,
                timestamp: new Date().toISOString(),
                patternPrompt: jobSnapshot.patternPrompt,
              },
              ...prev,
            ]);
          }

          if (jobQueueRef.current.length > 0) {
            const [nextJob, ...rest] = jobQueueRef.current;
            jobQueueRef.current = rest;
            runJob(nextJob).catch((error) => {
              console.error("Failed to start queued job:", error);
            });
          } else {
            setActiveJob(null);
          }

          return;
        }

        if (data.status === "failed") {
          setStatus("failed");
          setTaskId(null);
          jobQueueRef.current = [];
          setActiveJob(null);
          toast.error(data.error || t.ai.fabricDesigner.toasts.error);
          return;
        }

        timeout = setTimeout(pollStatus, 2000);
      } catch (error) {
        if (cancelled) return;
        console.error("Fabric polling error:", error);
        setStatus("failed");
        setTaskId(null);
        jobQueueRef.current = [];
        setActiveJob(null);
        toast.error((error as Error).message ?? t.ai.fabricDesigner.toasts.error);
      }
    };

    pollStatus();

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [taskId, t, activeJob, runJob]);

  const startGeneration = () => {
    if (!referenceFile) {
      toast.error(t.ai.fabricDesigner.toasts.imageRequired);
      return;
    }

    const fabrics = Array.from(selectedFabrics);
    if (fabrics.length === 0) {
      toast.error(t.ai.fabricDesigner.toasts.fabricRequired);
      return;
    }

    if (fabrics.includes("custom") && !customFabricName.trim()) {
      toast.error(t.ai.fabricDesigner.toasts.customFabricRequired);
      return;
    }

    const jobs: FabricJobConfig[] = fabrics.map((fabric) => ({
      fabric,
      fabricLabel: fabric === "custom" ? customFabricName.trim() : fabricLabelMap[fabric],
      patternPrompt: patternPrompt.trim(),
      advancedPrompt: advancedNotes.trim(),
      textureStrength,
      patternScale,
      lockModel,
      preserveBackground,
    }));

    if (jobs.length === 0) return;

    jobQueueRef.current = jobs.slice(1);
    runJob(jobs[0]).catch((error) => {
      console.error("Failed to run fabric job:", error);
    });

    if (jobs.length > 1) {
      toast.success(t.ai.fabricDesigner.toasts.queueStarted.replace("{count}", `${jobs.length}`));
    }
  };

  const handleCancelQueue = () => {
    jobQueueRef.current = [];
    setTaskId(null);
    setStatus("idle");
    setActiveJob(null);
    setProgress(0);
    setEstimatedTime(null);
    setElapsedSeconds(0);
    toast.info(t.ai.fabricDesigner.toasts.queueCleared);
  };

  const formatElapsed = (seconds: number) => {
    if (seconds <= 0) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const queueCount = jobQueueRef.current.length + (activeJob ? 1 : 0);
  const isBusy = status === "creating" || status === "polling";
  const latestResultLabel = gallery[0]?.fabricLabel ?? activeJob?.fabricLabel ?? "loomai-fabric";

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="text-center space-y-3 pb-10">
          <Badge variant="secondary" className="uppercase tracking-wide text-xs">
            {t.ai.fabricDesigner.hero.badge}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t.ai.fabricDesigner.hero.title}
          </h1>
          <p className="text-lg text-muted-foreground mx-auto max-w-3xl">{t.ai.fabricDesigner.hero.subtitle}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {heroHighlights.map((highlight: string) => (
              <Badge key={highlight} variant="outline" className="text-xs">
                {highlight}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-4 pb-10 md:grid-cols-3">
          {featureCards.map((card) => (
            <Card key={card.title} className="h-full">
              <CardHeader className="space-y-3">
                <div className="rounded-full bg-primary/10 p-2 inline-flex">{card.icon}</div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>{t.ai.fabricDesigner.upload.title}</CardTitle>
              <CardDescription>{t.ai.fabricDesigner.upload.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <div
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30",
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className="relative w-full max-w-sm overflow-hidden rounded-xl">
                      <img
                        src={previewUrl}
                        alt={t.ai.fabricDesigner.upload.previewAlt}
                        className="h-auto w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-3 left-3 space-y-1 text-left text-white">
                        <p className="text-xs uppercase tracking-wide opacity-80">
                          {t.ai.fabricDesigner.upload.helper}
                        </p>
                        <p className="text-sm font-medium">{referenceFile?.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <UploadCloud className="mx-auto size-10 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{t.ai.fabricDesigner.upload.dragLabel}</p>
                        <p className="text-sm text-muted-foreground">{t.ai.fabricDesigner.upload.helper}</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button type="button" onClick={() => fileInputRef.current?.click()}>
                      {t.ai.fabricDesigner.upload.replace}
                    </Button>
                    {previewUrl && (
                      <Button variant="outline" type="button" onClick={handleResetReference}>
                        {t.ai.fabricDesigner.upload.clear}
                      </Button>
                    )}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">{t.ai.fabricDesigner.upload.limit}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) handleFileSelection(file);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      {t.ai.fabricDesigner.fabricsSection.title}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {t.ai.fabricDesigner.fabricsSection.batchHint}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.ai.fabricDesigner.fabricsSection.subtitle}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {fabricOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => toggleFabric(option.key)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors",
                        selectedFabrics.has(option.key)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/60",
                      )}
                    >
                      <div className="text-sm font-semibold text-foreground">{option.title}</div>
                      <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                    </button>
                  ))}
                </div>

                {selectedFabrics.has("custom") && (
                  <div className="space-y-2">
                    <Label>{t.ai.fabricDesigner.customFabric.label}</Label>
                    <Input
                      value={customFabricName}
                      onChange={(event) => setCustomFabricName(event.target.value)}
                      placeholder={t.ai.fabricDesigner.customFabric.placeholder}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t.ai.fabricDesigner.customFabric.helper}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <Label>{t.ai.fabricDesigner.prints.title}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.ai.fabricDesigner.prints.description}
                    </p>
                  </div>
                  <Textarea
                    rows={3}
                    value={patternPrompt}
                    onChange={(event) => setPatternPrompt(event.target.value)}
                    placeholder={t.ai.fabricDesigner.prints.placeholder}
                  />
                  <div>
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{t.ai.fabricDesigner.prints.scaleLabel}</span>
                      <span className="text-muted-foreground">{(patternScale / 100).toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={200}
                      step={5}
                      value={patternScale}
                      onChange={(event) => setPatternScale(Number(event.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t.ai.fabricDesigner.prints.scaleHelper}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
                  <div>
                    <Label>{t.ai.fabricDesigner.controls.textureStrengthLabel}</Label>
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{t.ai.fabricDesigner.controls.textureStrengthHelper.replace("{value}", `${textureStrength}%`)}</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={textureStrength}
                      onChange={(event) => setTextureStrength(Number(event.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t.ai.fabricDesigner.controls.lockModel}</Label>
                      <p className="text-xs text-muted-foreground">
                        {t.ai.fabricDesigner.controls.lockModelHelper}
                      </p>
                    </div>
                    <Switch checked={lockModel} onCheckedChange={setLockModel} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t.ai.fabricDesigner.controls.preserveBackground}</Label>
                      <p className="text-xs text-muted-foreground">
                        {t.ai.fabricDesigner.controls.preserveBackgroundHelper}
                      </p>
                    </div>
                    <Switch checked={preserveBackground} onCheckedChange={setPreserveBackground} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t.ai.fabricDesigner.controls.advancedNotesLabel}</Label>
                  <Textarea
                    rows={3}
                    value={advancedNotes}
                    onChange={(event) => setAdvancedNotes(event.target.value)}
                    placeholder={t.ai.fabricDesigner.controls.advancedNotesPlaceholder}
                  />
                </div>

                <div className="rounded-xl border bg-background/70 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.ai.fabricDesigner.queue.title}</p>
                      <p className="text-xs text-muted-foreground">{t.ai.fabricDesigner.queue.description}</p>
                    </div>
                    {queueCount > 0 && (
                      <Badge variant="outline">
                        {t.ai.fabricDesigner.queue.queueCount.replace("{count}", `${queueCount}`)}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedFabrics.size > 0 ? (
                      Array.from(selectedFabrics).map((fabric) => (
                        <Badge key={fabric} variant="secondary">
                          {fabric === "custom" ? (customFabricName.trim() || fabricLabelMap[fabric]) : fabricLabelMap[fabric]}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {t.ai.fabricDesigner.queue.empty}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              <Button type="button" className="gap-2" disabled={isBusy} onClick={startGeneration}>
                {isBusy ? (
                  <>
                    <Play className="size-4 animate-spin" />
                    {t.ai.fabricDesigner.generator.generating}
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    {selectedFabrics.size > 1
                      ? t.ai.fabricDesigner.generator.actionBatch
                      : t.ai.fabricDesigner.generator.actionSingle}
                  </>
                )}
              </Button>
              {isBusy && (
                <Button type="button" variant="outline" className="gap-2" onClick={handleCancelQueue}>
                  <XCircle className="size-4" />
                  {t.ai.fabricDesigner.queue.stop}
                </Button>
              )}
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.ai.fabricDesigner.statusCard.title}</CardTitle>
                <CardDescription>{t.ai.fabricDesigner.statusCard.description}</CardDescription>
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
                      {t.ai.fabricDesigner.statusCard.eta.replace("{seconds}", `${estimatedTime}s`)}
                    </Badge>
                  )}
                  {(status === "creating" || status === "polling" || status === "completed") && (
                    <Badge variant="outline">
                      {t.ai.fabricDesigner.statusCard.elapsed.replace("{time}", formatElapsed(elapsedSeconds))}
                    </Badge>
                  )}
                </div>
                {(status === "creating" || status === "polling") && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-xs text-muted-foreground">
                      {t.ai.fabricDesigner.statusCard.progress.replace("{value}", `${progress}%`)}
                    </p>
                    {activeJob && (
                      <p className="text-xs text-muted-foreground">
                        {t.ai.fabricDesigner.statusCard.activeFabric.replace("{fabric}", activeJob.fabricLabel)}
                      </p>
                    )}
                  </div>
                )}
                {queueCount > 1 && (
                  <p className="text-xs text-muted-foreground">
                    {t.ai.fabricDesigner.statusCard.queueDepth.replace("{count}", `${queueCount - 1}`)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.ai.fabricDesigner.result.title}</CardTitle>
                <CardDescription>{t.ai.fabricDesigner.result.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {imageUrl ? (
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border">
                      <img src={imageUrl} alt={t.ai.fabricDesigner.result.alt} className="w-full object-cover" />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button type="button" className="gap-2" onClick={() => downloadImage(imageUrl, latestResultLabel.replace(/\s+/g, "-").toLowerCase())}>
                        <Download className="size-4" />
                        {t.ai.fabricDesigner.result.download}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-muted-foreground/30 p-6 text-center">
                    <p className="text-sm font-medium text-foreground">
                      {t.ai.fabricDesigner.result.emptyTitle}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.ai.fabricDesigner.result.emptyDescription}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-foreground">{t.ai.fabricDesigner.gallery.title}</h2>
            <p className="text-muted-foreground">{t.ai.fabricDesigner.gallery.subtitle}</p>
          </div>
          {gallery.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-muted-foreground/30 p-8 text-center">
              <p className="text-sm font-semibold text-foreground">{t.ai.fabricDesigner.gallery.emptyTitle}</p>
              <p className="text-sm text-muted-foreground">{t.ai.fabricDesigner.gallery.emptyDescription}</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {gallery.map((item) => (
                <Card key={item.id}>
                  <CardContent className="space-y-4 pt-6">
                    <div className="overflow-hidden rounded-xl border">
                      <img src={item.url} alt={item.fabricLabel} className="w-full object-cover" />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.fabricLabel}</p>
                        {item.patternPrompt && (
                          <p className="text-xs text-muted-foreground">
                            {item.patternPrompt}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {t.ai.fabricDesigner.gallery.generatedAt.replace(
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
                        onClick={() => downloadImage(item.url, item.fabricLabel.replace(/\s+/g, "-").toLowerCase())}
                      >
                        <Download className="size-3.5" />
                        {t.ai.fabricDesigner.gallery.download}
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
