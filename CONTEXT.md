
# CONTEXT
**Project ID:** harmony

## 1. Visual Theme & Atmosphere

Harmony is a **dark, data-forward music analytics dashboard** that feels like a premium companion to streaming culture — intimate, analytical, and unmistakably music-native. The interface is **ompact yet breathablec**: dense enough to surface rich listening statistics at a glance, but never cluttered. The aesthetic borrows the visual confidence of Spotify's ecosystem (signature green, rounded album art, familiar typography) while maintaining its own identity through a **utilitarian analytics shell** — sidebar navigation, ranked tables, metric columns, and filter toolbars.

The overall mood is **nocturnal and focused**. Pure black canvas grounds the experience; layered charcoal surfaces create subtle depth without heavy shadows. Vibrant Spotify Green acts as a pulse — logo, active controls, AI badges, and chart accents — cutting through the darkness like a playhead on a waveform. The result feels **professional, personal, and slightly editorial**: your listening history presented with the care of a curated report, not a raw spreadsheet.

**Key Characteristics:**
- Always-dark interface with high-contrast white text on near-black backgrounds
- Spotify-inspired green as the sole chromatic accent
- Compact, information-dense layouts optimized for catalog browsing (artists, tracks, albums)
- Flat elevation model — depth conveyed through surface color steps, not drop shadows
- Thin-stroke iconography with muted default states and green active highlights
- Tabular data presentation with rank badges, thumbnail avatars, and right-aligned metrics

## 2. Color Palette & Roles

