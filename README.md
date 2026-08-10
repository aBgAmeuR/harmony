<p align="center">
  <picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/header/graph.svg?title=Harmony&amp;subtitle=Upload+your+history.+Explore+it+locally.&amp;logo=https%3A%2F%2Fharmony-staging.antoinejosset.fr%2Ffavicon.svg&amp;mode=dark&amp;font=geist" /><img alt="header" src="https://shieldcn.dev/header/graph.svg?title=Harmony&amp;subtitle=Upload+your+history.+Explore+it+locally.&amp;logo=https%3A%2F%2Fharmony-staging.antoinejosset.fr%2Ffavicon.svg&amp;mode=light&amp;font=geist" /></picture>
</p>

<p align="center">
  <a href="https://github.com/abgameur/harmony"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/abgameur/harmony/stars.svg?variant=secondary&amp;size=xs&amp;font=geist" /><img alt="badge" src="https://shieldcn.dev/github/abgameur/harmony/stars.svg?variant=secondary&amp;size=xs&amp;mode=light&amp;font=geist" /></picture></a>
  <a href="https://github.com/abgameur/harmony"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/abgameur/harmony/license.svg?variant=secondary&amp;size=xs&amp;font=geist" /><img alt="license" src="https://shieldcn.dev/github/abgameur/harmony/license.svg?variant=secondary&amp;size=xs&amp;mode=light&amp;font=geist" /></picture></a>
  <picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/flag/fr.svg?size=xs&amp;font=geist" /><img alt="built in" src="https://shieldcn.dev/flag/fr.svg?size=xs&amp;mode=light&amp;font=geist" /></picture>
</p>

## Overview

Personal Spotify analytics: upload your Extended Streaming History export, enrich
it server-side, then explore listening insights in the browser with DuckDB WASM.

No Spotify account login. Privacy-first - analytics run locally against a
DuckDB file you download for your package.

## Stack

| Layer    | Tech |
| -------- | ---- |
| Web      | <div><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/TanStack-ECE8D1.svg?size=xs&amp;font=geist&amp;logo=tanstack" /><img alt="TanStack" src="https://shieldcn.dev/badge/TanStack-ECE8D1.svg?size=xs&amp;mode=light&amp;font=geist&amp;logo=tanstack" /></picture> <picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Typescript-3178C6.svg?size=xs&amp;font=geist&amp;logo=typescript" /><img alt="TypeScript" src="https://shieldcn.dev/badge/Typescript-3178C6.svg?size=xs&amp;mode=light&amp;font=geist&amp;logo=typescript" /></picture> <picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Tailwind CSS-06B6D4.svg?size=xs&amp;logo=tailwindcss" /><img alt="Tailwind CSS" src="https://shieldcn.dev/badge/Tailwind CSS-06B6D4.svg?size=xs&amp;mode=light&amp;logo=tailwindcss" /></picture></div> |
| Backend  | <picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Rust-000000.svg?size=xs&amp;font=geist&amp;logo=rust" /><img alt="Rust" src="https://shieldcn.dev/badge/Rust-000000.svg?size=xs&amp;mode=light&amp;font=geist&amp;logo=rust" /></picture> <picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/DuckDB-FFF000.svg?size=xs&amp;font=geist&amp;logo=duckdb" /><img alt="DuckDB" src="https://shieldcn.dev/badge/DuckDB-FFF000.svg?size=xs&amp;mode=light&amp;font=geist&amp;logo=duckdb" /></picture> <picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Polar-0075FF.svg?size=xs&amp;logo=polars" /><img alt="Polars" src="https://shieldcn.dev/badge/Polar-0075FF.svg?size=xs&amp;mode=light&amp;logo=polars" /></picture> <picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/PostgresSQL-4169E1.svg?size=xs&amp;logo=postgresql" /><img alt="PostgreSQL" src="https://shieldcn.dev/badge/PostgresSQL-4169E1.svg?size=xs&amp;mode=light&amp;logo=postgresql" /></picture> <picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/OpenTelemetry-000000.svg?size=xs&amp;logo=opentelemetry" /><img alt="OpenTelemetry" src="https://shieldcn.dev/badge/OpenTelemetry-000000.svg?size=xs&amp;mode=light&amp;logo=opentelemetry" /></picture> |
| Monorepo | <picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/PNPM-F69220.svg?size=xs&amp;font=geist&amp;logo=pnpm" /><img alt="pnpm" src="https://shieldcn.dev/badge/PNPM-F69220.svg?size=xs&amp;mode=light&amp;font=geist&amp;logo=pnpm" /></picture> <picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Turborepo-FF1E56.svg?size=xs&amp;font=geist&amp;logo=turborepo" /><img alt="Turborepo" src="https://shieldcn.dev/badge/Turborepo-FF1E56.svg?size=xs&amp;mode=light&amp;font=geist&amp;logo=turborepo" /></picture> <picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/oxlint / oxfmt-00F7F1.svg?size=xs&amp;logo=oxc" /><img alt="oxlint / oxfmt" src="https://shieldcn.dev/badge/oxlint / oxfmt-00F7F1.svg?size=xs&amp;mode=light&amp;logo=oxc" /></picture> |

## Monorepo layout

```text
apps/web/          TanStack Start app (routes, features, upload UI)
apps/server/       Axum API, worker, ingestion pipeline
packages/          ui, charts, duckdb, upload, icons, font, config
docs/              Architecture, design system, deploy
```

## Requirements

- Node.js 24+ (see `.nvmrc`)
- pnpm 10+
- Rust toolchain (for `apps/server`)
- Postgres (for the API)

## Quick start

1. Install dependencies:

```bash
pnpm install
```

2. Configure env from the examples:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/server/.env.example apps/server/.env
```

Fill database url, S3/R2, and Deezer proxy values in `apps/server/.env`.
Set API url and bucket url in `apps/web/.env`.

3. Run the API and web app (two terminals):

```bash
pnpm dev:server
pnpm dev:web
```

## Useful commands

| Command            | Purpose                          |
| ------------------ | -------------------------------- |
| `pnpm check-types` | TypeScript across the workspace  |
| `pnpm check`       | oxlint + oxfmt check             |
| `pnpm verify`      | Frontend gates + Rust fmt/clippy |
| `pnpm test:server` | Rust unit tests                  |
| `pnpm build`       | Production web build             |

## Docs

- [Architecture](docs/ARCHITECTURE.md) - upload → pipeline → DuckDB → analytics
- [Design system](docs/DESIGN.md) - colors, typography, UI rules
- [Deploy](docs/DEPLOY.md) - GHCR + Portainer GitOps
- [AGENTS.md](AGENTS.md) - commands and convention

## License

Distributed under the GNU General Public License v3.0. See `LICENSE`.
