# Security policy

## Supported versions

Harmony is in beta. Only the latest `v3.0.0-beta.N` release and the `v3` branch
receive security fixes.

## Report a vulnerability

Please do not open a public issue for a security problem.

Use GitHub's private reporting instead: open the repository's **Security** tab and
choose **Report a vulnerability**. Include what you found, how to reproduce it, and the
version or commit you tested.

The maintainer will acknowledge the report and keep you informed while a fix is prepared.

## Scope

In scope: the Rust API (`apps/server`), the web app (`apps/web`), the upload pipeline
and the published Docker image.

Known limits that are not vulnerabilities on their own, because they are documented
design choices (see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md#known-limits)):

- The API has no authentication. Anyone who knows a package's six character ID can
  open it.
- Queued and running imports live in memory and are lost on restart.

If you self-host Harmony on a public address, put it behind your own access control.

## Data handling

Harmony processes Spotify listening history, which is personal data. Uploaded ZIPs are
held in memory while they are processed. The result is stored as a DuckDB file on the
configured volume or bucket. Do not post an export or a package file in a public issue.
Secrets such as `DEEZER_PROXY_SECRET` and S3 credentials belong in environment variables
and must never be committed.
