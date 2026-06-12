import pLimit from 'p-limit'
import { data } from './data.js'

const DEEZER_SEARCH = 'https://api.deezer.com/search'
const REQUEST_GAP_MS = 50
const PROXY_SECRET = '07b473f1af3f4a86dd76542e18dc40639e6fe7acba7894475e6dd644112419bf'

const PROXY_URLS = [
  'https://harmony-proxy-15.a-josset.workers.dev',
  'https://harmony-proxy-16.a-josset.workers.dev',
  'https://harmony-proxy-17.a-josset.workers.dev',
  'https://harmony-proxy-18.a-josset.workers.dev',
  'https://harmony-proxy-19.a-josset.workers.dev',
  'https://harmony-proxy-20.a-josset.workers.dev',
  'https://harmony-proxy-21.a-josset.workers.dev',
  'https://harmony-proxy-22.a-josset.workers.dev',
  'https://harmony-proxy-23.a-josset.workers.dev',
  'https://harmony-proxy-24.a-josset.workers.dev',
  'https://harmony-proxy-25.a-josset.workers.dev',
]

const CONCURRENCY = PROXY_URLS.length
const limit = pLimit(CONCURRENCY)
let proxyRound = 0

const FILE_EXT_REGEX = /\.(mp3|flac|wav|m4a|ogg|opus)$/i

const TRACK_JUNK_PATTERNS = [
  /(?:[\(\[\{])\s*(?:feat\.?|ft\.?|featuring|with|prod\.?|starring)\s+[^)\]}]+(?:[\)\]\}])/gi,
  /(?:[\(\[\{])\s*(?:official\s+(?:music\s+)?video|video\s?clip|audio|lyrics|visualizer|hd|hq|4k|1080p|720p)\s*(?:[\)\]\}])/gi,
  /(?:[\(\[\{])\s*(?:remaster(?:ed)?|mix|remix|edit|radio\s?edit|original\s?mix|extended|instrumental|karaoke|live|session|version)\s*(?:[\)\]\}])/gi,
  /(?:[\(\[\{])\s*(?:spanish|french|english|german|japanese|mono|stereo)\s*(?:version)?\s*(?:[\)\]\}])/gi,
]

const artists = new Set()
const albums = new Set()
const tracks = new Set()

const interactions = data
  .filter((item) => item.ms_played > 30000)
  .map((item) => ({
    artist: item.master_metadata_album_artist_name,
    album: item.master_metadata_album_album_name,
    track: item.master_metadata_track_name,
    id: item.spotify_track_uri?.split(':').pop() ?? null,
  }))
  .filter((item) => item.artist && item.album && item.track)

for (const item of interactions) {
  artists.add(item.artist)
  albums.add(`${item.album}:${item.artist}`)
  tracks.add(`${item.track}:${item.album}:${item.artist}`)
}

console.table([
  { name: 'interactions', value: interactions.length },
  { name: 'artists', value: artists.size },
  { name: 'albums', value: albums.size },
  { name: 'tracks', value: tracks.size },
])

const tracksMap = new Map()
for (const item of interactions) {
  if (!tracksMap.has(item.id)) {
    tracksMap.set(item.id, {
      track: item.track,
      album: item.album,
      artist: item.artist,
    })
  }
}

const searchStarted = performance.now()
const outcomes = await Promise.all(
  [...tracksMap].map(([, meta]) =>
    limit(async () => {
      try {
        const hit = await searchDeezerTrack(meta)
        if (!hit) {
          console.log(`Not found: ${meta.track}, ${meta.album}, ${meta.artist}`)
          return false
        }
        console.log(`Found: ${meta.track}, ${meta.album}, ${meta.artist}`)
        return true
      } catch (err) {
        console.log(`Error: ${err}`)
        return false
      }
    })
  )
)
const searchMs = performance.now() - searchStarted
const foundCount = outcomes.filter(Boolean).length

const uniqueTracks = tracksMap.size
const seconds = searchMs / 1000
const tracksPerSec = seconds > 0 ? uniqueTracks / seconds : 0
console.table([
  { metric: 'wall time (ms)', value: Math.round(searchMs) },
  { metric: 'wall time (s)', value: Number(seconds.toFixed(2)) },
  { metric: 'unique tracks', value: uniqueTracks },
  { metric: 'tracks / s', value: Number(tracksPerSec.toFixed(1)) },
])

console.log('Results found: ', foundCount)
console.log(`Percentage: ${((foundCount / tracksMap.size) * 100).toFixed(2)}%`)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * @param {string} url
 */
function nextProxyUrl(targetUrl) {
  const base = PROXY_URLS[proxyRound % PROXY_URLS.length]
  proxyRound += 1
  const u = new URL(base)
  u.searchParams.set('target', targetUrl)
  return u.toString()
}

async function fetchDeezerSearch(url) {
  const proxyUrl = nextProxyUrl(url)
  const res = await fetch(proxyUrl, {
    headers: {
      'X-Harmony-Secret': PROXY_SECRET,
    },
  })
  await sleep(REQUEST_GAP_MS)
  if (res.status !== 200) {
    const text = `(${proxyUrl})`
    throw new Error(`Deezer HTTP ${res.status}: ${text}`)
  }
  /** @type {{ data?: unknown[]; error?: { message?: string } }} */
  const payload = await res.json()
  if (payload?.error?.message === 'Quota limit exceeded') {
    throw new Error('Deezer rate limit exceeded')
  }
  return payload
}

/**
 * @param {{ artist: string; track: string }} meta
 */
async function searchDeezerTrack(meta) {
  const trackName = normalizeTrackName(meta.track)

  const strict = new URLSearchParams({
    q: `artist:"${meta.artist}" track:"${trackName}"`,
    strict: 'on',
  })
  let payload = await fetchDeezerSearch(`${DEEZER_SEARCH}?${strict}`)

  // if (!deezerHasResults(payload)) {
  //   const loose = new URLSearchParams({
  //     q: `"${meta.artist}" "${trackName}"`,
  //   })
  //   payload = await fetchDeezerSearch(`${DEEZER_SEARCH}?${loose}`)
  // }

  return deezerHasResults(payload) ? payload : null
}

/**
 * @param {{ data?: unknown[] }} payload
 */
function deezerHasResults(payload) {
  return Array.isArray(payload?.data) && payload.data.length > 0
}

function normalizeTrackName(title) {
  if (!title) return ''

  let cleaned = title.replace(FILE_EXT_REGEX, '')

  for (const regex of TRACK_JUNK_PATTERNS) {
    regex.lastIndex = 0
    cleaned = cleaned.replace(regex, '')
  }

  return cleaned
    .replace(/\(\s*\)|\[\s*\]|\{\s*\}/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/^[-_]\s*|\s*[-_]$/g, '')
}
