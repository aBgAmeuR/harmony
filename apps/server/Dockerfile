ARG RUST_VERSION=1.96.0
ARG CARGO_CHEF_VERSION=0.1.77
FROM lukemathwalker/cargo-chef:${CARGO_CHEF_VERSION}-rust-${RUST_VERSION}-bookworm AS chef
WORKDIR /app

# ---
FROM chef AS planner
COPY apps/server/ .
RUN cargo chef prepare --recipe-path recipe.json

# ---
FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
COPY apps/server/.cargo .cargo
RUN cargo chef cook --profile release-ci --recipe-path recipe.json

COPY apps/server/ .
RUN cargo build --profile release-ci --bin server \
    && cp target/release-ci/deps/libduckdb.so /tmp/libduckdb.so

# ---
FROM docker.io/library/debian:bookworm-slim AS runner
LABEL org.opencontainers.image.title="Harmony API" \
      org.opencontainers.image.description="Rust Axum upload API and Spotify history ingestion pipeline for Harmony"

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app

COPY --from=builder /tmp/libduckdb.so /usr/local/lib/libduckdb.so
COPY --from=builder /app/target/release-ci/server ./server

ENV LD_LIBRARY_PATH=/usr/local/lib

USER app

EXPOSE 3000

CMD ["./server"]
