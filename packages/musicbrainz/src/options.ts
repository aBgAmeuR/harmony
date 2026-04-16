export interface MusicBrainzClientOptions {
  /** Application name (required for User-Agent). */
  appName: string
  /** Application version. */
  appVersion: string
  /** Contact (email or URL) for the application. */
  appContactInfo: string
  /**
   * [maxRequests, windowSeconds] per proxy URL. Default: [1, 1].
   * @see https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting
   */
  rateLimit?: [number, number]
  /**
   * Proxy URLs (e.g. Cloudflare Workers). Required for MusicBrainz API calls.
   * Proxy is called with query params: target=<encoded-url>, user_agent=<identity> and optional header X-Harmony-Secret.
   */
  proxyUrls?: string[]
  /**
   * Secret sent as X-Harmony-Secret when calling proxy URLs.
   */
  proxyAuthSecret?: string
}

export interface SearchRecordingParams {
  artist: string
  recording: string
  release?: string
}

export interface SearchRecordingOptions {
  limit?: number
  offset?: number
}

export interface SearchReleaseParams {
  artist: string
  release: string
}

export interface SearchReleaseOptions {
  limit?: number
  offset?: number
}

/** Include parameters for artist lookup (e.g. "url-rels", "releases"). */
export type ArtistInclude =
  | 'url-rels'
  | 'releases'
  | 'release-groups'
  | 'recordings'
  | 'works'
  | string

/**
 * Include parameters for release lookup (`/ws/2/release/{mbid}?inc=`).
 * @see https://musicbrainz.org/doc/MusicBrainz_API#Subqueries
 */
export type ReleaseInclude =
  | 'recordings'
  | 'media'
  | 'artist-credits'
  | 'labels'
  | 'release-groups'
  | 'collections'
  | 'discids'
  | 'isrcs'
  | string

/** Default `inc` for tracklists with per-track / recording credits (matches typical enrichment needs). */
export const RELEASE_LOOKUP_DEFAULT_INC: readonly ReleaseInclude[] = [
  'recordings',
  'media',
  'artist-credits',
] as const
