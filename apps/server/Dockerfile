ARG RUST_VERSION=1
FROM lukemathwalker/cargo-chef:latest-rust-${RUST_VERSION}-bookworm AS chef
WORKDIR /app

# ---
FROM chef AS planner
COPY apps/server/ .
RUN cargo chef prepare --recipe-path recipe.json

# ---
FROM chef AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    cmake \
    clang \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --profile release-ci --recipe-path recipe.json

COPY apps/server/ .
RUN cargo build --profile release-ci --bin server

# ---
FROM docker.io/library/debian:bookworm-slim AS runner
LABEL org.opencontainers.image.title="Harmony API" \
      org.opencontainers.image.description="Rust Axum upload API and Spotify history ingestion pipeline for Harmony"

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app

COPY --from=builder /app/target/release-ci/server ./server

EXPOSE 3000

CMD ["./server"]
