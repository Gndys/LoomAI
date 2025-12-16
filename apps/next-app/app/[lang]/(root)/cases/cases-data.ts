export type CaseItem = {
  id: string;
  title: string;
  imageSrc: string;
  tags: string[];
  prompt: {
    zh: string;
    en: string;
  };
};

export const caseItems: CaseItem[] = [
  {
    id: "case-01",
    title: "产品海报 · 极简科技风",
    imageSrc: "/cases/case-1.svg",
    tags: ["海报", "产品", "极简", "商业"],
    prompt: {
      zh: "极简科技风产品海报，干净的留白，柔和渐变光晕，主体产品居中，细腻材质与高光反射，背景深色，品牌文字极少，电影级打光，高质感，4:3",
      en: "Minimal tech product poster, lots of negative space, soft gradient glow, centered subject, detailed material and highlights, dark background, minimal brand text, cinematic lighting, premium look, 4:3",
    },
  },
  {
    id: "case-02",
    title: "室内场景 · 北欧暖光",
    imageSrc: "/cases/case-2.svg",
    tags: ["室内", "氛围", "写实", "暖光"],
    prompt: {
      zh: "北欧风室内空间，暖色日落光从窗外斜射，木质家具与织物质感清晰，干净整洁，真实光影，35mm 镜头，浅景深，照片级真实",
      en: "Scandinavian interior, warm sunset light through the window, wood and fabric textures, clean and tidy, realistic shadows, 35mm lens, shallow depth of field, photorealistic",
    },
  },
  {
    id: "case-03",
    title: "品牌 Logo · 扁平几何",
    imageSrc: "/cases/case-3.svg",
    tags: ["Logo", "扁平", "几何", "品牌"],
    prompt: {
      zh: "扁平几何风格 Logo，简洁图形，强识别度，2-3 色配色，网格对齐，留白充足，矢量质感，白底展示，并附带黑白反色版本",
      en: "Flat geometric logo, simple shapes, high recognizability, 2–3 color palette, grid aligned, generous whitespace, vector look, shown on white background, include black/white inverse version",
    },
  },
  {
    id: "case-04",
    title: "服装试穿 · 街拍胶片感",
    imageSrc: "/cases/case-4.svg",
    tags: ["人物", "穿搭", "街拍", "胶片"],
    prompt: {
      zh: "城市街拍人像，胶片颗粒感，柔和对比度，时尚穿搭，肤色自然，背景轻微虚化，50mm，人像摄影，干净构图，真实质感",
      en: "Urban street portrait, film grain, soft contrast, fashion outfit, natural skin tones, slight background bokeh, 50mm portrait photo, clean composition, realistic texture",
    },
  },
  {
    id: "case-05",
    title: "App 界面 · 现代卡片风",
    imageSrc: "/cases/case-5.svg",
    tags: ["UI", "App", "卡片", "现代"],
    prompt: {
      zh: "现代 App UI 截图，卡片式布局，清晰信息层级，圆角与柔和阴影，主按钮突出，浅色背景，细腻图标，12 列栅格，设计系统一致性",
      en: "Modern app UI screenshot, card layout, clear hierarchy, rounded corners and soft shadows, prominent primary CTA, light background, refined icons, 12-column grid, consistent design system",
    },
  },
  {
    id: "case-06",
    title: "风景摄影 · 电影级色彩",
    imageSrc: "/cases/case-6.svg",
    tags: ["风景", "摄影", "广角", "电影"],
    prompt: {
      zh: "广角风景摄影，层次分明的云与光，色彩电影感调色，细节丰富，远山与前景对比，清晰锐利，HDR，8K 细节，真实自然",
      en: "Wide-angle landscape photo, layered clouds and light, cinematic color grading, rich details, distant mountains with strong foreground, sharp and clear, HDR, 8K detail, natural realism",
    },
  },
];

