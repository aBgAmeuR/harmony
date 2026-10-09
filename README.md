# Harmony

<p>
  <a href="https://github.com/abgameur/harmony"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/abgameur/harmony/stars.svg?variant=secondary&amp;size=xs&amp;font=geist" /><img alt="badge" src="https://shieldcn.dev/github/abgameur/harmony/stars.svg?variant=secondary&amp;size=xs&amp;mode=light&amp;font=geist" /></picture></a>
  <a href="https://github.com/abgameur/harmony"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/abgameur/harmony/license.svg?variant=secondary&amp;size=xs&amp;font=geist" /><img alt="license" src="https://shieldcn.dev/github/abgameur/harmony/license.svg?variant=secondary&amp;size=xs&amp;mode=light&amp;font=geist" /></picture></a>
  <picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/flag/fr.svg?size=xs&amp;font=geist" /><img alt="built in" src="https://shieldcn.dev/flag/fr.svg?size=xs&amp;mode=light&amp;font=geist" /></picture>
</p>

Harmony turns your Spotify Extended Streaming History into listening analytics.
You upload the export ZIP, the server enriches it with Deezer metadata, and you
explore the result in your browser. Queries run locally with DuckDB WASM against
a single DuckDB file built for your upload.

There is no Spotify login. Harmony only reads the export you give it.

> Harmony v3 is in beta. Releases are tagged `v3.0.0-beta.N`.

## Get your data

Request your **Extended streaming history** from the
[Spotify privacy page](https://www.spotify.com/account/privacy/). Spotify emails a
download link once the export is ready. Upload the ZIP as it is.

## Self-hosting

Run the published image. It serves the API and the web app on port 3000, and it
needs no configuration:

```bash
docker run -d -p 3000:3000 -v harmony-data:/data ghcr.io/abgameur/harmony
```

Then open `http://localhost:3000`. Package files are kept in the `harmony-data`
volume. See [`docs/DEPLOY.md`](docs/DEPLOY.md) for Docker Compose, S3-compatible
storage, Deezer proxies and image tags.

## Development

You need Node.js 24+, pnpm 10 and a Rust toolchain.

```bash
pnpm install
pnpm dev
```

The web app runs on `http://localhost:3001` and the API on `http://127.0.0.1:3000`.
[`CONTRIBUTING.md`](CONTRIBUTING.md) lists every command and the checks to run before a
pull request.

## Built with

React 19, TanStack Start, Tailwind CSS v4 and DuckDB WASM on the web side. An Axum
API written in Rust, with DuckDB and OpenTelemetry, on the server side. pnpm
workspaces, Turborepo, oxlint and oxfmt for the monorepo.

## Documentation

- [Architecture](docs/ARCHITECTURE.md): data flow, API, pipeline and storage
- [Deployment](docs/DEPLOY.md): self-hosting and releases
- [Design system](docs/DESIGN.md): colors, typography and UI rules
- [Contributing](CONTRIBUTING.md), [Security](SECURITY.md) and
  [Code of Conduct](CODE_OF_CONDUCT.md)
- [`AGENTS.md`](AGENTS.md): instructions for coding agents

## License

Harmony is distributed under the GNU General Public License v3.0. See [`LICENSE`](LICENSE).
