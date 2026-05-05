import pLimit from 'p-limit'
import { mbApi } from './musicbrainz.js'
import { data } from './data.js'

const limit = pLimit(20)

const FILE_EXT_REGEX = /\.(mp3|flac|wav|m4a|ogg|opus)$/i

const TRACK_JUNK_PATTERNS = [
  /(?:[\(\[\{])\s*(?:feat\.?|ft\.?|featuring|with|prod\.?|starring)\s+[^)\]}]+(?:[\)\]\}])/gi,
  /(?:[\(\[\{])\s*(?:official\s+(?:music\s+)?video|video\s?clip|audio|lyrics|visualizer|hd|hq|4k|1080p|720p)\s*(?:[\)\]\}])/gi,
  /(?:[\(\[\{])\s*(?:remaster(?:ed)?|mix|remix|edit|radio\s?edit|original\s?mix|extended|instrumental|karaoke|live|session|version)\s*(?:[\)\]\}])/gi,
  /(?:[\(\[\{])\s*(?:spanish|french|english|german|japanese|mono|stereo)\s*(?:version)?\s*(?:[\)\]\}])/gi,
]


const artists = new Set()
const albums = new Set() // album:artist
const tracks = new Set() // track:album:artist

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
const timer = performance.now()

// const albumsTracks = new Map()
// for (const item of interactions) {
//   if (!albumsTracks.has(item.album)) {
//     albumsTracks.set(item.album, [])
//   }
//   albumsTracks.get(item.album).push({
//     id: item.id,
//     track: item.track,
//   })
// }

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

let results2 = 0
for (const [id, track] of tracksMap) {
  try {
    const resource = await fetch(`https://api.deezer.com/search?q=artist:"${track.artist}" track:"${normalizeTrackName(track.track)}"&strict=on`)
    await new Promise((resolve) => setTimeout(resolve, 50))

    if (resource.status !== 200) {
      throw new Error(`Failed to fetch resource: ${resource.status}`)
    }
    
    const data = await resource.json()

    if (data?.error?.message === 'Quota limit exceeded') {
      throw new Error(`Rate limit exceeded: ${resource.status}`)
    }

    if (data.data.length <= 0) {
      console.log(`No data found: ${track.track}, ${track.album}, ${track.artist}`)
      continue
    }

    results2++
  } catch (error) {
    console.log(`Error: ${error}`)
  }
}

console.log('Results found: ', results2)
console.log(`Percentage: ${((results2 / tracksMap.size) * 100).toFixed(2)}%`)

// const rg = await mbApi.releases.search({ artist: 'Playboi Carti', release: 'MUSIC - SORRY 4 DA WAIT' })
// console.log(JSON.stringify(rg['release-groups'], null, 2))

// const results = await Promise.all(
//   [...albums].map((value) =>
//     limit(async () => {
//       const [album, artist] = value.split(':')
//       const rg = await retryWithBackoff(() =>
//         mbApi.releaseGroups.search({ artist: artist, release: album })
//       )

//       if (rg['release-groups'].length <= 0) {
//         const rg2 = await retryWithBackoff(() =>
//           mbApi.releaseGroups.search({ artist: artist, release: album }, false)
//         )
//         if (rg2['release-groups'].length <= 0) {
//           console.log(`No release found for ${album} by ${artist}`)
//           return 'missing'
//         }
//         return 'found (without quotes)'
//       }

//       return 'found (with quotes)'
//     })
//   )
// )

// const foundWithQuotes = results.filter((r) => r === 'found (with quotes)').length
// const foundWithoutQuotes = results.filter((r) => r === 'found (without quotes)').length
// const found = foundWithQuotes + foundWithoutQuotes
// const missing = results.filter((r) => r === 'missing').length
// const duration = performance.now() - timer

// console.log(`Duration: ${duration}ms`)
// console.table([
//   { name: 'found with quotes', value: foundWithQuotes },
//   { name: 'found without quotes', value: foundWithoutQuotes },
//   { name: 'found', value: found },
//   { name: 'missing', value: missing },
//   { name: 'percentage', value: ((found / (found + missing)) * 100).toFixed(2) },
// ])
/**
 * Retry a handler function on error, up to maxRetries,
 * waiting for [1s, 2s, 5s] between retries.
 * @param {() => Promise<any>} handler
 * @param {number} maxRetries
 * @returns {Promise<any>}
 */
async function retryWithBackoff(handler, maxRetries = 3) {
  const delays = [1000, 2000, 5000]
  let attempt = 0
  while (true) {
    try {
      return await handler()
    } catch (err) {
      if (attempt >= maxRetries) throw err
      const delay = delays[attempt] || delays[delays.length - 1]
      console.log(`Retrying in ${delay}ms...`, err)
      await new Promise((res) => setTimeout(res, delay))
      attempt++
    }
  }
}



function normalizeTrackName(title) {
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
