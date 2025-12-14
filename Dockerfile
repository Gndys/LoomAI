FROM node:22-alpine

WORKDIR /app

# pnpm via Corepack (matches package.json "packageManager")
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps ./apps
COPY libs ./libs
COPY scripts ./scripts
COPY config.ts tsconfig.json vitest.config.ts drizzle.config.ts ./

RUN pnpm install --frozen-lockfile

RUN pnpm build

ENV NODE_ENV=production
EXPOSE 7001

CMD ["pnpm", "start:next"]
