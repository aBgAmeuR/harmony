import type { IRecording, IRelease, IMedium } from '@harmony/musicbrainz'

export type ParsedRecording = {
  artistMbids: string[]
  artistNames: string[]
  albumType: 'album' | 'single'
  albumName: string
  albumExternalId: string
  albumTotalTracks: number
  albumReleaseDate: string
  trackName: string
  trackMsDuration: number | null
  trackNumber: null
  trackExternalId: string
}

export function pickBestRelease(releases: IRelease[] = []): IRelease | null {
  const official = releases.filter((r) => r.status === 'Official')
  if (official.length === 0) return null
  const noSecondary = official.filter((r) => {
    const secondary = r['release-group']?.['secondary-types']
    return !secondary || secondary.length === 0
  })
  const candidates = noSecondary.length > 0 ? noSecondary : official
  const withDigital = candidates.find((r) =>
    r.media?.some((m: IMedium) => m.format === 'Digital Media')
  )
  return withDigital ?? candidates[0] ?? null
}

export function parseMbRecording(
  recording: IRecording,
  release: IRelease | null
): ParsedRecording | null {
  if (!release) return null

  const artistCredit = recording['artist-credit'] ?? []
  const artistMbids = artistCredit.map((ac) => ac.artist.id)
  const artistNames = artistCredit.map((ac) => ac.artist.name)

  const releaseGroup = release['release-group']
  const primaryType = releaseGroup?.['primary-type']?.toLowerCase()
  const albumType: 'album' | 'single' = primaryType === 'single' ? 'single' : 'album'

  const albumReleaseDate = release.date ?? releaseGroup?.['first-release-date'] ?? ''
  const albumTotalTracks = release['track-count'] ?? release.count ?? 0

  return {
    artistMbids,
    artistNames,
    albumType,
    albumName: release.title,
    albumExternalId: release.id,
    albumTotalTracks,
    albumReleaseDate,
    trackName: recording.title,
    trackMsDuration: recording.length ?? null,
    trackNumber: null,
    trackExternalId: recording.id,
  }
}
