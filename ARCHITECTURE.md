# Architecture Overview

This document is a living map of Harmony v3. Keep it updated when routes,
packages, services, data stores, pipeline stages, deployment targets, or major
integration points change.

## 1. Project Structure

Harmony is a TypeScript/Rust monorepo organized around one web application, a
Rust ingestion API, and shared packages for UI, upload orchestration, charts,
icons, fonts, and browser-side DuckDB access.

```text
[Project Root]/
├── apps/
│   ├── web/                         # TanStack Start/Vite React app
│   │   ├── src/
│   │   │   ├── routes/              # File-based routes
│   │   │   ├── components/          # App-specific layout, catalog, upload UI
│   │   │   ├── features/            # Feature query modules for DuckDB analytics
│   │   │   ├── lib/                 # Query client, upload client, stores
│   │   │   └── utils/               # Formatting helpers
│   │   ├── public/                  # Static assets such as demo imagery
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── server/                      # Rust workspace for upload API and ingestion
│       ├── crates/
│       │   ├── server/              # Axum HTTP API, worker, pipeline, SSE progress
│       │   └── db/                  # Diesel models, schema, and Postgres access
│       ├── migrations/              # Diesel SQL migrations
│       └── Cargo.toml
├── packages/
│   ├── charts/                      # Shared React chart components
│   ├── config/                      # Shared TypeScript configs
│   ├── duckdb/                      # DuckDB WASM initialization and query wrapper
│   ├── font/                        # Spotify Mix font CSS export
│   ├── icons/                       # HugeIcons-backed icon exports
│   ├── ui/                          # Shared shadcn/Base UI primitives and CSS
│   └── upload/                      # Upload client, SSE pipeline state, React hook
├── .agents/                         # Agent skills and project rules
├── .github/workflows/               # Release workflow configuration
├── CONTEXT.md                       # Product, schema, and feature context
├── DESIGN.md                        # Design system and interface guidelines
├── DEPLOY.md                        # Portainer GitOps / GHCR production deploy
├── Agents.md                        # Short agent-facing project summary
├── docker-compose.yml               # Production image-based compose (SHA-pinned)
├── package.json                     # Root workspace scripts
├── pnpm-workspace.yaml              # pnpm workspace and catalog versions
├── turbo.json                       # Turborepo task graph
└── ARCHITECTURE.md                  # This document
```

## 2. High-Level System Diagram

```text
[User]
  |
  v
[apps/web: TanStack Start React SPA]
  |        \
  |         \-- browser analytics queries --> [DuckDB WASM + package .duckdb file]
  |
  | HTTP multipart upload / status / SSE / DB download
  v
[apps/server: Rust Axum API]
  |
  | creates package metadata, records status/progress
  v
[Postgres: packages + package_data]
  |
  | background worker consumes in-memory upload job
  v
[Rust ingestion pipeline]
  |
  | extract -> parse -> normalize -> resolve -> enrich -> aggregate -> verify -> persist
  v
[DUCKDB_DATA_DIR/{public_id}.duckdb]
  ^
  |
[Deezer API via configured proxy URLs]
```

The web app uploads a Spotify Extended Streaming History ZIP to the Rust API.
The API stores package metadata in Postgres, keeps upload bytes in process
memory long enough for a worker job, and streams pipeline progress over SSE.
The pipeline enriches Spotify listening history with Deezer metadata, persists a
per-package DuckDB file, and exposes that file for browser-side DuckDB WASM
queries. Catalog and insight aggregations are intentionally client-local after
the DuckDB file has been fetched.

## 3. Core Components

### 3.1. Web App

Name: Harmony Web

Description: The beta user interface for uploading a Spotify export and browsing
the resulting package. It includes a landing page, an upload wizard, the
authenticated-style app shell, catalog routes for artists/tracks/albums, and
listening insight scaffolding.

Technologies: TypeScript, React 19, TanStack Start, TanStack Router, TanStack
Query, Vite, Nitro, Tailwind CSS v4, shadcn/Base UI primitives, Zustand,
DuckDB WASM.

Deployment: Built with Vite. The current release workflow is configured to push
container images to GHCR, although Dockerfiles are not present in the current
tree. Vercel is mentioned in the README as the recommended deployment target for
earlier Harmony documentation.

### 3.2. Rust Upload API

Name: Harmony Server

