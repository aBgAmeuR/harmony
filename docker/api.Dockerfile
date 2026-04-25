# syntax=docker/dockerfile:1.7
#
# AdonisJS API — production image
# Built from the monorepo root context.
#   docker build -f docker/api.Dockerfile -t harmony-api .
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
# Prune — extract only the `api` workspace & its deps
############################
FROM base AS pruner
ARG TURBO_VERSION
COPY . .
RUN npx -y turbo@${TURBO_VERSION} prune api --docker

############################
# Build — install full deps, compile AdonisJS
############################
FROM base AS builder
RUN apk add --no-cache python3 make g++ libc6-compat

COPY --from=pruner /app/out/json/ ./
RUN npm ci

COPY --from=pruner /app/out/full/ ./
RUN npx turbo run build --filter=api

############################
# Prod deps — install runtime-only deps from the pruned workspace
############################
FROM base AS prod-deps
RUN apk add --no-cache python3 make g++ libc6-compat

COPY --from=pruner /app/out/json/ ./
RUN npm ci --omit=dev \
 && npm cache clean --force

############################
# Runner — minimal runtime image
############################
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3333 \
    TZ=UTC

RUN apk add --no-cache tini \
 && addgroup -S app && adduser -S app -G app

COPY --from=prod-deps --chown=app:app /app/node_modules ./node_modules
COPY --from=builder  --chown=app:app /app/packages/musicbrainz/package.json ./packages/musicbrainz/package.json
COPY --from=builder  --chown=app:app /app/packages/musicbrainz/dist ./packages/musicbrainz/dist
COPY --from=builder  --chown=app:app /app/apps/api/build ./

USER app
EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+ (process.env.PORT||3333) +'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "bin/server.js"]
