# Deployment

Harmony ships as one multi-arch Docker image, `ghcr.io/abgameur/harmony`, built for
`linux/amd64` and `linux/arm64`. The image contains the API and the built web
app, and it serves both on port 3000. The project is on a v3 beta line, so tags
look like `v3.0.0-beta.N`.

This page has two parts: [self-hosting](#self-hosting) for people who run the image,
and [releases](#releases) for maintainers.

## Self-hosting

No setting is required. By default the server writes package files to a local
volume and calls Deezer directly.

### Docker

```bash
docker run -d --name harmony -p 3000:3000 -v harmony-data:/data --restart unless-stopped ghcr.io/abgameur/harmony:latest
```

Open `http://localhost:3000`.

### Docker Compose

[`docker/docker-compose.yml`](../docker/docker-compose.yml) runs the same image with a
read-only root filesystem and a named `harmony-data` volume. From a directory that
contains that file:

```bash
docker compose up -d
```

To change settings, copy [`docker/.env.example`](../docker/.env.example) to `.env`
next to the compose file and uncomment what you need. Compose reads these variables:

| Variable          | Default  | Purpose                                                         |
| ----------------- | -------- | --------------------------------------------------------------- |
| `HARMONY_VERSION` | `latest` | Image tag: `latest`, `v3`, or an exact tag like `v3.0.0-beta.1` |
| `HARMONY_PORT`    | `3000`   | Port published on the host                                      |

Every other variable in that file is passed to the container. The full list of
server settings, with defaults, is in
[`apps/server/.env.example`](../apps/server/.env.example).

### Storage

- **Local volume (default).** Package files are written to `/data/harmony/{id}.duckdb`
  and served by the API on `/files/{id}.duckdb`. `/data` is the only path the server
  writes to.
- **S3-compatible bucket.** Set `S3_ENDPOINT`, `S3_BUCKET`, `AWS_ACCESS_KEY_ID` and
  `AWS_SECRET_ACCESS_KEY`. Set `S3_PUBLIC_URL` to the public address of the bucket
  and `/files/*` redirects there, so the browser downloads from the bucket.

The container runs as uid and gid `1001`. A named volume gets the right owner
automatically. A bind mount needs it set on the host first:

```bash
sudo chown -R 1001:1001 /path/to/harmony-data
```

### Deezer

Tracks and albums are enriched through Deezer. The server calls Deezer directly,
limited to `DEEZER_RATE_LIMIT` requests per second (default 8). To spread requests
across your own proxies, set `DEEZER_PROXY_URLS` (comma separated) and
`DEEZER_PROXY_SECRET`. The secret is sent in the `X-Harmony-Secret` header.

### What to know

- Queued and running imports live in memory. If the container restarts, upload the
  ZIP again. Finished packages are files, so they survive restarts.
- There is no authentication. Anyone who knows a package ID can open it.
- The image has no shell and no package manager (`gcr.io/distroless/cc-debian12`).
  `/app/server healthcheck` backs the image `HEALTHCHECK`.

### Build the image yourself

```bash
docker build -f docker/Dockerfile -t harmony:local .
docker run --rm -p 3000:3000 -v harmony-data:/data harmony:local
```

The build context is the repository root. Base images are pinned by digest in
`docker/Dockerfile`, and `libduckdb` is downloaded at the version that
`libduckdb-sys` in `apps/server/Cargo.lock` expects.

For local development, use `pnpm dev` and not the image. See
[`CONTRIBUTING.md`](../CONTRIBUTING.md).

## Releases

```text
pull request -> CI (Web and Server jobs, no image build)
push to v3   -> semantic-release: GitHub Release and git tag v3.0.0-beta.N
             -> if a version was published:
                  build linux/amd64 on ubuntu-24.04 and linux/arm64 on ubuntu-24.04-arm
                  push each by digest, then one multi-arch manifest tagged
                  ghcr.io/abgameur/harmony:latest, :v3 and :v3.0.0-beta.N
```

[`.github/workflows/release.yml`](../.github/workflows/release.yml) runs three jobs:
`version`, `image` and `manifest`. Each architecture builds natively on its own
runner with its own GitHub Actions cache scope, and the image carries an SBOM and a
provenance attestation. Dependabot opens a weekly pull request to bump the base image
digests ([`.github/dependabot.yml`](../.github/dependabot.yml)).

### Versioning

[`.releaserc.json`](../.releaserc.json) configures semantic-release with Conventional
Commits. On `v3` it publishes prereleases on the `beta` channel, so versions stay on
the `3.0.0` line and only the `beta.N` counter moves:

| Commit                                                                                                   | Effect               |
| -------------------------------------------------------------------------------------------------------- | -------------------- |
| `feat`, `fix`, `perf`, `refactor`, `style`, `docs`, `chore`, `build`, `ci`, `test`, or any other message | patch: next `beta.N` |
| `BREAKING CHANGE` footer or `!` after the type                                                           | major                |
| `deploy:`                                                                                                | no release           |

To leave beta, remove the `prerelease` and `channel` settings on the `v3` branch in
`.releaserc.json`.

### Repository prerequisites

- The default `GITHUB_TOKEN` must be allowed to create tags and GitHub Releases on `v3`.
- `ghcr.io/abgameur/harmony` must be pullable by the hosts that run it: either make
  the package public, or give them a registry credential with `read:packages`.

### Checks after a release

- Actions: the **Release** workflow finished all three jobs.
- GitHub Releases: a new `v3.0.0-beta.N` prerelease with notes generated from the commits.
- GHCR: `ghcr.io/abgameur/harmony` has that tag, `v3` and `latest`.
