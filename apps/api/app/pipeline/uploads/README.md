# Upload pipeline

This directory implements the **upload pipeline**: a sequential processing flow that turns a user-uploaded Spotify Extended Streaming History ZIP into validated, normalized, and persisted listening interactions with tracks resolved or created in the database.

## Overview

- **Input**: A multipart file (ZIP) containing JSON files from Spotify’s “Extended Streaming History” export.
- **Output**: Rows in `interactions` linked to `tracks` (and optionally new `artists`, `albums`, `tracks` created via MusicBrainz enrichment).
- **Invocation**: `UploadPackageService.execute(upload, file)` builds an `UploadContext`, runs `UploadPipeline.run(context)`, and updates the package status (`running` → `completed` or `failed`).

## Design patterns

### 1. Pipeline (middleware chain)

The pipeline is a **linear chain of stages**. Each stage receives the same **context** and a **next** function. A stage does its work, mutates the context, then calls `next()` to run the following stage. Control is synchronous with respect to the chain (no stage runs until the previous one has called `next()`).

```text
[ExtractArchive] → [ParseInteractions] → [NormalizeInteractions] → [ResolveTracks] → [EnrichTracks] → [PersistInteractions]
```

This matches the **middleware / pipeline** pattern: single responsibility per stage, shared mutable context, explicit continuation via `next()`.

### 2. Shared context (payload object)

All stages operate on a single **UploadContext** instance passed by reference. Stages read fields set by earlier stages and write fields for later ones. No stage receives or returns domain data directly; everything goes through the context. This keeps the pipeline API uniform and makes data flow explicit in one type.

### 3. Dependency injection (AdonisJS IoC)

The pipeline and each stage are constructed by the AdonisJS container. Stages that need services (e.g. `TrackMetadataSearchPipeline`, models) declare them in the constructor and use `@inject()`. The container resolves the pipeline and its dependencies recursively, so no manual wiring is required in application code.

### 4. Two-phase normalization for tracks

Track identity is established in two steps:

- **ResolveTracksStage**: For each unique track key in the catalogue, look up an existing track in the DB (by normalized artist + track + album). Populate `trackKeyToId` only for keys that already have a row.
- **EnrichTracksStage**: For keys not in `trackKeyToId`, call the MusicBrainz search pipeline, pick a recording, parse it, then create artists/album/track (and junction rows) in a transaction and add the new track id to `trackKeyToId`.

So `trackKeyToId` ends up containing every catalogue key that has a track (either pre-existing or newly created), and **PersistInteractionsStage** can safely map every normalized interaction to a `trackId` when the key exists.

## Context schema (data flow)

`UploadContext` is the single payload object passed through the pipeline. Fields are mutated in place by stages.

| Field | Type | Set by | Consumed by | Description |
|-------|------|--------|-------------|-------------|
| `upload` | `Package` | Caller | All | The package row for this upload (id, status, etc.). |
| `file` | `MultipartFile` | Caller | ExtractArchiveStage | The uploaded ZIP (tmp path, size, etc.). |
| `filesInArchive` | `{ filename, content }[]` | ExtractArchiveStage | ParseInteractionsStage | Extracted JSON files matching the Spotify history pattern. |
| `rawInteractions` | `AsyncIterable<ListeningInteraction \| undefined> \| null` | ParseInteractionsStage | NormalizeInteractionsStage | Validated (Vine) raw interactions; invalid items are skipped. |
| `normalizedInteractions` | `AsyncIterable<NormalizedListeningInteraction> \| null` | NormalizeInteractionsStage | PersistInteractionsStage | Normalized items with trackKey, ts, platform, msPlayed, etc. |
| `trackCatalogue` | `Map<string, TrackKey>` | NormalizeInteractionsStage | ResolveTracksStage, EnrichTracksStage | Unique track keys; key string is `artist-album-track` (normalized). |
| `trackKeyToId` | `Map<string, number>` | ResolveTracksStage, EnrichTracksStage | PersistInteractionsStage | Mapping from track key to DB track id. |

