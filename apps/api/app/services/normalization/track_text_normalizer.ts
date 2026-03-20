const FILE_EXT_REGEX = /\.(mp3|flac|wav|m4a|ogg|opus)$/i

const TRACK_JUNK_PATTERNS = [
  /(?:[\(\[\{])\s*(?:feat\.?|ft\.?|featuring|with|prod\.?|starring)\s+[^)\]}]+(?:[\)\]\}])/gi,
  /(?:[\(\[\{])\s*(?:official\s+(?:music\s+)?video|video\s?clip|audio|lyrics|visualizer|hd|hq|4k|1080p|720p)\s*(?:[\)\]\}])/gi,
  /(?:[\(\[\{])\s*(?:remaster(?:ed)?|mix|remix|edit|radio\s?edit|original\s?mix|extended|instrumental|karaoke|live|session|version)\s*(?:[\)\]\}])/gi,
  /(?:[\(\[\{])\s*(?:spanish|french|english|german|japanese|mono|stereo)\s*(?:version)?\s*(?:[\)\]\}])/gi,
]

const ALBUM_EDITION_PATTERNS = [
  /\b(deluxe|standard|expanded|collector'?s?|anniversary|special|limited|super|ultimate|definitive|complete|legacy|jubilee|essential|tour|bonus)\s*(?:edition|version|cut)?\b/gi,
  /\b(remaster(?:ed)?|re-?issue|re-?recording|re-?recorded|restored|mono|stereo|mix)\b/gi,
  /\b(version|edition|cut)\b/gi,
  /\b(explicit|clean|edited)\b/gi,
  /[\(\[]\s*\d{4}\s*[\)\]]/g,
]

export function normalizeTrackName(title: string | null): string {
  if (!title) return ''

  let cleaned = title.replace(FILE_EXT_REGEX, '')

  TRACK_JUNK_PATTERNS.forEach((regex) => {
    cleaned = cleaned.replace(regex, '')
  })

  cleaned = cleaned
    .replace(/\(\s*\)|\[\s*\]|\{\s*\}/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/^[-_]\s*|\s*[-_]$/g, '')

  return cleaned
}

export function normalizeAlbumName(title: string | null): string {
  if (!title) return ''

  let cleaned = title

  ALBUM_EDITION_PATTERNS.forEach((regex) => {
    cleaned = cleaned.replace(regex, '')
  })

  cleaned = cleaned
    .replace(/\s*[\(\[\{][\s\W]*[\)\]\}]/g, '')
    .replace(/\s+[-:]+\s*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  return cleaned
}

export function normalizeArtistName(artist: string | null): string {
  if (!artist) return ''
  return artist
    .replace(FILE_EXT_REGEX, '')
    .trim()
    .replace(/^[-_]\s*|\s*[-_]$/g, '')
}
