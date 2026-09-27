# Production deployment

Harmony is currently on a **v3 beta** line. Production images are built when a
new [SemVer](https://semver.org/) prerelease is created on the `v3` branch (via
[semantic-release](https://semantic-release.org/) from Conventional Commits).
Images are published to GHCR. Self-hosting uses
[`docker/docker-compose.yml`](../docker/docker-compose.yml), which selects the
tag with `HARMONY_VERSION` (default `latest`). Each GitHub Release also attaches
a copy of that compose file with the default set to the release tag.

```text
PR → CI (Web + Server + Image)
merge / push to v3
  -> semantic-release (GitHub Release + git tag v3.0.0-beta.N)
  -> if new version:
       build & push (GHA build cache)
         ghcr.io/abgameur/harmony:latest
         ghcr.io/abgameur/harmony:v3
         ghcr.io/abgameur/harmony:v3.0.0-beta.N
       attach docker-compose.yml + example.env to the GitHub Release
```

The image build context stays the repository root. The Dockerfile lives at
`docker/Dockerfile`. `.dockerignore` stays at the root of that context.

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

## GitHub prerequisites

Packages: ensure `ghcr.io/abgameur/harmony` is pullable by the host (a public
package, or a registry credential with `read:packages`).

Branch protection: allow the default `GITHUB_TOKEN` to create tags and GitHub
Releases on `v3`.

## Run a release

From the directory that contains the compose file and `.env`:

```text
curl -fsSLO https://github.com/abgameur/harmony/releases/download/<tag>/docker-compose.yml
curl -fsSL -o .env https://github.com/abgameur/harmony/releases/download/<tag>/example.env
docker compose up -d
```

Beta releases are prereleases, so `releases/latest/download/` does not point at
them. Use `releases/download/<tag>/`.

To track a moving tag instead of the file attached to one release, use the
compose file in this repo and set `HARMONY_VERSION` (`latest`, `v3`, or an exact
tag). Optional settings are listed in
[`docker/.env.example`](../docker/.env.example).

## Manual checks

- Actions → **Release** workflow: semantic release, then **Build & push image**
  and **Attach self-hosting files**.
- GitHub → **Releases**: a new `v3.0.0-beta.N` prerelease with notes from
  commits, plus `docker-compose.yml` and `example.env`.
- GHCR: `ghcr.io/abgameur/harmony` has that tag, the major tag, and `latest`.
