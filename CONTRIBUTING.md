# Contributing to Harmony

Thanks for helping. This page covers how to run the project, which checks to run
before a pull request, and how to write commits. By taking part you agree to the
[Code of Conduct](./CODE_OF_CONDUCT.md). Report security problems as described in
[SECURITY.md](./SECURITY.md), not in public issues.

## Prerequisites

- Node.js 24 or later (`.nvmrc`)
- pnpm 10 (`packageManager` in `package.json`; `corepack enable` installs it)
- Rust stable with `rustfmt` and `clippy`. CI uses 1.96.0.

## Setup

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts both apps:

- web app at `http://localhost:3001`
- Rust API at `http://127.0.0.1:3000`. Vite proxies `/api` and `/files` to it.

No `.env` file is needed. Without one, the API stores packages in `apps/server/data`
and calls Deezer directly. Copy [`apps/server/.env.example`](./apps/server/.env.example)
to `apps/server/.env` to change a setting, for example to use an S3 bucket or Deezer
proxies.

The first server build downloads the prebuilt DuckDB library, so it needs network
access and can take a few minutes.

## Commands

Run everything from the repository root. `lint`, `format` and `check` run through Turborepo,
so `pnpm exec turbo run check --filter=!server` runs the web side only (this is what the CI web job does).

| Command                    | What it does                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `pnpm dev`                 | Web app and API together                                                            |
| `pnpm --filter web dev`    | Web app only                                                                        |
| `pnpm --filter server dev` | API only                                                                            |
| `pnpm build`               | Production web build and debug server build                                         |
| `pnpm lint`                | oxlint and clippy on `server` with warnings as errors                               |
| `pnpm format`              | Write oxfmt and rustfmt fixes                                                       |
| `pnpm check`               | `oxfmt --check`, `tsc --noEmit` on each package, `cargo fmt --check`, `cargo check` |
| `pnpm test`                | Rust tests (`cargo test` on `server`)                                               |

Shared tool configuration lives in `tooling/`: `typescript` (tsconfig bases), `oxlint`,
`oxfmt` and `tailwind` (the theme imported by `@harmony/ui`). Edit it there, not in each package.

Dependency versions are declared once, in the named catalogs of `pnpm-workspace.yaml`
(`react`, `tanstack`, `tailwind`, `ui`, `icons`, `charts`, `duckdb`, `app`, `build`, `lint`,
`test`). Packages reference them as `catalog:<group>`, for example `"react": "catalog:react"`.

## Before you open a pull request

CI runs the same checks. Run the ones that match your change:

| You changed         | Run                                                                    |
| ------------------- | ---------------------------------------------------------------------- |
| TypeScript or React | `pnpm lint` and `pnpm check`                                           |
| Rust                | `pnpm --filter server lint`, `pnpm --filter server check`, `pnpm test` |
| Docs only           | `pnpm format` (oxfmt also formats Markdown)                            |

Also:

- Keep the pull request to one change. Avoid unrelated refactors.
- Read [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) before you touch the upload
  pipeline, the API, or the DuckDB schema. Those are user-facing contracts: the
  progress step IDs, the `harmony:upload-session:v1` storage key, public package
  IDs and the tables in each package file. Open an issue first if you want to change one.
- Read [`docs/DESIGN.md`](./docs/DESIGN.md) before you change UI, and use only its
  tokens.
- Update the docs that your change makes wrong.

## Code conventions

- TypeScript: no `any`, no type-error suppression. Import shared code through the
  package APIs (`@harmony/ui`, `@harmony/icons`, `@harmony/upload`,
  `@harmony/duckdb`), not through relative paths into another package.
- Use TanStack Query for async data on the client. Use Zustand only for client
  state shared across components.
- Rust: validate at the API boundary, avoid panics in request paths, and keep the
  pipeline progress reports when you change a stage.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/), for
example `fix: serve the demo package file`. Every push to `v3` runs
semantic-release, and every type except `deploy` publishes a new beta release,
`docs` and `chore` included. Details are in [`docs/DEPLOY.md`](./docs/DEPLOY.md#versioning).
Add `!` after the type or a `BREAKING CHANGE:` footer for breaking changes.

## Working with AI agents

[`AGENTS.md`](./AGENTS.md) holds the instructions for coding agents. It points back to
this page for commands and checks.
