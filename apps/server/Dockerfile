ARG RUST_VERSION=1
FROM docker.io/library/rust:${RUST_VERSION}-bookworm AS base
WORKDIR /app

# ---
FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    cmake \
    clang \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY apps/server/ .
RUN cargo build --release --bin server

# ---
FROM docker.io/library/debian:bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app

COPY --from=builder /app/target/release/server ./server

EXPOSE 3000

CMD ./server