Description: Axum service that accepts Spotify package uploads, creates package
records, starts ingestion jobs, streams progress, returns package metadata, and
serves generated DuckDB files.

Technologies: Rust 2024 edition, Tokio, Axum, tower-http CORS, Diesel +
diesel-async, Postgres, DashMap, DuckDB, Polars, reqwest, OpenTelemetry tracing.

Deployment: Root scripts run it locally with `pnpm dev:server`, which delegates
to `cargo run --bin server` in `apps/server`. Runtime configuration comes from
environment variables.

HTTP surface:

- `GET /health` - health check.
- `POST /api/v1/packages` - multipart ZIP upload; returns `public_id`.
- `GET /api/v1/packages/{id}` - package metadata plus stored progress payload.
- `GET /api/v1/packages/{id}/stream` - Server-Sent Events pipeline progress.
- `GET /api/v1/packages/{id}/data` - package_data JSON payload.
- `GET /api/v1/packages/{id}/db` - generated DuckDB binary file.

### 3.3. Ingestion Pipeline

Name: Spotify Package Pipeline

Description: Synchronous pipeline run inside a Tokio blocking worker task. It
extracts selected files from the uploaded ZIP, parses Spotify history rows,
normalizes interactions, resolves and enriches tracks through Deezer, aggregates
package-level data, verifies referential integrity, and writes the final DuckDB
database.

Technologies: Rust, zip, regex, reqwest, Deezer proxy API, Polars, Parquet,
DuckDB, tracing.

Pipeline stages:

- `extract` - read ZIP entries and apply optional selected-file filtering.
- `parse` - validate raw Spotify interaction JSON.
- `normalize` - keep supported plays and normalize fields.
- `resolve` - map Spotify track metadata to Deezer track IDs.
- `enrich` - fetch Deezer track, album, and artist metadata.
- `aggregate` - produce package summary data.
- `verify` - remove invalid references before persistence.
- `persist` - write Parquet intermediates, create tables/views, and write
  `{public_id}.duckdb`.

### 3.4. Shared Packages

- `@harmony/ui` provides reusable UI primitives, global CSS, hooks, and utility
  exports.
- `@harmony/charts` provides shared React chart components built on VisX, D3,
  Motion, and Number Flow.
- `@harmony/duckdb` initializes DuckDB WASM, downloads a package DuckDB file,
  attaches it read-only as `pkg`, and exposes a small `db.init/query/status`
  API.
- `@harmony/upload` provides the upload client, pipeline state reducer, SSE
  stream integration, and React hooks for upload progress.
- `@harmony/icons` wraps HugeIcons exports for consistent icon usage.
- `@harmony/font` exports the Spotify Mix CSS.
- `@harmony/config` centralizes TypeScript config files.

## 4. Data Stores

### 4.1. Package Metadata Database

Name: Harmony Postgres

Type: PostgreSQL

Purpose: Stores upload/package metadata, processing status, errors, timestamps,
and JSON progress or aggregate payloads.

Key tables:

- `packages` - `id`, public package identifier, file metadata, status,
  timestamps, error fields, and optional progress JSON.
- `package_data` - one JSONB payload per `public_id`.

Access layer: `apps/server/crates/db` via Diesel and diesel-async.

### 4.2. Per-Package Analytics Database

Name: Package DuckDB Files

Type: DuckDB files on local/server storage

Purpose: Stores normalized catalog and listening-event data for one imported
Spotify package. Files are generated under `DUCKDB_DATA_DIR` as
`{public_id}.duckdb`, served to the browser, and queried locally through DuckDB
WASM.

Tables:

- `artists`
- `albums`
- `tracks`
- `interactions`

Views:

- `v_tracks_info` - denormalized track, album, and artist display view.

### 4.3. Browser Session Storage

Name: Upload Session

Type: `sessionStorage`

Purpose: Stores the in-progress upload session under
`harmony:upload-session:v1`, including the public package ID, original file
name, and selected/deployed files. This is UI state only and is guarded with
runtime validation and storage error handling.

## 5. External Integrations / APIs

Service Name: Spotify Data Export

Purpose: User-provided Extended Streaming History ZIP is the source data for
listening events.

Integration Method: File upload through the web app to `POST /api/v1/packages`.

Service Name: Deezer API

Purpose: Resolves and enriches Spotify listening records with track, artist, and
album metadata.

