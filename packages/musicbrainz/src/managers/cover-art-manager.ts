import type { CaaImage, CaaIndexJson } from '../types/caa.js'

const CAA_BASE = 'https://coverartarchive.org'

/**
 * Cover Art Archive — direct HTTP to coverartarchive.org (not via MusicBrainz proxy).
 * Uses index JSON (`/release/{mbid}/`) and a worst-to-best thumbnail ladder.
 * @see https://musicbrainz.org/doc/Cover_Art_Archive/API
 */
export class CoverArtManager {
  constructor(private readonly userAgent: string) {}

  /**
   * Resolves a final image URL (e.g. `*.ca.archive.org/.../....jpg`) after redirects.
   * Loads the release index (`GET /release/{mbid}/`), picks the front image, then tries
   * thumbnails 250 → 500 → 1200 → full `image`, validating each with fetch.
   */
  async resolveCoverArtUrl(releaseMbid: string | null | undefined): Promise<string | null> {
    const rel = releaseMbid?.trim()
    if (!rel) return null
    return this.tryIndex(`${CAA_BASE}/release/${encodeURIComponent(rel)}/`)
  }

  private async tryIndex(indexUrl: string): Promise<string | null> {
    const data = await this.fetchCaaIndexJson(indexUrl)
    if (!data) return null
    const image = pickFrontImage(data.images ?? [])
    if (!image) return null
    const candidates = orderedUrlCandidates(image)
    return this.resolveFirstWorkingUrl(candidates)
  }

  private async fetchCaaIndexJson(indexUrl: string): Promise<CaaIndexJson | null> {
    try {
      const res = await fetch(indexUrl, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'application/json',
        },
      })
      if (!res.ok) return null
      const text = await res.text()
      return JSON.parse(text) as CaaIndexJson
    } catch {
      return null
    }
  }

  private async resolveFirstWorkingUrl(urls: string[]): Promise<string | null> {
    for (const u of urls) {
      if (!u) continue
      try {
        const res = await fetch(u, {
          headers: {
            'User-Agent': this.userAgent,
            Accept: '*/*',
          },
        })
        if (res.ok) {
          return res.url
        }
      } catch {
        // try next candidate
      }
    }
    return null
  }
}

function pickFrontImage(images: CaaImage[]): CaaImage | null {
  if (images.length === 0) return null
  const byFlag = images.find((i) => i.front === true)
  if (byFlag) return byFlag
  const byType = images.find((i) => i.types?.includes('Front'))
  if (byType) return byType
  return images[0] ?? null
}

/**
 * Worst quality first: 250 (or small) → 500 (or large) → 1200 → full image.
 */
function orderedUrlCandidates(img: CaaImage): string[] {
  const t = img.thumbnails ?? {}
  const out: string[] = []
  const push = (u: string | undefined) => {
    const s = u?.trim()
    if (s && !out.includes(s)) out.push(s)
  }
  push(t['250'] ?? t.small)
  push(t['500'] ?? t.large)
  push(t['1200'])
  push(img.image)
  return out
}
