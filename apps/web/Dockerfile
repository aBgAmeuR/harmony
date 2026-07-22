ARG NODE_VERSION=24.13.1
FROM node:${NODE_VERSION}-slim AS base
RUN corepack enable
WORKDIR /app

# ---
FROM base AS prepare
RUN npm i -g turbo@^2.9.18
COPY . .
RUN turbo prune web --docker

# ---
FROM base AS builder
COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prepare /app/out/full/ .

RUN pnpm turbo run build --filter=web
RUN mkdir -p /runtime/node_modules && cp -aL apps/web/node_modules/react /runtime/node_modules/react

# ---
FROM node:${NODE_VERSION}-alpine AS runner
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app

COPY --from=builder /app/apps/web/.output ./.output
COPY --from=builder /runtime/node_modules ./node_modules

EXPOSE 3001

CMD node .output/server/index.mjs