### Primary Foundation
- **Absolute Void Black** (#000000) — Primary page background. Creates an immersive, theater-like canvas that lets album artwork and green pop accents.
- **Charcoal Panel** (#2E2E2E) — Sidebar and card surface color. Provides a subtle lift from the black background without breaking the dark continuum.
- **Deep Graphite** (#3C3C3C) — Muted surface for table headers, input backgrounds, and recessed UI zones. Used at 50% opacity for sticky table header bands.
- **Mid Graphite** (#474747) — Secondary button and interactive surface fill. Slightly lighter than muted for clickable affordances.
- **Hover Slate** (#434343) — Sidebar accent and row hover states. A gentle step brighter for active navigation items.

### Accent & Brand
- **Spotify Pulse Green** (#1ED760) — Primary brand color. Used for the Harmony logo bars, primary buttons, active view-toggle segments, "AI" badges, chart line accents, and link text. This is the emotional anchor of the entire system.
- **Logo Backdrop Charcoal** (#141414) — Dark rounded square behind the logo mark. Provides contrast for the green bars within the brand icon.

### Typography & Text Hierarchy
- **Pure Studio White** (#FFFFFF) — Primary text for headings, artist names, metric values, and active navigation labels.
- **Soft Silver Gray** (#E0E0E0) — Muted foreground for secondary text: table column headers, breadcrumb segments, unit labels ("min"), sidebar icons, and descriptive metadata.
- **Whisper Border White** (rgba(255,255,255,0.10)) — Hairline dividers between header and content, sidebar edges, and card rings. Nearly invisible structural separation.

### Input & Interactive Surfaces
- **Translucent Input Fill** (rgba(255,255,255,0.15)) — Search fields and form inputs. A frosted-glass effect over the dark background.
- **Focus Ring Gray** (#8E8E8E) — Keyboard focus rings at 30% opacity around interactive elements.

### Rank & Status Colors
- **Champion Gold** (#FBBF24 at 20% fill, #FCD34D text) — First-place rank badge with amber ring. Celebrates top listening position.
- **Runner-Up Silver** (#94A3B8 at 20% fill, #E2E8F0 text) — Second-place rank badge with cool slate ring.
- **Third Place Bronze** (#C2410C at 25% fill, #FED7AA text) — Third-place rank badge with warm orange ring.
- **Alert Coral** (#F87171) — Destructive actions, validation errors, and critical system feedback.

### Chart Palette (Insights Views)
- **Chart Green 1–5** (#A7F3C7 → #065F46 gradient family) — Five-step green scale derived from the primary hue. Used for area charts, bar fills, and data visualization layers, lightest for foreground series and darkest for background depth.

## 3. Typography Rules

**Primary Font Family:** Spotify Mix
**Fallback Stack:** ui-sans-serif, system-ui, sans-serif
**Character:** A geometric sans-serif with the rounded warmth of streaming-platform typography. Clean numerals with tabular alignment support for data columns.

### Weights Available
- **Regular (400)** — Body text, descriptions, placeholder text, sidebar labels
- **Bold (700)** — Brand wordmark ("Harmony"), emphasized headings
- **Extrabold (800)** — Hero headlines on marketing/landing pages

### Hierarchy & Usage
- **Brand Wordmark:** Bold (700), `text-xl`, tight tracking (`tracking-tight`). The "Harmony" label in the sidebar header.

## 4. Layout & Structure

### Application Shell
- **Two-panel frame:** A fixed left sidebar paired with a fluid main content area (`SidebarInset`). The shell wraps every authenticated package view and persists across route changes.
- **No max-width constraint:** Main content stretches to the full viewport width — optimized for wide tables and charts rather than centered editorial columns.

### Sidebar Architecture
- **Width:** 256px expanded (`16rem`), 48px collapsed to icon-only (`3rem`). Collapsible via edge rail or keyboard shortcut (Cmd/Ctrl+B).
- **Vertical zones (top → bottom):**
  1. **Header** — Brand logo + "Harmony" wordmark
  2. **Search** — Full-width command input with "Ctrl K" hint
  3. **Main** — Overview, My Package
  4. **Library** — Artists, Tracks, Albums
  5. **Insights** — Listening Habits, Personality (AI), Discoveries, Milestones
  6. **Social** — Compare, Export
  7. **Footer** — Github, Documentation, Settings
- **Mobile:** Sidebar becomes a slide-over sheet at 288px (`18rem`).

### Page Content Structure
Every catalog and insight route follows a consistent two-tier layout:

1. **Content header bar** — Horizontal strip with hairline bottom border (`border-b border-border`, 16px horizontal / 8px vertical padding)
   - **Left:** Page title + breadcrumb segment (e.g. "Artists / All Artists") with optional dropdown
   - **Right:** Toolbar cluster — Filters button, view-mode toggle (list/grid), date-range picker
2. **Primary content** — Data table, chart, or empty-state card filling the remaining viewport height

### Catalog Table Grid
- **Column structure:** Rank (#) · Title (avatar + name stack) · Streams · Time Listened
- **Header band:** Deep Graphite at 50% opacity, 28px row height, muted extra-small labels
- **Body rows:** Full-width clickable rows; no vertical cell borders
- **Alignment:** Rank centered, title left-aligned with truncation, metrics right-aligned with tabular numerals
- **Edge padding:** 16px inset on first and last columns

### Spacing & Rhythm
- **Base radius:** 10px (0.625rem) applied globally to buttons, inputs, cards, and avatars
- **Toolbar gap:** 4px between adjacent header controls
- **Sidebar item gap:** 8px within groups; labeled section breaks between nav categories
- **Density:** Compact by default — row heights, button heights (28px), and font sizes prioritize data visibility over decorative whitespace

### Responsive Behavior
- **Desktop:** Persistent sidebar with optional icon-only collapse
- **Tablet / mobile:** Sidebar hidden behind sheet overlay; main content occupies full width
- **Tables:** Horizontal scroll on narrow viewports; column minimum widths preserve metric alignment
- **Touch targets:** Minimum 28px height on all interactive controls

## 5. DuckDB Data Schema

Each imported Spotify listening package is materialized as a **standalone DuckDB file** (`{public_id}.duckdb`) on the server. The ingestion pipeline writes catalog metadata and play events into four normalized tables, exposes a denormalized view for track display, and serves the file to the browser where **DuckDB WASM** runs analytics queries client-side.

### Architecture

```
Spotify export → Pipeline (Rust/Polars) → Parquet staging → DuckDB file
                                                              ↓
Browser ← DuckDB WASM (read-only ATTACH) ← GET /api/v1/packages/:id/db
```

- **Server:** The persist stage builds Polars DataFrames, writes Parquet intermediates, creates tables, bulk-loads data, and defines views. Files live under `DUCKDB_DATA_DIR`.
- **Client:** `@harmony/duckdb` fetches the binary file, registers it in WASM memory, and attaches it as a read-only schema (`pkg`). All catalog and insight queries run against this local copy — no round-trips for aggregations.

### Entity Model

The schema separates **catalog entities** (artists, albums, tracks — enriched from Deezer) from **listening events** (interactions — sourced from Spotify history). Tracks reference albums; interactions reference tracks. Artist membership is modeled as ordered ID arrays on albums and tracks rather than a join table.

```
artists ←── albums.artists[]     albums ←── tracks.album_id
   ↑            tracks.artists[]       ↑            ↑
   └──────────── unnest + JOIN ────────┴── interactions.track_id
```

### Tables

#### `artists`
Deezer artist metadata. Primary key is the Deezer artist ID.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UINTEGER` PK | Deezer artist ID |
| `name` | `VARCHAR` | Display name |
| `picture` | `VARCHAR` | Avatar/cover image URL |

#### `albums`
Deezer album metadata. Artists stored as an ordered array of artist IDs.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UINTEGER` PK | Deezer album ID |
| `title` | `VARCHAR` | Album title |
| `cover` | `VARCHAR` | Cover art URL |
| `release_date` | `DATE` | Release date |
| `genres` | `VARCHAR[]` | Genre tags |
| `nb_tracks` | `INTEGER` | Track count on album |
| `duration` | `INTEGER` | Total duration in seconds |
| `album_type` | `VARCHAR` | `"Album"` or `"Single"` |
| `artists` | `UINTEGER[]` | Ordered Deezer artist IDs |

#### `tracks`
Deezer track metadata. Links to a parent album; carries its own ordered artist list.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UINTEGER` PK | Deezer track ID |
| `title` | `VARCHAR` | Track title |
| `duration` | `INTEGER` | Track length in seconds |
| `track_position` | `INTEGER` | Position on disc |
| `disk_number` | `INTEGER` | Disc number |
| `release_date` | `DATE` | Release date |
| `album_id` | `UINTEGER` FK → `albums.id` | Parent album |
| `artists` | `UINTEGER[]` | Ordered Deezer artist IDs |

#### `interactions`
Individual Spotify play events. One row per listen; the fact table for all analytics.

| Column | Type | Description |
|--------|------|-------------|
| `ts` | `TIMESTAMP` | When the track was played |
| `platform` | `VARCHAR` | Client platform (e.g. iOS, web player) |
| `ms_played` | `INTEGER` | Milliseconds listened |
| `shuffle` | `BOOLEAN` | Played from shuffle mode |
| `skipped` | `BOOLEAN` | Track was skipped |
| `offline` | `BOOLEAN` | Played offline |
| `track_id` | `UINTEGER` FK → `tracks.id` | Resolved Deezer track |

### Views

#### `v_tracks_info`
Denormalized track display layer. Joins tracks → albums and resolves artist ID arrays into comma-separated name strings. Used by catalog queries for tracks and albums.

| Column | Source |
|--------|--------|
| `track_id`, `track_name`, `track_artist_ids` | `tracks` |
| `album_id`, `album_title`, `album_artist_ids`, `image` | `albums` (via `tracks.album_id`) |
| `track_artists_description` | `string_agg` over `unnest(tracks.artists)` → `artists.name` |
| `album_artists_description` | `string_agg` over `unnest(albums.artists)` → `artists.name` |

### Query Conventions

All listening metrics derive from the `interactions` table:

- **Streams** — `COUNT(*)` (one stream per interaction row)
- **Playtime** — `SUM(ms_played) / 60000` (total minutes listened)

**Top artists** unnest `tracks.artists` and group by artist ID, since a track can credit multiple artists.

**Top tracks / albums** join `interactions` → `v_tracks_info` and group by `track_id` or `album_id` respectively.

**Time-series** (e.g. monthly listens) aggregate `interactions.ts` with `date_trunc('month', ts)` and `strftime` for labels.

### Constraints & Notes

- Foreign keys: `tracks.album_id` → `albums.id`, `interactions.track_id` → `tracks.id`
- Artist arrays preserve Deezer ordering; `unnest … WITH ORDINALITY` maintains display order when resolving names
- IDs are Deezer identifiers throughout — Spotify track names are resolved to Deezer IDs during pipeline ingestion
- The client database is **read-only**; re-importing a package replaces the server-side file entirely

## 6. App Features

Harmony v3 is in **beta**. The ingestion pipeline and catalog browsing are functional; insights, social, and account features are mostly scaffolded in navigation.

### Available

| Feature | Description |
|---------|-------------|
| **Spotify import** | Upload a Spotify Extended Streaming History ZIP via the server API. A background worker runs the full pipeline (extract → parse → normalize → resolve → enrich → aggregate → verify → persist) and produces a per-package DuckDB file. |
| **Client-side analytics** | Each package loads its DuckDB file into WASM on first visit. Aggregations run locally — no server round-trips for queries. |
| **Library — Artists** | Ranked table of top artists by playtime: avatar, name, stream count, minutes listened. |
| **Library — Tracks** | Ranked table of top tracks with album art, artist description, streams, and playtime. |
| **Library — Albums** | Ranked table of top albums with cover art, artist description, streams, and playtime. |
| **Date range filter** | Month-picker toolbar control with a listening-activity heatmap (monthly stream counts). Preset and custom range modes. |
| **App shell** | Persistent sidebar navigation, page headers with breadcrumbs, view-mode toggle (list/grid), and responsive layout. |

### Coming Soon

| Feature | Status |
|---------|--------|
| **Upload UI** | Route exists (`/upload`); backend upload API is ready. Frontend form not yet built. POC is work |
| **Overview** | Dashboard landing for a package — nav item defined, no route yet. |
| **My Package** | Package metadata and import status. |
| **Listening Habits** | Route scaffolded; monthly-listens query exists but charts and habit breakdowns are not wired. |
| **Personality (AI)** | AI-generated listening personality profile — nav placeholder. |
| **Discoveries** | Surface new artists and tracks from listening history — nav placeholder. |
| **Milestones** | Listening achievements and streaks — nav placeholder. |
| **Compare** | Side-by-side stats with another user — nav placeholder. |
| **Export** | Share or download listening reports — nav placeholder. |
| **Settings** | User and package preferences — nav link, no route yet. |
| **Filters** | Header filter button present; advanced filtering (platform, shuffle, skipped, date-scoped queries) not yet connected to catalog views. |

