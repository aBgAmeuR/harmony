# Architecture

Map of Harmony v3. Update it when routes, data stores, pipeline stages or crates
change. Commands live in [`CONTRIBUTING.md`](../CONTRIBUTING.md), deployment in
[`DEPLOY.md`](./DEPLOY.md), UI rules in [`DESIGN.md`](./DESIGN.md).

## Data flow

```text
[web] --POST zip / SSE--> [Axum API] --> [worker] --> [pipeline]
  |                           |                           |
  |                           +-- in-memory store         +--> harmony/{id}.duckdb
  |                                                       |      (DATA_DIR or S3/R2)
  +-- GET /files/{id}.duckdb -----------------------------+
  v
[DuckDB WASM analytics in the browser]
```

1. The browser uploads a Spotify Extended Streaming History ZIP.
2. The API checks the size and the ZIP signature, stores a package in memory and
   returns `202` with a six character public ID.
3. A worker runs the pipeline, which enriches tracks and albums through Deezer.
4. The pipeline writes one DuckDB file per package, `harmony/{public_id}.duckdb`.
5. The browser downloads that file from `/files/{public_id}.duckdb` and runs every
   query locally with DuckDB WASM.

## Layout

```text
apps/web/        TanStack Start SPA: routes, features (DuckDB queries), upload UI
apps/benchmark/  Vite app used to benchmark DuckDB WASM queries
apps/server/     Cargo workspace for the Rust API
  crates/domain/    Types and ports: package, job, play, catalog, matching, progress
  crates/pipeline/  read, matching, enrich and write steps
  crates/adapters/  Deezer client, local disk store, S3 store
  crates/http/      Request handlers that do not read the environment
  crates/server/    Axum routes, environment config, worker, entry point
packages/        charts, duckdb, font, icons, ui, upload
tooling/         Shared config: tsconfig, oxlint, oxfmt, Tailwind theme
```

## API

| Route                              | Purpose                                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `GET /health`                      | Returns `ok`. The image `HEALTHCHECK` calls it.                                                                     |
| `GET /api/v1/config`               | `{ "max_upload_bytes": N }`                                                                                         |
| `POST /api/v1/packages`            | Multipart `file` (ZIP) and optional `selected_files` (JSON array of paths). `202` with `{ "public_id", "status" }`. |
| `GET /api/v1/packages/{id}/stream` | Server-sent events named `pipeline`. Each event is a full progress snapshot.                                        |
| `GET /files/{id}.duckdb`           | The package file, or a redirect to `S3_PUBLIC_URL` when it is set.                                                  |

`/files/demo.duckdb` redirects to `{S3_PUBLIC_URL}/demo.duckdb` and returns `404`
when no public URL is set. When `STATIC_DIR` is set, the API also serves the built
SPA and answers unknown `/api/*` paths with `404`. In development, Vite proxies
`/api` and `/files` to the API on port 3000.

Bad uploads return `400`. Unknown or malformed IDs return `404`.

## Pipeline

The worker runs four groups of steps in order: `read`, `matching`, `enrich`,
`write`. CPU-bound work runs on blocking threads. The Deezer lookups and the
storage write are awaited.

The progress snapshot lists seven steps. Their IDs are part of the stored
`package_meta.steps` JSON and of the SSE payload:

| Step ID                  | Label                  |
| ------------------------ | ---------------------- |
| `extract_archive`        | Extract archive        |
| `parse_interactions`     | Parse interactions     |
| `normalize_interactions` | Normalize interactions |
| `resolve_tracks`         | Resolve tracks         |
| `enrich_tracks`          | Enrich tracks          |
| `enrich_albums`          | Enrich albums          |
| `persist_interactions`   | Save interactions      |

A snapshot has `type: "snapshot"`, `seq`, `steps`, `runStatus` (`idle`, `running`,
`done`, `error`) and optional `startedAt`, `endedAt` and `stats`. The stream sends
the current snapshot first, then at most one per second and only when it changed.
The step list is defined in `crates/domain/src/stage.rs`, and a test checks that
it matches the web table.

## Data

| Store                           | Content                                          | Lifetime                        |
| ------------------------------- | ------------------------------------------------ | ------------------------------- |
| In-memory store                 | Queued and running packages, progress snapshots  | Lost when the API process stops |
| `DATA_DIR/harmony/{id}.duckdb`  | Finished package, default storage                | Persists on the volume          |
| S3-compatible bucket            | Same file, used when `S3_ENDPOINT` is set        | Persists in the bucket          |
| `sessionStorage` in the browser | Upload session under `harmony:upload-session:v1` | Browser session                 |

Every DuckDB file holds the tables `artists`, `albums`, `tracks`, `interactions`
and `package_meta`, plus the view `v_tracks_info`. The DDL is in
`crates/pipeline/src/write/sql/`. `package_meta` keeps the file name, size,
status, timings and the step snapshot, so a finished file stays readable after a
restart even though the in-memory package is gone.

## Integrations

- **Spotify export.** The user uploads the ZIP. There is no Spotify login.
- **Deezer.** By default the API calls Deezer directly, limited to
  `DEEZER_RATE_LIMIT` requests per second (default 8). With `DEEZER_PROXY_URLS` set,
  requests go through those proxies and carry the `X-Harmony-Secret` header
  (`DEEZER_PROXY_SECRET`).
- **OpenTelemetry.** Export is off until `OTEL_EXPORTER_OTLP_ENDPOINT` is set.

All server settings, with their defaults, are documented in
[`apps/server/.env.example`](../apps/server/.env.example). An invalid value stops
the server at startup.

## Known limits

- There is no authentication. A package is reachable by anyone who knows its
  six character ID, through both the stream and the file route.
- Queued and running imports are lost on restart and must be uploaded again.
- The upload limit defaults to 50 MB and is configurable from 1 to 2000 MB
  (`MAX_UPLOAD_MB`). The API holds the whole ZIP in memory.
