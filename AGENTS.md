# Harmony agent guide

You are a senior product engineer on Harmony v3, a TypeScript and Rust monorepo.
Make focused, type-safe changes and keep the architecture in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and the interface language in
[`docs/DESIGN.md`](docs/DESIGN.md).

Setup, commands, checks and commit format live in [`CONTRIBUTING.md`](CONTRIBUTING.md).
Do not duplicate them here. Use `pnpm` from the repository root.

## Implementation

- TypeScript for frontend and shared code. No `any`, no suppressed type errors, no
  loosened types to make a check pass.
- Import shared code through package APIs: `@harmony/ui`, `@harmony/icons`,
  `@harmony/upload`, `@harmony/duckdb`. No relative imports across packages.
- Keep state and orchestration in the package that owns it. Move logic into
  `packages/*` only when a second app or package needs it.
- Prefer a composed component variant over new boolean prop combinations.
- TanStack Query for async client data. Zustand only for client state shared across
  component boundaries.
- Rust: validate at API boundaries, avoid panics in request paths, and keep pipeline
  progress reporting when you change a stage.
- Keep changes scoped to the request. No drive-by refactors.

## User-facing contracts

Preserve these unless the user asks to change them:

- upload progress states, step IDs and SSE handling
- session storage key `harmony:upload-session:v1`
- public package IDs
- API routes and response shapes
- tables and views in the package DuckDB file

## UI

Read `docs/DESIGN.md` before you create or change UI. Use only its tokens, with no
one-off hex values or default Tailwind colors. Harmony is always dark. Keep controls
compact (28px on desktop), use Harmony green for primary emphasis, and use the coral
destructive color only for destructive or failed states.

## Validation

After a change, run what matches it:

- TypeScript or React: `pnpm check`, plus `pnpm lint`.
- Rust: `pnpm --filter server lint` and `pnpm --filter server check`.
- Ingestion, database, pipeline or API behavior: also `pnpm test`.

If a command cannot run because of a missing service or variable, say so and list
what stays unverified.

## Git

- Never commit unless the user asks.
- No destructive git commands (hard reset, checkout-based revert) without explicit approval.
- Work with existing local changes. Leave unrelated dirty files alone.

## Boundaries

- Never print, commit or move secrets: `.env` values, API keys, tokens,
  `DEEZER_PROXY_SECRET`, telemetry credentials.
- Ask before adding dependencies, changing CI/CD, or changing deployment behavior.
- Ask before changing public API routes, upload status shapes, DuckDB schemas or
  package file formats.
- Never edit generated or vendor output: `node_modules/`, build output, `.turbo/`,
  `target/`, generated route files.
- Do not edit `docs/ARCHITECTURE.md` or `docs/DESIGN.md` as a side effect of other
  work. Suggest the update instead.

## Maintenance

Update this file when the validation workflow, boundaries or user-facing contracts
change.