Integration Method: HTTP requests through configured proxy URLs. The server uses
`DEEZER_PROXY_URLS` and `DEEZER_PROXY_SECRET`; proxy requests include the
`X-Harmony-Secret` header.

Service Name: OpenTelemetry Collector

Purpose: Tracing, metrics, and logs for the Rust service.

Integration Method: OpenTelemetry/tracing crates. Collector/exporter details are
environment-driven by the telemetry setup.

## 6. Deployment & Infrastructure

Production runs on a self-hosted NAS via Portainer CE GitOps. Images are built
and pushed to GHCR on the `v3` branch; CI pins commit SHAs in
`docker-compose.yml` so Portainer polling redeploys without Watchtower or
webhooks. Full Portainer setup steps live in `DEPLOY.md`.

Key Services Used:

- Web runtime/build: Vite, Nitro, TanStack Start.
- API runtime: Rust Axum service.
- Database: PostgreSQL.
- File storage: DuckDB files under `/data/duckdb` in the API container
  (see `db_file.rs`; persist via a host/volume mount in Portainer if needed).
- Object storage: S3-compatible (Cloudflare R2).
- Observability: OpenTelemetry-compatible tracing.
- Container registry: GHCR (`ghcr.io/abgameur/harmony/{web,api}`).

CI/CD Pipeline:

- GitHub Actions release workflow on pushes to `v3`.
- Lint with pnpm, build/push `apps/web/Dockerfile` and `apps/server/Dockerfile`
  (tags `:latest` and `:<sha>`), then commit pinned tags into
  `docker-compose.yml` with `[skip ci]`.
- `docker-compose.yml` uses GHCR `image:` tags only (no NAS-side builds).

Local development commands:

- `pnpm install` - install workspace dependencies.
- `pnpm dev` or `pnpm dev:web` - run the web app through Turbo.
- `pnpm dev:server` - run the Rust server.
- `pnpm check-types` - run TypeScript checks through Turbo.
- `pnpm check:server` - run `cargo check`.
- `pnpm test:server` - run Rust tests.
- `pnpm check` - run oxlint and oxfmt.

## 7. Security Considerations

Authentication: No active application authentication is visible in the current
v3 code paths. Package access is based on short public IDs. Older README content
mentions Spotify OAuth/NextAuth, but those packages/routes are not present in
the current tree.

Authorization: Package endpoints accept public IDs and do not currently enforce
user ownership. Treat public IDs as bearer-like links until account/auth
boundaries are introduced.

Upload validation:

- Uploads are limited to 50 MiB at the Axum route layer.
- The upload endpoint requires a ZIP magic header before queueing work.
- `selected_files` must be valid non-empty JSON when provided.
- Package IDs used in file paths are sanitized before lookup.

Data encryption:

- TLS is expected at the deployment edge.
- At-rest encryption depends on the chosen Postgres and filesystem deployment.

Integration secrets:

- Deezer proxy access uses `DEEZER_PROXY_SECRET` and the `X-Harmony-Secret`
  request header.
- `DATABASE_URL` and telemetry credentials should stay server-only.
- The frontend only needs public runtime values such as `API_URL` and
  `BUCKET_URL`.

Notable risk:

- `CorsLayer::permissive()` is enabled in the API. Narrow this before exposing a
  public production deployment.
- Uploaded ZIP bytes are stored in process memory until the background worker
  removes them, so process restarts can lose pending upload bytes.

## 8. Development & Testing Environment

Runtime and package tooling:

- Node/pnpm workspace managed by `pnpm-workspace.yaml`.
- Turborepo task graph in `turbo.json`.
- TypeScript config shared through `@harmony/config`.
- Rust workspace in `apps/server`.

Testing and quality tools:

- TypeScript: `pnpm check-types`.
- Rust type/build check: `pnpm check:server`.
- Rust tests: `pnpm test:server`.
- Lint/format: `oxlint` and `oxfmt` via `pnpm check`.
- Vite plugin checker runs oxlint during web development.

Required local environment:

- `DATABASE_URL` for Postgres.
- `DUCKDB_DATA_DIR` for generated DuckDB files.
- `API_URL` for the web upload client.
- `HOST` and `PORT` for the Rust API bind address; defaults are
  `127.0.0.1:3000`.
- Deezer proxy variables when running ingestion against Deezer metadata.
