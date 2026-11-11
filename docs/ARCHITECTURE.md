# Architecture

Map of Harmony v3. Update it when routes, data stores, pipeline stages or crates
change. Commands live in [`CONTRIBUTING.md`](../.github/CONTRIBUTING.md), deployment in
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
apps/web/        TanStack Start SPA, organized in layers (see Web app)
apps/server/     Cargo workspace for the Rust API
  crates/domain/    Types and ports: package, job, play, catalog, matching, progress
  crates/pipeline/  read, matching, enrich and write steps
  crates/adapters/  Deezer client, local disk store, S3 store
  crates/http/      Request handlers that do not read the environment
  crates/server/    Axum routes, environment config, worker, entry point
packages/        charts, duckdb, font, icons, ui, upload
tooling/         Shared config: tsconfig, oxlint, oxfmt, Tailwind theme
```

## Web app

`apps/web/src` follows [Feature-Sliced Design](https://fsd.how/docs/get-started/overview/),
with one extra layer, `data/`, that owns every DuckDB query. A layer imports only
from the layers below it.

```text
routes/      TanStack file routes: search validation, loader, component → a page
   ↓
app/         providers, query client
   ↓
pages/       one folder per route: page.tsx (composition) + load.ts (prefetch)
   ↓
widgets/     blocks used by pages: base (Notion-like views), item (item pages), page (shell),
             app-nav, track-details, and the sections of each insight page
   ↓
features/    user actions with their own state: filter-period, pick-artist, track-panel, upload,
             data-figure (view switch and expand dialog of a figure)
   ↓
entities/    business nouns: artist, track, package, measure (chart series of a measure)
   ↓
data/        the analytics engine: SQL on DuckDB WASM, no React
   ↓
shared/      primitives, lib (date, format, query) and scope (global filter state)
```

### Analytics engine

Only `data/` imports `@harmony/duckdb`. Everything the app counts goes through it:

```text
data/filter.ts    Filter = { from?, to?, rules[] }. A rule is a play field (artist, album artist,
                  album, track, genre, platform, album type, release year, shuffle, skipped,
                  offline) with is / not / > / <. `playsFrom` builds the FROM over
                  `interactions i`, joining `tracks t` and `albums al` only when read.
data/measures.ts  The only definition of each measure: streams, playtime (minutes), tracks,
                  albums, artists, active days, skip / shuffle / offline / finished rates,
                  completion, first and last play. Label and format kind included.
data/aggregate.ts aggregate({ by, measures, filter }): one row per artist, track, album, genre,
                  platform, release year, hour, day / week / month / year, or positional bucket.
                  `fill` returns empty buckets, `over` splits each group by period.
                  `totals` and `series` are the two common shapes. `unitFor` is the bucket rule.
data/bases.ts     The bases (see below), their list query and trends.
data/*.ts         Analyses that need their own SQL, built on `playsFrom`: overview, streak,
                  milestones, items, track, releases, values (filter pickers), packages.
```

A widget never writes SQL: it builds query options with `query(name, fn)` from
`shared/lib/query.ts`, whose key is the name plus the arguments (dates as days). A
loader and a component that pass the same arguments share one cache entry. Keys do not
name the package: the app loader clears the cache when another package opens.

### Bases and views

Every resource is a base with its own properties, like a Notion database:

| Base    | Rows                                | Opens       |
| ------- | ----------------------------------- | ----------- |
| Artists | artists heard in the period         | artist page |
| Tracks  | tracks, with album and release year | track panel |
| Albums  | albums, with type and release year  | album page  |
| Genres  | album genres                        | genre page  |
| Plays   | every play                          | track panel |

The Explorer shows the first four; Plays only feeds the track panel's history.

`widgets/base/BaseView` shows a base as a ranked list or a gallery, in the period of the
header. A list row has its rank and its change since the previous period, the item, a
trend in bars, then the time listened with the sorted value under it; bars behind the
rows and the rank changes can be turned off. A view can filter on play fields and on row
properties (chips), search and sort. The Explorer picks the base next to the page title
and keeps the view in the URL (`base`, `view`, `sort`, `desc`, `rules`, `q`, `bars`,
`diffs`); switching base keeps what the new base supports. Item pages embed bases with a
local view and a fixed rule (an artist page lists that artist's tracks and albums).

### Global scope

`shared/scope` holds the period and the picked artist:

```text
Scope = { from: Date, to: Date, artistId?: number }

features/filter-period ──writes──▶ period store   (localStorage "harmony:date-range")
features/pick-artist   ──writes──▶ artist store   (localStorage "harmony-selected-artist")
showPeriod(grain, day) ──writes──▶ period store   (a month or a year opened from a chart)
                                        │
                  useScope() / readScope() ◀── widgets, pages, loaders
```

The period is a global filter kept in `localStorage`, not in the URL. `scopeFilter`
turns a scope into a `Filter`. Listening, Milestones and Discoveries apply the picked
artist; Overview and item pages use the period only; bases filter on artists with chips.

### Primitives

`shared/primitives` holds composable blocks that know the product look but not the
business: they never fetch and never import an entity.

| Primitive | Parts                                      |
| --------- | ------------------------------------------ |
| `Pane`    | `Header`, `Title`, `Body`                  |
| `Table`   | `Head`, `Col`, `Body`, `Row`, `Cell`       |
| `Media`   | `Art`, `Body`, `Title`, `Sub`, `End`       |
| `Section` | `Head`, `Title`, `Text`, `Action`          |
| `Stat`    | `Label`, `Value`, `Hint`, `Aside`          |
| `Meter`   | `Seg`                                      |
| `Steps`   | `Item`, `Label`, `Time`                    |
| `Lede`    | `Kicker`, `Title`, `Text`, `Em`, `Pending` |

Others: `Art`, `Crumbs`, `Delta`, `Empty`, `Grid`, `Icons`, `Meta`, `Num`, `Rank`,
`Spark`, `Toolbar`. Entities and widgets map their data to primitives, not the other
way round.

### Conventions

- One `index.ts` per entity, feature and primitive is its public API. Import widgets
  by file path, not through a barrel: barrels of widgets break the production
  prerender (a chunk cycle between tslib and `@harmony/charts`).
- Inside a slice, import siblings with relative paths. Across slices, use `@/`.
- Routes stay thin. A new page is `pages/{name}/page.tsx` and `load.ts`, plus a route
  file that wires `loader` and `component`, inside `widgets/page` `Page`.
- Percentages are fractions between 0 and 1. Minutes stay unrounded until displayed.
- Code style: `type` instead of `interface` (except `declare module` augmentation),
  `const name = () =>` instead of `function`, named exports only, Tailwind classes
  from `DESIGN.md` only.

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
| `localStorage` in the browser   | Period, selected artist, pane layouts            | Until the user clears it        |

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
