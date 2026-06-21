[harmony.webm](https://github.com/user-attachments/assets/93851771-a205-47fe-9e49-82a92d8bb246)

## Harmony

Personal Spotify analytics, rebuilt with a modern stack and a focus on speed, privacy, and great UX. Connect your Spotify account and upload your Spotify data export, then explore rich insights about your listening.

### Highlights

- **Authentication**: Spotify OAuth via NextAuth, plus a safe demo mode
- **Data import**: Upload Spotify Takeout ZIP
- **Dashboards**:
  - Overview, Recently Played, Top Tracks/Artists/Albums
  - Rankings with historical trends and snapshots
  - Detailed artist/album/track pages with charts
  - Listening Habits, Milestones, Forgotten Gems, Comparisons (artists and years)
  - Shareable profile links with usage limits and expiry
- **Performance-first**: Next.js 15 App Router, React 19, React Query, Turbopack
- **UI/UX**: Tailwind CSS v4, Shadcn/ui
- **Database**: Postgres + Drizzle ORM with fully typed schema
- **Monorepo**: TurboRepo with shared packages (auth, database, spotify, ui, tests)

### Tech

[![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000?style=for-the-badge&logo=shadcnui&logoColor=fff)](https://ui.shadcn.com/)
[![Drizzle](https://img.shields.io/badge/Drizzle-2A2A2A?style=for-the-badge&logo=drizzle&logoColor=white)](https://orm.drizzle.team/)
[![Postgres](https://img.shields.io/badge/Postgres-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Hono](https://img.shields.io/badge/Hono-e36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/)
[![Turborepo](https://img.shields.io/badge/Turborepo-000?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build/)
[![Spotify API](https://img.shields.io/badge/Spotify-1ED760?style=for-the-badge&logo=spotify&logoColor=white)](https://developer.spotify.com/documentation/web-api/)
[![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

## Monorepo layout

- `apps/web`: Next.js 15 (App Router) web app
- `apps/docs`: Fumadocs-powered documentation site
- `apps/studio`: Drizzle Studio for database browsing
- `apps/api`: Ancillary API utilities
- `packages/auth`: NextAuth setup with Drizzle adapter and middleware
- `packages/database`: Drizzle schema and client (Postgres)
- `packages/spotify`: Minimal Spotify API client utilities
- `packages/ui`: Shared UI components (shadcn/ui + Tailwind v4)
- `packages/web-tests`: Playwright E2E tests
- `packages/zustand-cookie-storage`: Cookie storage adapter for Zustand

## Requirements

- Node.js 20+
- pnpm 10+
- Postgres 14+ (local or managed)

## Quick start

1. Install dependencies

```bash
pnpm install
```

2. Create `.env` at repo root

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/harmony"
AUTH_SECRET="$(openssl rand -hex 32)"
AUTH_SPOTIFY_ID="your-spotify-client-id"
AUTH_SPOTIFY_SECRET="your-spotify-client-secret"

# Optional
APP_MAINTENANCE=false
DEMO_ID="your-demo-user-id"            # enable demo sign-in
UPLOADTHING_TOKEN="your-uploadthing-token"
DOCS_URL="http://localhost:3001"       # if running docs locally
CRON_SECRET="choose-a-strong-secret"   # for scheduled ranking updates
NEXTAUTH_URL="http://localhost:3000"   # set in production
```

3. Initialize the database

```bash
pnpm db:push
```

4. Start development (Web on `http://localhost:3000`)

```bash
pnpm dev
```

5. Optional tools

```bash
pnpm studio                 # Drizzle Studio
pnpm typecheck              # TypeScript
pnpm format-and-lint        # Biome check
pnpm e2e:test               # Playwright E2E
```

## Cron and background tasks

- Exposes `POST /api/cron/update-rankings` secured with header `Authorization: Bearer <CRON_SECRET>`.
- Configure a platform cron (e.g., Vercel Cron) to hit this route on your desired cadence to refresh historical rankings.

## Features

- **Top Tracks**: Get a list of your top tracks.
- **Top Artists**: Get a list of your top artists.
- **Recently Played**: Get a list of your recently played tracks.
- **Overview**: Get an overview of your account.
- **Rankings**: Get rankings of your tracks, albums, and artists.
- **Stats**: Get advanced statistics about your account.
- **Milestones**: Get milestones of your account.
- **Comparisons**: Compare artists and years.
- **Settings**: Change settings and get information about the app.
- **Profile Sharing**: Share your profile with a link.

## Deployment

- Recommended: Vercel
  - Set all env vars above in the Project Settings
  - Build command: `pnpm build`
  - Optionally configure Vercel Cron to call `/api/cron/update-rankings` with your `CRON_SECRET`

## License

Distributed under the GNU General Public License v3.0. See `LICENSE` for more information.
