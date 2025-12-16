"use client";

import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  Download,
  UploadCloud,
  Copy,
  Eye,
} from "lucide-react";
import { addAiGenerationHistoryItem } from "@/lib/ai-history";

const ASPECT_RATIOS = ["auto", "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"] as const;
const QUALITY_OPTIONS = ["1K", "2K", "4K"] as const;
const MODEL_OPTIONS = ["z-image-turbo", "nano-banana-2-lite", "gemini-3-pro-image-preview"] as const;
const MAX_REFERENCE_IMAGES = 5;
const MAX_UPLOAD_MB = 10;
const MAX_CONCURRENT_TASKS = 3;
const MAX_PROMPT_CHARS = 2000;
const PREVIEW_REFERENCE_LABEL = "参考";
const PREVIEW_OUTPUT_LABEL = "输出";
const STORAGE_VERSION = 1;
const STORAGE_KEY = `nano-banana-tasks:v${STORAGE_VERSION}`;
const MAX_STORED_TASKS = 100;
const MAX_TASK_AGE_MS = 1000 * 60 * 60 * 24;

type AspectRatio = (typeof ASPECT_RATIOS)[number];
type Quality = (typeof QUALITY_OPTIONS)[number];
type Model = (typeof MODEL_OPTIONS)[number];
type GenerationStatus = "queued" | "creating" | "polling" | "completed" | "failed";

type Scenario = { title: string; prompt: string; helper?: string };
type ReferenceItem = { id: string; url: string };

type GenerationTask = {
  clientId: string;
  prompt: string;
  model: Model;
  size: AspectRatio;
  quality: Quality;
  referenceUrls?: string[];
  createdAt: number;
  status: GenerationStatus;
  progress: number;
  estimatedTime: number | null;
  elapsedSeconds: number;
  taskId: string | null;
  imageUrl: string | null;
  errorMessage: string | null;
  savedToHistory?: boolean;
};

type StoredTasksPayload = {
  version: number;
  tasks: GenerationTask[];
};

const ALLOWED_STATUSES: GenerationStatus[] = ["queued", "creating", "polling", "completed", "failed"];

const clampProgress = (value: unknown) => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.floor(value)));
};

const normalizeStoredTask = (candidate: unknown): GenerationTask | null => {
  if (!candidate || typeof candidate !== "object") return null;
  const item = candidate as Partial<GenerationTask> & Record<string, unknown>;
  if (typeof item.clientId !== "string" || typeof item.prompt !== "string") return null;

  const model = MODEL_OPTIONS.includes(item.model as Model) ? (item.model as Model) : "z-image-turbo";
  const size = ASPECT_RATIOS.includes(item.size as AspectRatio) ? (item.size as AspectRatio) : "auto";
  const quality = QUALITY_OPTIONS.includes(item.quality as Quality) ? (item.quality as Quality) : "2K";
  const createdAt = typeof item.createdAt === "number" ? item.createdAt : Date.now();
  const estimatedTime = typeof item.estimatedTime === "number" ? item.estimatedTime : null;
  const elapsedSeconds = typeof item.elapsedSeconds === "number" && item.elapsedSeconds >= 0 ? item.elapsedSeconds : 0;
  const progress = clampProgress(item.progress);
  const referenceUrls = Array.isArray(item.referenceUrls)
    ? item.referenceUrls.filter((url): url is string => typeof url === "string" && url.length > 0).slice(0, MAX_REFERENCE_IMAGES)
    : undefined;
  const taskId = typeof item.taskId === "string" ? item.taskId : null;
  const imageUrl = typeof item.imageUrl === "string" ? item.imageUrl : null;
  const errorMessage = typeof item.errorMessage === "string" ? item.errorMessage : null;

  let status: GenerationStatus = ALLOWED_STATUSES.includes(item.status as GenerationStatus)
    ? (item.status as GenerationStatus)
    : "failed";

  if ((status === "creating" || status === "polling") && !taskId) {
    status = "queued";
  } else if (status === "creating" && taskId) {
    status = "polling";
  }

  return {
    clientId: item.clientId,
    prompt: item.prompt,
    model,
    size,
    quality,
    referenceUrls,
    createdAt,
    status,
    progress,
    estimatedTime,
    elapsedSeconds,
    taskId,
    imageUrl,
    errorMessage,
  };
};

