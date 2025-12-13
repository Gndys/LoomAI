# AI 功能模型一览（Next App）

本项目的 AI 能力分为两类：

- **生图/编辑（Image Generation）**：统一走 **EvoLink.AI**（`EVOLINK_API_KEY`）
- **图片提示词拆解（Prompt Extractor）**：走 **APIMart**（`APIMART_API_KEY`，非生图）

## 1) AI 生图（/ai）

- **页面**：`apps/next-app/app/[lang]/(root)/ai/page.tsx`
- **创建任务**：`apps/next-app/app/api/ai/images/route.ts`
- **轮询任务**：`apps/next-app/app/api/ai/images/[taskId]/route.ts`（请求 `EvoLink /v1/tasks/{taskId}`）
- **模型**
  - **无参考图（文生图）**：`z-image-turbo`（EvoLink）
  - **有参考图（图生图/融合）**：`nano-banana-2-lite`（EvoLink）

## 2) Nano Banana 2 影像实验室（/ai/nano-banana）

- **页面**：`apps/next-app/app/[lang]/(root)/ai/nano-banana/page.tsx`
- **创建任务**：`apps/next-app/app/api/ai/nano-banana/route.ts`
- **轮询任务**：`apps/next-app/app/api/ai/images/[taskId]/route.ts`（同上）
- **模型（可选）**
  1. `z-image-turbo`（EvoLink）
  2. `nano-banana-2-lite`（EvoLink）
  3. `gemini-3-pro-image-preview`（EvoLink）

## 3) 虚拟试穿（/ai/try-on）

- **页面**：`apps/next-app/app/[lang]/(root)/ai/try-on/page.tsx`
- **创建任务**：`apps/next-app/app/api/ai/try-on/route.ts`
- **轮询任务**：`apps/next-app/app/api/ai/images/[taskId]/route.ts`（同上）
- **模型**
  - `gemini-3-pro-image-preview`（EvoLink）

## 4) 面料替换/材质设计（/ai/fabric-design）

- **页面**：`apps/next-app/app/[lang]/(root)/ai/fabric-design/page.tsx`
- **创建任务**：`apps/next-app/app/api/ai/fabric/route.ts`
- **轮询任务**：`apps/next-app/app/api/ai/images/[taskId]/route.ts`（同上）
- **模型**
  - `gemini-3-pro-image-preview`（EvoLink）

## 5) 图片提示词拆解（/ai/prompt-extractor）

- **页面**：`apps/next-app/app/[lang]/(root)/ai/prompt-extractor/page.tsx`
- **接口**：`apps/next-app/app/api/ai/prompt-extractor/route.ts`
- **供应商**：APIMart（`https://api.apimart.ai/v1/responses`）
- **模型**
  - `gpt-5-nano`（用于“看图→输出提示词”，非生图）
