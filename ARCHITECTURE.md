# Architecture Overview

Living map of Harmony v3. Update when routes, data stores, pipeline stages, or
deployment change. Commands live in `AGENTS.md`; deploy details in `DEPLOY.md`.

## System

```text
[web] --upload/status/SSE--> [Axum API] --meta--> [Postgres: packages]
  |                              |
  |                              +--worker--> [pipeline] --harmony/{id}.duckdb--> [S3/R2]
  |                              ^
  +--BUCKET_URL .duckdb--------->|                    [Deezer via proxy]
  v
[DuckDB WASM analytics]
```

ZIP upload → Postgres package row + in-memory job → async pipeline (Deezer
enrich) → DuckDB artifact on S3/R2 → browser downloads via `BUCKET_URL` and
queries locally.

## Layout

```text
apps/web/          TanStack Start SPA (routes, features, upload UI)
apps/server/
  crates/server/   Axum, worker, pipeline, progress SSE, S3
  crates/db/       Diesel / Postgres
packages/          ui, charts, duckdb, upload, icons, font, config
```

## API

- `GET /health`
- `POST /api/v1/packages` — multipart ZIP (`file`, optional `selected_files`); `202` + `{public_id,status}`
- `GET /api/v1/packages/{id}` — metadata + progress JSON (`data`)
- `GET /api/v1/packages/{id}/stream` — SSE pipeline progress

Server modules: `http/` (adapters + `ApiError`), `worker`, `pipeline` (orchestrator
+ pure stages), `progress`, `storage` (S3 `ObjectStore`).

## Pipeline

Async Tokio orchestrator. CPU stages use `spawn_blocking`; Deezer + S3 upload
are awaited. Stages return `(Output, StageReport)`; only the orchestrator owns
progress/stats/spans.

`extract → parse → normalize → resolve → enrich → aggregate → verify → persist`

SSE folds `aggregate`/`verify`/`persist` into one `persist_interactions` step.
Persist key: `harmony/{public_id}.duckdb`.

## Data

| Store | Role |
| --- | --- |
| Postgres `packages` | Status, errors, progress JSON (`data`) |
| S3/R2 DuckDB | `artists`, `albums`, `tracks`, `interactions`, view `v_tracks_info` |
| `sessionStorage` | Upload session key `harmony:upload-session:v1` |

`package_data` remains in schema but is unused.

## Integrations

- **Spotify export** — user ZIP upload
- **Deezer** — `DEEZER_PROXY_URLS` + `DEEZER_PROXY_SECRET` (`X-Harmony-Secret`)
- **OpenTelemetry** — env-driven tracing on the API

## Deploy & env

Production: GHCR images + Portainer GitOps (`DEPLOY.md`). Compose pins image
tags; no NAS-side builds.

| Var | Used by |
| --- | --- |
| `DATABASE_URL` | API |
| `S3_ENDPOINT`, `S3_BUCKET` | API persist |
| `DEEZER_PROXY_URLS`, `DEEZER_PROXY_SECRET` | API enrich |
| `HOST`, `PORT` | API bind (default `127.0.0.1:3000`) |
| `API_URL`, `BUCKET_URL` | Web |

## Risks

- No auth; public IDs are bearer-like links
- `CorsLayer::permissive()` on the API
- Upload ZIPs live in process RAM until the worker finishes (lost on restart)
- Upload capped at 50 MiB; ZIP magic checked before queueing
