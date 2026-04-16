/**
 * Subset of Cover Art Archive index.json (`/release/{mbid}/`, `/release-group/{mbid}/`).
 * @see https://musicbrainz.org/doc/Cover_Art_Archive/API
 */
export interface CaaThumbnails {
  '250'?: string
  '500'?: string
  '1200'?: string
  /** @deprecated Equivalent to `250` in CAA metadata */
  small?: string
  /** @deprecated Equivalent to `500` in CAA metadata */
  large?: string
}

export interface CaaImage {
  front?: boolean
  back?: boolean
  types?: string[]
  image?: string
  thumbnails?: CaaThumbnails
}

export interface CaaIndexJson {
  images?: CaaImage[]
  release?: string
}
