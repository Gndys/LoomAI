export type AiHistoryTool = "lookbook" | "fabric-design" | "try-on" | "nano-banana";

export type AiGenerationHistoryItem = {
  id: string;
  tool: AiHistoryTool;
  imageUrl: string;
  prompt: string;
  model: string;
  createdAt: string; // ISO
};

const STORAGE_KEY = "tinyship.ai.generationHistory.v1";
const MAX_ITEMS = 200;

const safeParse = (raw: string | null): AiGenerationHistoryItem[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is AiGenerationHistoryItem => {
      return Boolean(
        item &&
          typeof item === "object" &&
          typeof (item as any).id === "string" &&
          typeof (item as any).tool === "string" &&
          typeof (item as any).imageUrl === "string" &&
          typeof (item as any).prompt === "string" &&
          typeof (item as any).model === "string" &&
          typeof (item as any).createdAt === "string",
      );
    });
  } catch {
    return [];
  }
};

export const getAiGenerationHistory = (): AiGenerationHistoryItem[] => {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
};

export const setAiGenerationHistory = (items: AiGenerationHistoryItem[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
};

export const addAiGenerationHistoryItem = (item: AiGenerationHistoryItem) => {
  if (typeof window === "undefined") return;
  const existing = getAiGenerationHistory();
  const deduped = existing.filter((x) => x.id !== item.id);
  setAiGenerationHistory([item, ...deduped]);
};

export const removeAiGenerationHistoryItem = (id: string) => {
  if (typeof window === "undefined") return;
  setAiGenerationHistory(getAiGenerationHistory().filter((x) => x.id !== id));
};

export const clearAiGenerationHistory = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};

