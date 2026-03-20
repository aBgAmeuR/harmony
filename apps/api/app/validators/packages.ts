import vine from '@vinejs/vine'
import { type Infer } from '@vinejs/vine/types'

export const uploadPackageValidator = vine.create({
  file: vine.file({
    size: '20mb',
    extnames: ['zip'],
  }),
  json_files: vine.array(vine.string()),
})

export const listeningInteractionValidator = vine.create({
  ts: vine.string(),
  platform: vine.string(),
  ms_played: vine.number(),
  master_metadata_track_name: vine.string().nullable(),
  master_metadata_album_artist_name: vine.string().nullable(),
  master_metadata_album_album_name: vine.string().nullable(),
  spotify_track_uri: vine.string().nullable(),
  reason_start: vine.string(),
  reason_end: vine.string(),
  shuffle: vine.boolean(),
  skipped: vine.boolean(),
  offline: vine.boolean(),
})

export type ListeningInteraction = Infer<typeof listeningInteractionValidator>