**TrackKey** (value in `trackCatalogue`): `{ artist, track, album }` (normalized strings).

**NormalizedListeningInteraction** (item of `normalizedInteractions`): `trackKey`, `ts`, `platform` (canonical), `msPlayed`, `reasonStart`, `reasonEnd`, `shuffle`, `skipped`, `offline`.

## Pipeline flow (mermaid)

```mermaid
sequenceDiagram
  participant Service as UploadPackageService
  participant Pipeline as UploadPipeline
  participant Ctx as UploadContext
  participant E as ExtractArchiveStage
  participant P as ParseInteractionsStage
  participant N as NormalizeInteractionsStage
  participant R as ResolveTracksStage
  participant En as EnrichTracksStage
  participant Persist as PersistInteractionsStage

  Service->>Ctx: create context (upload, file, empty maps)
  Service->>Pipeline: run(context)
  Pipeline->>E: handle(context, next)
  E->>E: read ZIP, unzip, filter JSON files
  E->>Ctx: filesInArchive = [...]
  E->>P: next()
  P->>P: iterate filesInArchive, parse JSON, validate with Vine
  P->>Ctx: rawInteractions = async generator
  P->>N: next()
  N->>N: for-await rawInteractions; build trackKey, catalogue, normalized buffer
  N->>Ctx: trackCatalogue, normalizedInteractions
  N->>R: next()
  R->>R: for each catalogue key: Track.findByKey(key)
  R->>Ctx: trackKeyToId.set(keyStr, id) when found
  R->>En: next()
  En->>En: for each key not in trackKeyToId: API search, pick recording, parse, persist
  En->>Ctx: trackKeyToId.set(keyStr, newTrackId)
  En->>Persist: next()
  Persist->>Persist: for-await normalizedInteractions; batch insert (500) with onConflictDoNothing
  Persist->>Pipeline: next() → done
  Pipeline->>Service: return
```

## Stage-by-stage behaviour

### 1. ExtractArchiveStage

- **Input**: `context.file` (ZIP), `context.filesInArchive` (empty).
- **Behaviour**: Reads the ZIP from disk, unzips in memory with `fflate`, keeps only entries whose path matches the Spotify Extended Streaming History pattern (`Streaming_History_Audio_*.json`). Stores `{ filename, content: Uint8Array }[]` in `context.filesInArchive`.
- **Output**: `context.filesInArchive` populated.
- **Design**: Pure I/O and filtering; no DB or external API.

### 2. ParseInteractionsStage

- **Input**: `context.filesInArchive`.
- **Behaviour**: For each file, decodes content to string, parses JSON (array or single object). For each item, runs Vine validation (`listeningInteractionValidator`). Valid items are yielded; invalid ones are skipped (no throw). Assigns an async generator to `context.rawInteractions`.
- **Output**: `context.rawInteractions` = async iterable of validated `ListeningInteraction` (or undefined for skipped).
- **Design**: Streaming parse + validate; one source of truth for “raw” schema.

### 3. NormalizeInteractionsStage

- **Input**: `context.rawInteractions`.
- **Behaviour**: Consumes the full raw stream. For each item: skips if missing required fields or `ms_played <= 30_000`. Otherwise normalizes track/album/artist names (track text normalizer), builds `trackKey = "${artist}-${album}-${track}"`, upserts into `context.trackCatalogue`, and appends a `NormalizedListeningInteraction` (with `normalizePlatform(raw.platform)`) to a buffer. Then sets `context.normalizedInteractions` to an async iterable over that buffer.
- **Output**: `context.trackCatalogue` and `context.normalizedInteractions` fully populated before `next()`.
- **Design**: Single full pass so downstream stages see a complete catalogue; platform and track keys are canonical for persistence and lookups.

### 4. ResolveTracksStage

- **Input**: `context.trackCatalogue`, empty `context.trackKeyToId`.
- **Behaviour**: For each `(keyStr, key)` in the catalogue, calls `Track.findByKey(key)` (DB lookup by normalized artist + track + album). If a track exists, sets `context.trackKeyToId.set(keyStr, existing.id)`. If not, does nothing.
- **Output**: `context.trackKeyToId` contains only keys that already had a track in the DB.
- **Design**: Read-only DB; no API, no writes. EnrichTracksStage will fill the rest.

