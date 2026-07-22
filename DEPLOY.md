# Production deployment (Portainer GitOps)

Harmony production images are built on pushes to the `v3` branch, published to
GHCR, then pinned by commit SHA in [`docker-compose.yml`](docker-compose.yml).
Portainer CE polls that file from Git and redeploys when the SHA changes.

```text
push to v3
  -> GitHub Actions builds & pushes
       ghcr.io/abgameur/harmony/{web,api}:latest
       ghcr.io/abgameur/harmony/{web,api}:<sha>
  -> CI commits pinned tags in docker-compose.yml [skip ci]
  -> Portainer GitOps poll sees new git ref
  -> pull images & recreate stack
```

The NAS must never rebuild from source; it only pulls pre-built images. Local app
development uses `pnpm dev` / `pnpm dev:server`, not this compose file.

## GitHub prerequisites

Packages: ensure `ghcr.io/abgameur/harmony/web` and `…/api` are pullable by the
NAS (public packages, or a Portainer registry credential with `read:packages`).

Branch protection: allow `github-actions[bot]` (or the default `GITHUB_TOKEN`) to
push to `v3` so the pin-compose job can commit `docker-compose.yml`.

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

| Variable | Required | Notes |
| --- | --- | --- |
| `API_URL` | yes | Public API base URL for the web service |
| `BUCKET_URL` | yes | Public DuckDB / CDN base URL for the web service |
| `DATABASE_URL` | yes | Postgres connection string |
| `S3_ENDPOINT` | yes | R2 / S3-compatible endpoint |
| `S3_BUCKET` | yes | Bucket name |
| `AWS_ACCESS_KEY_ID` | yes | Object storage access key |
| `AWS_SECRET_ACCESS_KEY` | yes | Object storage secret |
| `DEEZER_PROXY_URLS` | yes | Comma-separated proxy URLs |
| `DEEZER_PROXY_SECRET` | yes | Proxy shared secret |

6. Deploy the stack. After the next successful release, wait one poll interval and
   confirm both services show image tags equal to the latest `v3` commit SHA.

## Manual checks

- Actions → **Release** workflow: lint, build matrix, then **Pin compose image tags**.
- Repo: `docker-compose.yml` image lines updated with that SHA and a
  `deploy: pin images to … [skip ci]` commit.
- Portainer: stack git hash advanced; containers recreated with the new tags.
