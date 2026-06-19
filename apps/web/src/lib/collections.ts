import { createCollection } from '@tanstack/react-db'
import { rxdbCollectionOptions } from '@tanstack/rxdb-db-collection'
import { createRxDatabase } from 'rxdb'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'
import { z } from 'zod'

const albumSchema = z.object({
  id: z.string(),
  cover: z.string(),
  title: z.string(),
  genres: z.array(z.string()),
  artists: z.array(z.string()),
  duration: z.number(),
  nb_tracks: z.number(),
  album_type: z.enum(['Album', 'Single']),
  release_date: z.string(),
})

const artistSchema = z.object({
  id: z.string(),
  name: z.string(),
  picture: z.string(),
})

const interactionSchema = z.object({
  ts: z.string(),
  offline: z.boolean(),
  shuffle: z.boolean(),
  skipped: z.boolean(),
  platform: z.string(),
  track_id: z.string(),
  ms_played: z.number(),
})

const trackSchema = z.object({
  id: z.string(),
  album: z.string(),
  title: z.string(),
  artists: z.array(z.string()),
  duration: z.number(),
  disk_number: z.number(),
  release_date: z.string(),
  track_position: z.number(),
})

export type Album = z.infer<typeof albumSchema>
export type Artist = z.infer<typeof artistSchema>
export type Interaction = z.infer<typeof interactionSchema>
export type Track = z.infer<typeof trackSchema>

export const db = await createRxDatabase({
  name: 'harmony',
  storage: wrappedValidateAjvStorage({
    storage: getRxStorageDexie({}),
  }),
})

await db.addCollections({
  albums: {
    schema: {
      title: 'albums',
      version: 0,
      type: 'object',
      primaryKey: 'id',
      properties: {
        id: { type: 'string', maxLength: 10 },
        cover: { type: 'string' },
        title: { type: 'string' },
        genres: { type: 'array', items: { type: 'string' } },
        artists: { type: 'array', items: { type: 'string' } },
        duration: { type: 'number' },
        nb_tracks: { type: 'number' },
        album_type: { type: 'string', enum: ['Album', 'Single'] },
        release_date: { type: 'string' },
      },
      required: [
        'id',
        'cover',
        'title',
        'genres',
        'artists',
        'duration',
        'nb_tracks',
        'album_type',
        'release_date',
      ],
    },
  },
  artists: {
    schema: {
      title: 'artists',
      version: 0,
      type: 'object',
      primaryKey: 'id',
      properties: {
        id: { type: 'string', maxLength: 10 },
        name: { type: 'string' },
        picture: { type: 'string' },
      },
      required: ['id', 'name', 'picture'],
    },
  },
  interactions: {
    schema: {
      title: 'interactions',
      version: 0,
      type: 'object',
      primaryKey: 'ts',
      properties: {
        ts: { type: 'string', format: 'date-time', maxLength: 29 },
        offline: { type: 'boolean' },
        shuffle: { type: 'boolean' },
        skipped: { type: 'boolean' },
        platform: { type: 'string' },
        track_id: { type: 'string', maxLength: 10 },
        ms_played: { type: 'number' },
      },
      required: ['ts', 'offline', 'shuffle', 'skipped', 'platform', 'track_id', 'ms_played'],
    },
  },
  tracks: {
    schema: {
      title: 'tracks',
      version: 0,
      type: 'object',
      primaryKey: 'id',
      properties: {
        id: { type: 'string', maxLength: 10 },
        album: { type: 'string', maxLength: 10 },
        title: { type: 'string' },
        artists: { type: 'array', items: { type: 'string' } },
        duration: { type: 'number' },
        disk_number: { type: 'number' },
        release_date: { type: 'string' },
        track_position: { type: 'number' },
      },
      required: [
        'id',
        'album',
        'title',
        'artists',
        'duration',
        'disk_number',
        'release_date',
        'track_position',
      ],
    },
  },
})

const albumsCollection = createCollection(
  rxdbCollectionOptions({
    rxCollection: db.albums,
    schema: albumSchema,
    startSync: true,
  })
)

const artistsCollection = createCollection(
  rxdbCollectionOptions({
    rxCollection: db.artists,
    schema: artistSchema,
    startSync: true,
  })
)

const interactionsCollection = createCollection(
  rxdbCollectionOptions({
    rxCollection: db.interactions,
    schema: interactionSchema,
    startSync: false,
  })
)

const tracksCollection = createCollection(
  rxdbCollectionOptions({
    rxCollection: db.tracks,
    schema: trackSchema,
    startSync: true,
  })
)

export { albumsCollection, artistsCollection, interactionsCollection, tracksCollection }
