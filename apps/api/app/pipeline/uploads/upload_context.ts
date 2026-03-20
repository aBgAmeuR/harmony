import type Package from '#models/package'
import { type ListeningInteraction } from '#validators/packages'
import { type MultipartFile } from '@adonisjs/core/bodyparser'

export type UploadContext = {
  upload: Package
  file: MultipartFile
  selectedJsonFiles: string[]
  filesInArchive: { filename: string; content: Uint8Array }[]
  rawInteractions: AsyncIterable<ListeningInteraction | undefined> | null
  normalizedInteractions: AsyncIterable<NormalizedListeningInteraction> | null
  trackCatalogue: Map<string, TrackKey>
  trackKeyToId: Map<string, number>
  stats: {
    totalInteractions: number
    skippedInteractions: { count: number; msPlayed: number }
    skippedTracks: TrackKey[]
  }
}

export type NormalizedListeningInteraction = {
  trackKey: string
  ts: string
  platform: string
  msPlayed: number
  reasonStart: string
  reasonEnd: string
  shuffle: boolean
  skipped: boolean
  offline: boolean
}

export interface TrackKey {
  artist: string
  track: string
  album: string
}
