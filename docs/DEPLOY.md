# Production deployment (Portainer GitOps)

Harmony is currently on a **v3 beta** line. Production images are built when a
new [SemVer](https://semver.org/) prerelease is created on the `v3` branch (via
[semantic-release](https://semantic-release.org/) from Conventional Commits).
Images are published to GHCR with the release tag, then that tag is pinned in
[`docker-compose.yml`](../docker-compose.yml). Portainer CE polls that file from
Git and redeploys when the pin changes.

```text
merge / push to v3
  -> lint
  -> semantic-release (GitHub Release + git tag v3.0.0-beta.N)
  -> if new version:
       build & push
         ghcr.io/abgameur/harmony/{web,api}:latest
         ghcr.io/abgameur/harmony/{web,api}:v3.0.0-beta.N
       CI commits pinned tags in docker-compose.yml [skip ci]
  -> Portainer GitOps poll sees new git ref
  -> pull images & recreate stack
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
| `deploy:` (compose pin)      | no release                                                            |

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

The NAS must never rebuild from source; it only pulls pre-built images. Local app
development uses `pnpm dev` / `pnpm dev:server`, not this compose file.

## GitHub prerequisites

Packages: ensure `ghcr.io/abgameur/harmony/web` and `…/api` are pullable by the
NAS (public packages, or a Portainer registry credential with `read:packages`).

Branch protection: allow `github-actions[bot]` (or the default `GITHUB_TOKEN`) to
push to `v3` so the pin-compose job can commit `docker-compose.yml`, and to
create tags / GitHub Releases.

Web `API_URL` and `BUCKET_URL` are runtime-only (Portainer stack env). They are
not required as GitHub Actions variables.

## Portainer stack setup

1. **Stacks → Add stack → Repository**
2. Repository URL: this GitHub repo  
   Branch: `v3`  
   Compose path: `docker-compose.yml`
3. Enable **GitOps updates** / automatic updates with polling (for example every
   5 minutes). Enable **pull image** on update/redeploy.
4. **Registries**: if GHCR packages are private, add `ghcr.io` with a GitHub PAT
   that has `read:packages`.
5. **Environment variables** for the stack (required unless noted):

| Variable                | Required | Notes                                            |
| ----------------------- | -------- | ------------------------------------------------ |
| `API_URL`               | yes      | Public API base URL for the web service          |
| `BUCKET_URL`            | yes      | Public DuckDB / CDN base URL for the web service |
| `DATABASE_URL`          | yes      | Postgres connection string                       |
| `S3_ENDPOINT`           | yes      | R2 / S3-compatible endpoint                      |
| `S3_BUCKET`             | yes      | Bucket name                                      |
| `AWS_ACCESS_KEY_ID`     | yes      | Object storage access key                        |
| `AWS_SECRET_ACCESS_KEY` | yes      | Object storage secret                            |
| `DEEZER_PROXY_URLS`     | yes      | Comma-separated proxy URLs                       |
| `DEEZER_PROXY_SECRET`   | yes      | Proxy shared secret                              |

6. Deploy the stack. After the next successful release, wait one poll interval and
   confirm both services show image tags equal to the latest beta tag (for
   example `v3.0.0-beta.1`).

## Manual checks

- Actions → **Release** workflow: lint, semantic release, build matrix, then
  **Pin compose image tags**.
- GitHub → **Releases**: a new `v3.0.0-beta.N` prerelease with notes from commits.
- Repo: `docker-compose.yml` image lines updated to that tag and a
  `deploy: pin images to v3.0.0-beta.N [skip ci]` commit.
- Portainer: stack git hash advanced; containers recreated with the new tags.
