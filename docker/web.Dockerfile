# syntax=docker/dockerfile:1.7
#
# TanStack Start (Nitro) Web — production image
# Built from the monorepo root context.
#   docker build -f docker/web.Dockerfile -t harmony-web .
#

ARG NODE_VERSION=24-alpine
ARG TURBO_VERSION=2.8.18

############################
# Base
############################
FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV CI=1 \
    npm_config_audit=false \
    npm_config_fund=false

############################
# Prune — extract only the `web` workspace & its deps
############################
FROM base AS pruner
ARG TURBO_VERSION
COPY . .
RUN npx -y turbo@${TURBO_VERSION} prune web --docker

############################
# Build — install deps, bundle Nitro server output
############################
FROM base AS builder
RUN apk add --no-cache python3 make g++ libc6-compat

COPY --from=pruner /app/out/json/ ./
RUN npm ci

COPY --from=pruner /app/out/full/ ./
ENV NODE_ENV=production
RUN npx turbo run build --filter=web

############################
# Runner — Nitro output is self-contained (bundled deps)
############################
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    TZ=UTC

RUN apk add --no-cache tini \
 && addgroup -S app && adduser -S app -G app

COPY --from=builder --chown=app:app /app/apps/web/.output ./.output

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+ (process.env.PORT||3000) +'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", ".output/server/index.mjs"]
