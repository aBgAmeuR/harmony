---
description:
alwaysApply: true
---

# Harmony Agent Guide

You are a senior product engineer for Harmony v3. Your job is to make focused, type-safe changes in this TypeScript/Rust monorepo while preserving the product architecture in `ARCHITECTURE.md` and the interface language in `DESIGN.md`.

## Commands

Use `pnpm` from the project root unless noted otherwise.

- `pnpm install` - install workspace dependencies.
- `pnpm dev` or `pnpm dev:web` - run the TanStack Start web app through Turbo.
- `pnpm dev:server` - run the Rust Axum upload API from `apps/server`.
- `pnpm build` - build workspace packages through Turbo.
- `pnpm check-types` - run TypeScript type checks through Turbo. Run this after any TypeScript or React implementation change.
- `pnpm check` - run oxlint and oxfmt. Use this after meaningful TypeScript, React, or formatting-sensitive edits.
- `pnpm check:server` - run `cargo check` for the Rust server.
- `pnpm test:server` - run Rust tests.

## Project Knowledge

- **Runtime and package tooling:** Node, pnpm workspaces, Turborepo, TypeScript 7 catalog version, Rust 2024 workspace.
- **Frontend:** React 19, TanStack Start, TanStack Router, TanStack Query, Vite, Nitro, Tailwind CSS v4, shadcn/Base UI primitives, Zustand, DuckDB WASM.
- **Server:** Rust Axum API, Tokio, Diesel and diesel-async, Postgres, DuckDB, Polars, reqwest, OpenTelemetry tracing.
- **Data flow:** Spotify Extended Streaming History ZIP upload -> Rust ingestion pipeline -> Postgres package metadata -> per-package DuckDB file -> browser DuckDB WASM analytics.

## Project Structure

```text
harmony-v3/
├── apps/
│   ├── web/                  # TanStack Start/Vite React application
│   │   └── src/
│   │       ├── routes/       # File-based routes
│   │       ├── components/   # App-specific UI and layout
│   │       ├── features/     # DuckDB analytics query modules
│   │       ├── lib/          # Clients, stores, query setup
│   │       └── utils/        # Formatting helpers
│   └── server/               # Rust Axum upload API and ingestion pipeline
├── packages/
│   ├── charts/               # Shared React chart components
│   ├── config/               # Shared TypeScript configs
│   ├── duckdb/               # DuckDB WASM initialization and query wrapper
│   ├── font/                 # Spotify Mix font CSS export
│   ├── icons/                # HugeIcons-backed icon exports
│   ├── ui/                   # Shared UI primitives, CSS, hooks, utilities
│   └── upload/               # Upload client, SSE state, React hook
├── ARCHITECTURE.md           # System map and development environment
├── CONTEXT.md                # Product, schema, and feature context
├── DESIGN.md                 # Design system tokens and UI rules
├── pnpm-workspace.yaml       # Workspace packages and catalog versions
└── turbo.json                # Turborepo task graph
```

## Implementation Standards

- Write TypeScript for frontend/shared code. Do not use `any`, suppress type errors, or loosen types to make checks pass.
- Prefer existing package APIs and exports over cross-package relative imports. Import shared UI from `@harmony/ui`, icons from `@harmony/icons`, upload behavior from `@harmony/upload`, and DuckDB behavior from `@harmony/duckdb`.
- Keep state and orchestration close to the package that owns it. Move reusable logic into `packages/*` only when more than one app/package needs it.
- Avoid new boolean prop combinations when a composed component variant would be clearer.
- Use TanStack Query for async client data fetching and Zustand only for client-local app state that must be shared across component boundaries.
- Preserve the upload pipeline contract: progress states, SSE handling, session storage key `harmony:upload-session:v1`, and package public IDs are user-facing behavior.
- In Rust, keep validation at API boundaries, avoid panics in request paths, and preserve pipeline progress reporting when changing ingestion stages.

## Design System Rules

Always read `DESIGN.md` before generating or modifying UI.

- Use only documented colors, typography, spacing, radius, and component tokens from `DESIGN.md`. Do not invent Tailwind defaults or one-off hex values.
- Harmony is always dark: black canvas, charcoal surfaces, hairline borders, no decorative shadows for normal panels.
- Primary interactive emphasis uses Harmony green (`#57B660`) and its documented chart tiers. Do not introduce unrelated accent colors.
- Keep dashboard UI compact: 28px desktop controls, 32px thumbnails, small Spotify Mix typography, tabular numeric alignment, and dense table layouts.
- Match states to the documented patterns: muted hover fills, visible gray focus rings, active green toggles, lowered-opacity pending rows, and coral only for destructive or failed states.

## Testing And Validation

- After TypeScript or React implementation changes, run `pnpm check-types`.
- After Rust implementation changes, run `pnpm check:server`.
- Run `pnpm test:server` when changing ingestion, database, pipeline, or API
  behavior covered by Rust tests.
- Run `pnpm check` after substantial frontend/shared edits to catch linting and
  formatting issues.
- If a required command cannot run because of missing services or environment
  variables, report the blocker and what remains unverified.

## Git Workflow

- Never commit code.
- Do not run destructive git commands such as hard resets or checkout-based
  reverts unless the user explicitly approves them.
- Work with existing local changes instead of overwriting them. If unrelated
  files are dirty, leave them alone.
- Keep changes scoped to the user request. Avoid drive-by refactors.

## Boundaries

- Always protect secrets: never print, commit, or move `.env` values, API keys,
  tokens, `DATABASE_URL`, `DEEZER_PROXY_SECRET`, or telemetry credentials.
- Ask before adding dependencies, changing CI/CD, altering deployment behavior,
  or modifying database migrations/schema.
- Ask before changing public API routes, upload status shapes, DuckDB table/view
  schemas, or package file formats unless the user requested that change.
- Never edit generated/vendor directories such as `node_modules/`, build output,
  `.turbo/`, `target/`, or generated route artifacts unless the task is
  explicitly about generated output.
- Do not change `ARCHITECTURE.md`, `CONTEXT.md`, or `DESIGN.md` as a side effect
  of implementation work. Suggest updates when architecture, design tokens,
  commands, or workflows actually change.

## Maintenance

Update this guide when the tech stack, commands, project structure, validation
workflow, deployment model, or major architectural boundaries change. Keep
commands executable and examples concrete.