### 5. EnrichTracksStage

- **Input**: `context.trackCatalogue`, `context.trackKeyToId`.
- **Behaviour**: For each catalogue key **not** in `trackKeyToId`, work runs in parallel (`Promise.all`). Per key: (1) `TrackMetadataSearchPipeline.search({ artist, recording, release })` wrapped in `retryWithBackoff` (MusicBrainz `ws/2` calls go **only** through configured HTTP proxies in `MusicBrainzApi`, not direct to MB). (2) From `recordings.recordings`, picks the first with no disambiguation or `disambiguation === "explicit"`. (3) Picks best release (Official only, prefer Digital Media, no secondary-types). (4) Parses to `ParsedRecording`. (5) **Album cover** is **not** resolved on this path: `albums.image` is left `null` for new rows (Cover Art Archive / `getReleaseCoverArtFrontUrl` can be filled later by a separate job). (6) In a DB transaction: firstOrCreate artists by MBID, firstOrCreate album by externalId with `image: null`, firstOrCreate track by externalId; inserts into `album_artists` and `track_artists` with `onConflict(...).ignore()`. (7) Sets `context.trackKeyToId.set(keyStr, track.id)`. Keys already in `trackKeyToId` are skipped (no API call).
- **Output**: `context.trackKeyToId` now includes every catalogue key that has a track (existing or newly created).
- **Design**: External API + transactional writes; idempotent via firstOrCreate and onConflict ignore. Rate limiting for MB is enforced per proxy in the SDK; concurrency is not capped at the stage level (parallelism is bounded by proxy count and network latency in practice).

### 6. PersistInteractionsStage

- **Input**: `context.normalizedInteractions`, `context.trackKeyToId`, `context.upload.id`.
- **Behaviour**: For-await over `normalizedInteractions`. For each item, `trackId = trackKeyToId.get(item.trackKey)`; if undefined, skip. Otherwise push a row `{ trackId, timestamp, msPlayed, platform, reasonStart, reasonEnd, shuffle, skipped, offline }` into a batch. When batch size reaches 500, call `Interaction.saveBatch(packageId, batch)` then clear the batch. After the loop, flush any remaining rows. `saveBatch` uses bulk insert with `onConflict(package_id, timestamp).ignore()` so re-runs do not fail.
- **Output**: Rows in `interactions` for this package; only interactions whose trackKey had a track id are persisted.
- **Design**: Batch write, single consumer of the normalized stream; duplicate-safe by conflict target.

## File layout

```text
uploads/
├── README.md                 (this file)
├── upload_context.ts         (UploadContext, NormalizedListeningInteraction, TrackKey)
├── upload_pipeline.ts        (UploadPipeline: stages array, run/dispatch)
├── upload_stage.ts           (UploadStage interface)
├── upload_progress_broadcaster.ts
└── stages/
    ├── extract_archive_stage.ts
    ├── parse_interactions_stage.ts
    ├── normalize_interactions_stage.ts
    ├── resolve_tracks_stage.ts
    ├── enrich_tracks_stage.ts
    └── persist_interactions_stage.ts
```

## Dependencies (conceptual)

- **ExtractArchiveStage**: Node `fs`, `fflate` (unzip). No DI.
- **ParseInteractionsStage**: Vine validator. No DI.
- **NormalizeInteractionsStage**: Track text normalizer, platform normalizer. Uses `@inject()` for container construction.
- **ResolveTracksStage**: `Track` model (`findByKey`). Uses `@inject()`.
- **EnrichTracksStage**: `TrackMetadataSearchPipeline` (uses `mbApi` from variants), `retryWithBackoff`, parsed recording helpers, `Artist`/`Album`/`Track` models, `db.transaction`. Uses `@inject()`.
- **PersistInteractionsStage**: `Interaction` model (`saveBatch`). Uses `@inject()`.

The pipeline itself is built by the container and receives all six stages via constructor injection.
