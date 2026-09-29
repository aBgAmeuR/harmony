# syntax=docker/dockerfile:1
# Build context: the repository root (docker build -f docker/Dockerfile .).

# --- Rust toolchain with cargo-chef
FROM docker.io/lukemathwalker/cargo-chef:0.1.77-rust-1.96.0-bookworm@sha256:fa7281503a177bd5af6261f4041ca6b36d9f0de8d3090886c33cbd8e65b88ca9 AS chef
WORKDIR /app

# --- Prebuilt libduckdb matching the libduckdb-sys version in Cargo.lock
FROM chef AS libduckdb
ARG TARGETARCH
COPY apps/server/Cargo.lock ./
# libduckdb-sys 1.MMmmpp.x wraps DuckDB MM.mm.pp (1.10501.0 is DuckDB 1.5.1).
RUN set -eu; \
    crate=$(awk '/^name = "libduckdb-sys"$/ { getline; gsub(/[^0-9.]/, ""); print; exit }' Cargo.lock); \
    test -n "$crate"; \
    encoded=$(echo "$crate" | cut -d. -f2); \
    version="$((encoded / 10000)).$((encoded / 100 % 100)).$((encoded % 100))"; \
    echo "libduckdb-sys $crate uses DuckDB $version ($TARGETARCH)"; \
    curl -fsSL -o libduckdb.zip \
      "https://github.com/duckdb/duckdb/releases/download/v${version}/libduckdb-linux-${TARGETARCH}.zip"; \
    unzip -q libduckdb.zip libduckdb.so -d /opt/duckdb; \
    rm libduckdb.zip

# --- API
FROM chef AS planner
COPY apps/server/ .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS server-builder
ENV DUCKDB_LIB_DIR=/opt/duckdb
COPY --from=libduckdb /opt/duckdb /opt/duckdb
COPY --from=planner /app/recipe.json recipe.json
COPY apps/server/.cargo .cargo
RUN cargo chef cook --release --locked --recipe-path recipe.json
COPY apps/server/ .
ARG HARMONY_VERSION=dev
RUN HARMONY_VERSION="$HARMONY_VERSION" cargo build --release --locked --bin server \
 && mkdir -p /out/data \
 && cp target/release/server /out/server

# --- Web: static SPA
FROM docker.io/library/node:26.10.0-slim@sha256:ec7758ee051e457b468b32bde57b0879010b325bb9862718e9615225ce4aaae1 AS web-builder
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
ARG HARMONY_VERSION=dev
ENV VITE_APP_VERSION=$HARMONY_VERSION
# The SPA prerender fetches a local preview server that listens on 127.0.0.1.
RUN NODE_OPTIONS=--dns-result-order=ipv4first pnpm --filter web build \
 && test -s apps/web/.output/public/_shell.html

# --- Runtime
FROM gcr.io/distroless/cc-debian12@sha256:e5d81ddde149641e2a9ba55be4545bc125c67de07508b03ba4c22e6eb0ded5aa
LABEL org.opencontainers.image.title="Harmony" \
      org.opencontainers.image.description="Spotify listening history analytics: web app, API and ingestion pipeline"

COPY --from=libduckdb /opt/duckdb/libduckdb.so /usr/lib/libduckdb.so
COPY --from=server-builder /out/server /app/server
COPY --from=web-builder /app/apps/web/.output/public /app/public
# Existing volumes are owned by uid 1001, so keep that uid instead of distroless nonroot.
COPY --from=server-builder --chown=1001:1001 /out/data /data

ENV HOST=0.0.0.0 \
    PORT=3000 \
    DATA_DIR=/data \
    STATIC_DIR=/app/public

WORKDIR /app
USER 1001:1001
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["/app/server", "healthcheck"]
ENTRYPOINT ["/app/server"]