const parseStoredTasks = (rawValue: string | null): GenerationTask[] => {
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue) as StoredTasksPayload;
    if (!parsed || parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.tasks)) return [];
    const now = Date.now();
    const normalized: GenerationTask[] = [];
    for (const candidate of parsed.tasks) {
      const task = normalizeStoredTask(candidate);
      if (!task) continue;
      if (now - task.createdAt > MAX_TASK_AGE_MS) continue;
      normalized.push(task);
      if (normalized.length >= MAX_STORED_TASKS) break;
    }
    return normalized;
  } catch (error) {
    console.error("Failed to parse stored Nano Banana tasks:", error);
    return [];
  }
};

type ImageComparePanelProps = {
  outputUrl: string;
  referenceUrls: string[];
};

function ImageComparePanel({ outputUrl, referenceUrls }: ImageComparePanelProps) {
  const safeReferenceUrls = useMemo(
    () => referenceUrls.filter((url) => typeof url === "string" && url.trim().length > 0),
    [referenceUrls],
  );
  const [split, setSplit] = useState(50);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeReferenceUrl = safeReferenceUrls.length
    ? safeReferenceUrls[Math.min(activeIndex, safeReferenceUrls.length - 1)]
    : null;
  const clampedSplit = Math.min(100, Math.max(0, split));

  if (!activeReferenceUrl) {
    return (
      <div className="relative h-[50vh] min-h-[280px] overflow-hidden rounded-xl border bg-muted">
        <img
          src={outputUrl}
          alt={PREVIEW_OUTPUT_LABEL}
          className="absolute inset-0 h-full w-full object-contain"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <div className="absolute left-2 top-2 rounded-md border bg-background/80 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur">
          {PREVIEW_OUTPUT_LABEL}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative h-[50vh] min-h-[280px] overflow-hidden rounded-xl border bg-muted">
        <img
          src={outputUrl}
          alt={PREVIEW_OUTPUT_LABEL}
          className="absolute inset-0 h-full w-full object-contain"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${clampedSplit}%` }}
        >
          <img
            src={activeReferenceUrl}
            alt={PREVIEW_REFERENCE_LABEL}
            className="absolute inset-0 h-full w-full object-contain"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="absolute left-2 top-2 rounded-md border bg-background/80 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur">
          {PREVIEW_REFERENCE_LABEL}
        </div>
        <div className="absolute right-2 top-2 rounded-md border bg-background/80 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur">
          {PREVIEW_OUTPUT_LABEL}
        </div>

        <div
          className="absolute inset-y-0 w-px bg-background/80"
          style={{ left: `${clampedSplit}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: `${clampedSplit}%` }}
        >
          <div className="-translate-x-1/2 rounded-full border bg-background/80 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur">
            ⇆
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={clampedSplit}
          onChange={(event) => setSplit(Number(event.target.value))}
          className="w-full"
          aria-label="Compare reference and output"
        />
      </div>

      {safeReferenceUrls.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {safeReferenceUrls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted transition ${
                index === activeIndex ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
              }`}
              aria-label={`Select reference ${index + 1}`}
            >
              <img
                src={url}
                alt={`Reference ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="absolute left-1 top-1 rounded bg-background/80 px-1 text-[10px] text-muted-foreground">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function NanoBananaLabPage() {
  const { t, locale } = useTranslation();
  const scenarios: Scenario[] = t.ai.nanoBanana.scenarios ?? [];
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<Model>("z-image-turbo");
  const [size, setSize] = useState<AspectRatio>("3:4");
  const [quality, setQuality] = useState<Quality>("2K");
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, startUpload] = useTransition();
  const [resultLimit, setResultLimit] = useState(12);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pollTimeoutsRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const elapsedTimersRef = useRef(new Map<string, ReturnType<typeof setInterval>>());

  const statusLabels = useMemo(
    () => ({
      queued: "Queued",
      creating: t.ai.generator.status.creating,
      polling: t.ai.generator.status.polling,
      completed: t.ai.generator.status.completed,
      failed: t.ai.generator.status.failed,
    }),
    [t],
  );

  const selectedModelLabel = useMemo(() => t.ai.nanoBanana.models?.[model] ?? model, [model, t]);
  const generateCtaLabel = useMemo(() => {
    const template = t.ai.nanoBanana.generateCtaTemplate ?? t.ai.nanoBanana.generateCta;
    if (!template) return selectedModelLabel;
    return template.replace("{model}", selectedModelLabel);
  }, [selectedModelLabel, t]);

  const statusIcons: Record<GenerationStatus, ReactElement> = {
    queued: <Sparkles className="size-3.5" />,
    creating: <Loader2 className="size-3.5 animate-spin" />,
    polling: <Loader2 className="size-3.5 animate-spin" />,
    completed: <Check className="size-3.5" />,
    failed: <AlertTriangle className="size-3.5" />,
  };

  const clearTaskTimers = useCallback((clientId: string) => {
    const pollTimeout = pollTimeoutsRef.current.get(clientId);
    if (pollTimeout) clearTimeout(pollTimeout);
    pollTimeoutsRef.current.delete(clientId);
    const elapsedTimer = elapsedTimersRef.current.get(clientId);
    if (elapsedTimer) clearInterval(elapsedTimer);
    elapsedTimersRef.current.delete(clientId);
  }, []);

  const pollTask = useCallback(
    async (clientId: string, taskId: string) => {
      try {
        const response = await fetch(`/api/ai/images/${taskId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || t.ai.generator.toasts.error);
        }

        setTasks((prev) =>
          prev.map((task) =>
            task.clientId === clientId
              ? { ...task, progress: data.progress ?? task.progress }
              : task,
          ),
        );

        const resolvedImageUrl = typeof data.imageUrl === "string" ? data.imageUrl : null;

        if (data.status === "completed" && resolvedImageUrl) {
          clearTaskTimers(clientId);
          setTasks((prev) =>
            prev.map((task) =>
              task.clientId === clientId
                ? {
                    ...task,
                    status: "completed",
                    taskId: null,
                    progress: 100,
                    imageUrl: resolvedImageUrl,
                  }
                : task,
            ),
          );
          toast.success(t.ai.generator.toasts.completed);
          return;
        }

        if (data.status === "failed") {
          clearTaskTimers(clientId);
          setTasks((prev) =>
            prev.map((task) =>
              task.clientId === clientId
                ? {
                    ...task,
                    status: "failed",
                    taskId: null,
                    errorMessage: data.error || t.ai.generator.toasts.error,
                  }
                : task,
            ),
          );
          toast.error(t.ai.generator.toasts.error);
          return;
        }

        const timeout = setTimeout(() => pollTask(clientId, taskId), 2000);
        pollTimeoutsRef.current.set(clientId, timeout);
      } catch (error) {
        clearTaskTimers(clientId);
        console.error("Nano Banana polling error:", error);
        setTasks((prev) =>
          prev.map((task) =>
            task.clientId === clientId
              ? {
                  ...task,
                  status: "failed",
                  taskId: null,
                  errorMessage: (error as Error).message ?? t.ai.generator.toasts.error,
                }
              : task,
          ),
        );
        toast.error(t.ai.generator.toasts.error);
      }
    },
    [clearTaskTimers, t],
  );

  const syncRunningTimers = useCallback(
    (nextTasks: GenerationTask[]) => {
      for (const task of nextTasks) {
        if (task.status !== "polling" || !task.taskId) continue;
        if (elapsedTimersRef.current.has(task.clientId)) continue;
        const timer = setInterval(() => {
          setTasks((prev) =>
            prev.map((current) =>
              current.clientId === task.clientId && current.status === "polling"
                ? { ...current, elapsedSeconds: current.elapsedSeconds + 1 }
                : current,
            ),
          );
        }, 1000);
        elapsedTimersRef.current.set(task.clientId, timer);
        pollTask(task.clientId, task.taskId!);
      }
    },
    [pollTask],
  );

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
        if (res.status === 401) {
          toast.error(locale === "en" ? "Please sign in to use this feature." : "请先登录后使用该功能。");
          const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/${locale}/signin?returnTo=${returnTo}`;
          return;
        }
        const data = await res.json().catch(() => ({} as any));
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
      const normalizedPrompt = finalPrompt.slice(0, MAX_PROMPT_CHARS);
      if (!normalizedPrompt) {
        toast.error(t.ai.nanoBanana.toasts.requiredPrompt);
        return;
      }

      const referenceUrls = references.map((item) => item.url).slice(0, MAX_REFERENCE_IMAGES);
      const clientId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      setTasks((prev) => [
        {
          clientId,
          prompt: normalizedPrompt,
          model,
          size,
          quality,
          referenceUrls: referenceUrls.length ? referenceUrls : undefined,
          createdAt: Date.now(),
          status: "queued",
          progress: 0,
          estimatedTime: null,
          elapsedSeconds: 0,
          taskId: null,
          imageUrl: null,
          errorMessage: null,
        },
        ...prev,
      ]);

      setIsSubmitting(true);
      queueMicrotask(() => setIsSubmitting(false));
    },
    [prompt, model, size, quality, references, t],
  );

  const handleReset = () => {
    setPrompt("");
    setModel("z-image-turbo");
    setReferences([]);
    setTasks([]);
    setResultLimit(12);
    for (const clientId of pollTimeoutsRef.current.keys()) clearTaskTimers(clientId);
    pollTimeoutsRef.current.clear();
    elapsedTimersRef.current.clear();
  };

  const handleDownload = async (url: string) => {
    try {
      setIsDownloading(true);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Download failed (${response.status})`);
      }
      const contentType = (response.headers.get("content-type") || "").toLowerCase();
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;

      const extensionFromUrl = (() => {
        try {
          const pathname = new URL(url).pathname;
          const match = pathname.match(/\.(png|jpe?g|webp)(?:$|\?|#)/i);
          if (match?.[1]) return match[1].toLowerCase();
        } catch {
          const match = url.match(/\.(png|jpe?g|webp)(?:$|\?|#)/i);
          if (match?.[1]) return match[1].toLowerCase();
        }
        return null;
      })();

      const extension = contentType.includes("png")
        ? "png"
        : contentType.includes("jpeg") || contentType.includes("jpg")
          ? "jpg"
          : contentType.includes("webp")
            ? "webp"
            : extensionFromUrl === "jpeg"
              ? "jpg"
              : extensionFromUrl ?? "png";

      link.download = `nano-banana-${Date.now()}.${extension}`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download error:", error);
      toast.error((error as Error).message ?? (t.ai.generator.toasts.downloadError ?? "Download failed"));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async (value: string) => {
    const text = value.trim();
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      toast.success(t.ai.promptExtractor.copied ?? "Copied");
    } catch (error) {
      console.error("Copy error:", error);
      toast.error(t.ai.generator.toasts.error);
    }
  };

  const buildEffectivePrompt = (task: Pick<GenerationTask, "prompt" | "quality">) => {
    const qualityNote =
      task.quality && task.quality !== "2K" ? ` Render with ${task.quality} fidelity.` : "";
    return `${task.prompt}${qualityNote}`.trim();
  };

  const { queuedCount, runningCount, completedCount, failedCount } = useMemo(() => {
    const counts = { queuedCount: 0, runningCount: 0, completedCount: 0, failedCount: 0 };
    for (const task of tasks) {
      if (task.status === "queued") counts.queuedCount += 1;
      if (task.status === "creating" || task.status === "polling") counts.runningCount += 1;
      if (task.status === "completed") counts.completedCount += 1;
      if (task.status === "failed") counts.failedCount += 1;
    }
    return counts;
  }, [tasks]);

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === "completed" && Boolean(task.imageUrl)),
    [tasks],
  );

  const visibleCompletedTasks = useMemo(
    () => completedTasks.slice(0, resultLimit),
    [completedTasks, resultLimit],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTasks = parseStoredTasks(window.localStorage.getItem(STORAGE_KEY));
    if (!storedTasks.length) return;
    setTasks((prev) => {
      if (prev.length) {
        syncRunningTimers(prev);
        return prev;
      }
      syncRunningTimers(storedTasks);
      return storedTasks;
    });
  }, [syncRunningTimers]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!tasks.length) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const now = Date.now();
      const payload: StoredTasksPayload = {
        version: STORAGE_VERSION,
        tasks: tasks
          .filter((task) => now - task.createdAt <= MAX_TASK_AGE_MS)
          .slice(0, MAX_STORED_TASKS),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Failed to persist Nano Banana tasks:", error);
    }
  }, [tasks]);

  useEffect(() => {
    const startNext = async () => {
      const activeCount = tasks.filter((task) => task.status === "creating" || task.status === "polling").length;
      if (activeCount >= MAX_CONCURRENT_TASKS) return;

      let next: GenerationTask | undefined;
      for (let index = tasks.length - 1; index >= 0; index -= 1) {
        const candidate = tasks[index];
        if (candidate?.status === "queued") {
          next = candidate;
          break;
        }
      }
      if (!next) return;

      setTasks((prev) =>
        prev.map((task) =>
          task.clientId === next.clientId ? { ...task, status: "creating", errorMessage: null } : task,
        ),
      );

      const elapsedTimer = setInterval(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.clientId === next.clientId && (task.status === "creating" || task.status === "polling")
              ? { ...task, elapsedSeconds: task.elapsedSeconds + 1 }
              : task,
          ),
        );
      }, 1000);
      elapsedTimersRef.current.set(next.clientId, elapsedTimer);

      try {
        const response = await fetch("/api/ai/nano-banana", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: next.prompt,
            model: next.model,
            size: next.size,
            quality: next.quality,
            referenceUrls: next.referenceUrls,
          }),
        });

        if (response.status === 401) {
          toast.error(locale === "en" ? "Please sign in to use this feature." : "请先登录后使用该功能。");
          const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/${locale}/signin?returnTo=${returnTo}`;
          return;
        }

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          const details =
            data?.details
              ? typeof data.details === "string"
                ? data.details
                : JSON.stringify(data.details)
              : null;
          const message = data?.error || t.ai.nanoBanana.toasts.error;
          throw new Error(details ? `${message} • ${details}` : message);
        }

        setTasks((prev) =>
          prev.map((task) =>
            task.clientId === next.clientId
              ? {
                  ...task,
                  status: "polling",
                  estimatedTime: data.estimatedTime ?? null,
                  taskId: data.taskId ?? null,
                }
              : task,
          ),
        );

        if (data.taskId) {
          pollTask(next.clientId, data.taskId);
        } else {
          throw new Error(t.ai.nanoBanana.toasts.error);
        }
      } catch (error) {
        clearTaskTimers(next.clientId);
        console.error("Nano Banana generation error:", error);
        const message = (error as Error).message ?? t.ai.nanoBanana.toasts.error;
        setTasks((prev) =>
          prev.map((task) =>
            task.clientId === next.clientId
              ? {
                  ...task,
                  status: "failed",
                  taskId: null,
                  errorMessage: message,
                }
              : task,
          ),
        );
        toast.error(message);
      }
    };

    // Fill available slots each time tasks change.
    void startNext();
  }, [clearTaskTimers, pollTask, t, tasks]);

  useEffect(() => {
    return () => {
      for (const clientId of pollTimeoutsRef.current.keys()) clearTaskTimers(clientId);
    };
  }, [clearTaskTimers]);

  useEffect(() => {
    const ready = tasks.filter((task) => task.status === "completed" && task.imageUrl && !task.savedToHistory);
    if (!ready.length) return;

    for (const task of ready) {
      addAiGenerationHistoryItem({
        id: task.clientId,
        tool: "nano-banana",
        imageUrl: task.imageUrl!,
        prompt: task.prompt,
        model: task.model,
        createdAt: new Date(task.createdAt).toISOString(),
      });
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.status === "completed" && task.imageUrl && !task.savedToHistory ? { ...task, savedToHistory: true } : task,
      ),
    );
  }, [tasks]);

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
          onChange={(event) => setPrompt(event.target.value.slice(0, MAX_PROMPT_CHARS))}
          placeholder={t.ai.nanoBanana.promptPlaceholder}
          className="min-h-[140px] max-h-[280px] overflow-y-auto resize-y [field-sizing:fixed]"
        />
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{t.ai.nanoBanana.promptHelper}</p>
          <p className="text-xs text-muted-foreground tabular-nums">{`${prompt.length}/${MAX_PROMPT_CHARS}`}</p>
        </div>
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
            <Badge variant="outline">{`并发 ${runningCount}/${MAX_CONCURRENT_TASKS}`}</Badge>
            <Badge variant="outline">{`排队 ${queuedCount}`}</Badge>
            <Badge variant="outline">{`完成 ${completedCount}`}</Badge>
            {failedCount > 0 && <Badge variant="destructive">{`失败 ${failedCount}`}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(tasks.length === 0 || tasks.every((task) => task.status === "completed" || task.status === "failed")) && (
            <p className="text-sm text-muted-foreground">当前没有进行中的任务。</p>
          )}
          <div className="space-y-3">
            {tasks
              .filter((task) => task.status === "queued" || task.status === "creating" || task.status === "polling")
              .map((task) => (
                <div key={task.clientId} className="rounded-md border p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {statusIcons[task.status]}
                        {statusLabels[task.status]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{t.ai.nanoBanana.models?.[task.model] ?? task.model}</span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {task.elapsedSeconds}s{task.estimatedTime ? ` • ~${task.estimatedTime}s ETA` : ""}
                    </span>
                  </div>
                  <Progress value={task.progress} />
                  {task.errorMessage && <p className="text-sm text-destructive">{task.errorMessage}</p>}
                </div>
              ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" form="nano-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.ai.nanoBanana.generating}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {generateCtaLabel}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t.ai.nanoBanana.resetCta}
            </Button>
          </div>
        </CardContent>
      </Card>

      <form id="nano-form" className="grid lg:grid-cols-3 gap-6" onSubmit={handleSubmit}>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.ai.nanoBanana.resultTitle}</CardTitle>
            <CardDescription>{t.ai.nanoBanana.resultDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedTasks.length > 0 ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    已生成 {completedTasks.length} 张 • 显示 {Math.min(resultLimit, completedTasks.length)} 张
                  </p>
                  {completedTasks.length > resultLimit ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setResultLimit((prev) => prev + 12)}
                    >
                      加载更多
                    </Button>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleCompletedTasks.map((task) => {
                    const effectivePrompt = buildEffectivePrompt(task);
                    const referenceUrls = task.referenceUrls ?? [];
                    const primaryReferenceUrl = referenceUrls[0] ?? null;
                    const hasReferences = Boolean(primaryReferenceUrl);

                    return (
                      <div key={task.clientId}>
                        <div className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md">
                          <div className="relative h-64 bg-muted sm:h-72">
                            <img
                              src={task.imageUrl as string}
                              alt="Generated"
                              className="absolute inset-0 h-full w-full object-contain p-2"
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                            />

                            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />

                            {hasReferences && primaryReferenceUrl ? (
                              <div className="absolute left-3 top-3">
                                <div className="relative h-12 w-12 overflow-hidden rounded-xl border bg-background/70 backdrop-blur">
                                  <img
                                    src={primaryReferenceUrl}
                                    alt="Reference"
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-x-0 bottom-0 bg-background/70 px-1 py-0.5 text-center text-[10px] text-muted-foreground backdrop-blur">
                                    {PREVIEW_REFERENCE_LABEL} {referenceUrls.length}
                                  </div>
                                </div>
                              </div>
                            ) : null}

                            <div className="absolute right-3 top-3 flex items-center gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-9 w-9 bg-background/80 backdrop-blur hover:bg-background"
                                onClick={() => (task.imageUrl ? handleDownload(task.imageUrl) : undefined)}
                                disabled={isDownloading || !task.imageUrl}
                                aria-label={t.ai.nanoBanana.downloadCta}
                              >
                                <Download className="h-4 w-4" />
                              </Button>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    className="h-9 w-9 bg-background/80 backdrop-blur hover:bg-background"
                                    aria-label="View details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
                                  <div className="border-b bg-background px-6 py-4 pr-14">
                                    <DialogHeader className="gap-1 text-left">
                                      <DialogTitle className="truncate">
                                        {t.ai.nanoBanana.models?.[task.model] ?? task.model}
                                      </DialogTitle>
                                      <DialogDescription>
                                        {task.size} • {task.quality} • {task.elapsedSeconds}s
                                      </DialogDescription>
                                    </DialogHeader>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => (task.imageUrl ? handleDownload(task.imageUrl) : undefined)}
                                        disabled={isDownloading || !task.imageUrl}
                                      >
                                        <Download className="mr-2 h-4 w-4" />
                                        {t.ai.nanoBanana.downloadCta}
                                      </Button>
                                      <Button type="button" size="sm" variant="outline" onClick={() => handleCopy(effectivePrompt)}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        {t.ai.promptExtractor.copy ?? "Copy"}
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                                    <ImageComparePanel
                                      outputUrl={task.imageUrl as string}
                                      referenceUrls={referenceUrls}
                                    />

                                    <div className="rounded-xl border bg-muted/20 p-4">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium text-foreground">{t.ai.nanoBanana.promptLabel}</p>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="secondary"
                                          onClick={() => handleCopy(effectivePrompt)}
                                        >
                                          <Copy className="mr-2 h-4 w-4" />
                                          {t.ai.promptExtractor.copy ?? "Copy"}
                                        </Button>
                                      </div>
                                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                                        {effectivePrompt}
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 space-y-1">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {t.ai.nanoBanana.models?.[task.model] ?? task.model}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                <span className="rounded-full border bg-background/70 px-2 py-0.5 text-[11px] text-muted-foreground backdrop-blur">
                                  {task.size}
                                </span>
                                <span className="rounded-full border bg-background/70 px-2 py-0.5 text-[11px] text-muted-foreground backdrop-blur">
                                  {task.quality}
                                </span>
                                <span className="rounded-full border bg-background/70 px-2 py-0.5 text-[11px] text-muted-foreground backdrop-blur">
                                  {task.elapsedSeconds}s
                                </span>
                                {hasReferences ? (
                                  <span className="rounded-full border bg-background/70 px-2 py-0.5 text-[11px] text-muted-foreground backdrop-blur">
                                    {PREVIEW_REFERENCE_LABEL} {referenceUrls.length}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div className="p-4 pt-3">
                            <div className="rounded-xl bg-muted/20 p-3 ring-1 ring-border/60">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-medium text-muted-foreground">{t.ai.nanoBanana.promptLabel}</p>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => handleCopy(effectivePrompt)}
                                  aria-label={t.ai.promptExtractor.copy ?? "Copy"}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 line-clamp-2">
                                {effectivePrompt}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {completedTasks.length > visibleCompletedTasks.length ? (
                  <div className="flex justify-center">
                    <Button type="button" variant="secondary" onClick={() => setResultLimit((prev) => prev + 12)}>
                      加载更多
                    </Button>
                  </div>
                ) : null}
              </>
            ) : tasks.some((task) => task.status === "failed") ? (
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
