ARG NODE_VERSION=24.13.1
ARG RUST_VERSION=1.96.0
ARG CARGO_CHEF_VERSION=0.1.77

# --- Web: static SPA
FROM docker.io/library/node:${NODE_VERSION}-slim AS web-base
RUN corepack enable
WORKDIR /app

FROM web-base AS web-prepare
RUN npm i -g turbo@^2.9.18
COPY . .
RUN turbo prune web --docker

FROM web-base AS web-builder
ARG HARMONY_VERSION=dev
ENV VITE_APP_VERSION=$HARMONY_VERSION
COPY --from=web-prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=web-prepare /app/out/full/ .
RUN pnpm turbo run build --filter=web

# --- API
FROM docker.io/lukemathwalker/cargo-chef:${CARGO_CHEF_VERSION}-rust-${RUST_VERSION}-bookworm AS chef
WORKDIR /app

FROM chef AS planner
COPY apps/server/ .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS server-builder
COPY --from=planner /app/recipe.json recipe.json
COPY apps/server/.cargo .cargo
RUN cargo chef cook --profile release-ci --recipe-path recipe.json
COPY apps/server/ .
ARG HARMONY_VERSION=dev
RUN HARMONY_VERSION="$HARMONY_VERSION" cargo build --profile release-ci --bin server \
    && cp target/release-ci/deps/libduckdb.so /tmp/libduckdb.so

# --- Runtime
FROM docker.io/library/debian:bookworm-slim AS runner
LABEL org.opencontainers.image.title="Harmony" \
      org.opencontainers.image.description="Spotify listening history analytics: web app, API and ingestion pipeline"

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app

WORKDIR /app
COPY --from=server-builder /tmp/libduckdb.so /usr/local/lib/libduckdb.so
COPY --from=server-builder /app/target/release-ci/server /app/server
COPY --from=web-builder /app/apps/web/.output/public /app/public
RUN mkdir -p /data && chown app:app /data

ENV LD_LIBRARY_PATH=/usr/local/lib \
    HOST=0.0.0.0 \
    PORT=3000 \
    DATA_DIR=/data \
    STATIC_DIR=/app/public

VOLUME ["/data"]
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["/app/server", "healthcheck"]
CMD ["/app/server"]
