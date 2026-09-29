# Production deployment

Harmony is currently on a **v3 beta** line. Production images are built when a
new [SemVer](https://semver.org/) prerelease is created on the `v3` branch (via
[semantic-release](https://semantic-release.org/) from Conventional Commits).
Images are published to GHCR. Self-hosting uses
[`docker/docker-compose.yml`](../docker/docker-compose.yml), which selects the
tag with `HARMONY_VERSION` (default `latest`).

```text
PR → CI (Web + Server)
merge / push to v3
  -> semantic-release (GitHub Release + git tag v3.0.0-beta.N)
  -> if new version:
       build linux/amd64 on ubuntu-24.04, linux/arm64 on ubuntu-24.04-arm
       push each by digest, then one multi-arch manifest:
         ghcr.io/abgameur/harmony:latest
         ghcr.io/abgameur/harmony:v3
         ghcr.io/abgameur/harmony:v3.0.0-beta.N
```

[`.github/workflows/release.yml`](../.github/workflows/release.yml) publishes the
version, then builds and pushes the image. Each architecture builds natively on
its own runner (no QEMU) with its own GitHub Actions cache scope, and attaches
an SBOM and a provenance attestation. The image build context stays the
repository root. The Dockerfile lives at
`docker/Dockerfile`. `.dockerignore`
stays at the root of that context.

Base images are pinned by digest in `docker/Dockerfile`. Dependabot opens a
weekly pull request to bump them ([`.github/dependabot.yml`](../.github/dependabot.yml)).

To build and run the image locally:

```text
docker build -f docker/Dockerfile -t harmony:local .
docker run --rm -p 3000:3000 -v harmony-data:/data harmony:local
```

## Version format (beta)

Tags look like `v3.0.0-beta.1`, `v3.0.0-beta.2`, … (SemVer 2.0 prerelease).

That is the valid form of “v3.0 beta 01”: SemVer requires the patch segment
(`3.0.0`) and forbids leading zeros on numeric prerelease ids (`beta.1`, not
`beta.01`).

While `v3` is configured as a beta channel:

| Commit type                  | Effect                                                                |
| ---------------------------- | --------------------------------------------------------------------- |
| `BREAKING CHANGE` / `!`      | major → starts next line (use once to leave `2.x` for `3.0.0-beta.1`) |
| `feat:`, `fix:`, `chore:`, … | patch → increments `beta.N` on the current `3.0.0` line               |
| `deploy:`                    | no release                                                            |

After the first `3.0.0-beta.1`, everyday merges only bump `beta.N` (features do
not become `3.1.0-beta.1` during this phase).

### First beta from `v2.5.0`

The merge that enables this pipeline should include a breaking marker so the
first tag is `v3.0.0-beta.1`, for example:

```text
feat!: enable semantic-release beta for v3

BREAKING CHANGE: start of the Harmony v3 beta line.
```

When you leave beta for stable `v3.0.0`, remove the `prerelease`/`channel`
settings on the `v3` branch in [`.releaserc.json`](../.releaserc.json).

The host must never rebuild from source; it only pulls pre-built images. Local
app development uses `pnpm dev` / `pnpm dev:server`, not the compose file.

## Image

One image, no required environment variables. `docker pull` selects `linux/amd64`
or `linux/arm64`. Pull requests do not build it.

```text
docker run -d --name harmony -p 3000:3000 -v harmony-data:/data --restart unless-stopped ghcr.io/abgameur/harmony:latest
```

What the image contains:

- `gcr.io/distroless/cc-debian12`: no shell and no package manager. It runs as
  uid/gid `1001`.
- `/app/server` serves the API and the SPA from `/app/public` on port 3000.
  `/app/server healthcheck` backs the image `HEALTHCHECK`.
- `/usr/lib/libduckdb.so` is the official prebuilt DuckDB library, at the
  version that `libduckdb-sys` in `apps/server/Cargo.lock` expects.
- `/data` is the only path the server writes to: `harmony/` for package
  files, and `.staging/` and `.tmp/` for work in progress. `.tmp/` is emptied
  at startup.

The compose file runs the container with a read-only root filesystem, no Linux
capabilities and `no-new-privileges`. A named volume gets the right owner
automatically. A bind mount needs it set on the host first:

```text
sudo chown -R 1001:1001 /path/to/harmony-data
```

On `SIGTERM` the server stops accepting connections, closes progress streams
and exits within 5 seconds. Imports still running are lost and must be
uploaded again.

## GitHub prerequisites

Packages: ensure `ghcr.io/abgameur/harmony` is pullable by the host (a public
package, or a registry credential with `read:packages`).

Branch protection: allow the default `GITHUB_TOKEN` to create tags and GitHub
Releases on `v3`.

## Run a release

From a directory that contains [`docker/docker-compose.yml`](../docker/docker-compose.yml):

```text
docker compose up -d
```

Set `HARMONY_VERSION` to `latest`, `v3`, or an exact tag such as
`v3.0.0-beta.1`. Optional settings are listed in
[`docker/.env.example`](../docker/.env.example).

## Manual checks

- Actions → **Release** workflow: publish the version, then build and push the image.
- GitHub → **Releases**: a new `v3.0.0-beta.N` prerelease with notes from
  commits.
- GHCR: `ghcr.io/abgameur/harmony` has that tag, the major tag, and `latest`.
