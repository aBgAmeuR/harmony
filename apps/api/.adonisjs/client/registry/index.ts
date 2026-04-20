/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'event_stream': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/__transmit/events',
    tokens: [{"old":"/api/v1/__transmit/events","type":0,"val":"api","end":""},{"old":"/api/v1/__transmit/events","type":0,"val":"v1","end":""},{"old":"/api/v1/__transmit/events","type":0,"val":"__transmit","end":""},{"old":"/api/v1/__transmit/events","type":0,"val":"events","end":""}],
    types: placeholder as Registry['event_stream']['types'],
  },
  'subscribe': {
    methods: ["POST"],
    pattern: '/api/v1/__transmit/subscribe',
    tokens: [{"old":"/api/v1/__transmit/subscribe","type":0,"val":"api","end":""},{"old":"/api/v1/__transmit/subscribe","type":0,"val":"v1","end":""},{"old":"/api/v1/__transmit/subscribe","type":0,"val":"__transmit","end":""},{"old":"/api/v1/__transmit/subscribe","type":0,"val":"subscribe","end":""}],
    types: placeholder as Registry['subscribe']['types'],
  },
  'unsubscribe': {
    methods: ["POST"],
    pattern: '/api/v1/__transmit/unsubscribe',
    tokens: [{"old":"/api/v1/__transmit/unsubscribe","type":0,"val":"api","end":""},{"old":"/api/v1/__transmit/unsubscribe","type":0,"val":"v1","end":""},{"old":"/api/v1/__transmit/unsubscribe","type":0,"val":"__transmit","end":""},{"old":"/api/v1/__transmit/unsubscribe","type":0,"val":"unsubscribe","end":""}],
    types: placeholder as Registry['unsubscribe']['types'],
  },
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_token.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_token.store']['types'],
  },
  'auth.access_token.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/auth/logout',
    tokens: [{"old":"/api/v1/auth/logout","type":0,"val":"api","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.access_token.destroy']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'uploads.uploads.upload': {
    methods: ["POST"],
    pattern: '/api/v1/uploads/package',
    tokens: [{"old":"/api/v1/uploads/package","type":0,"val":"api","end":""},{"old":"/api/v1/uploads/package","type":0,"val":"v1","end":""},{"old":"/api/v1/uploads/package","type":0,"val":"uploads","end":""},{"old":"/api/v1/uploads/package","type":0,"val":"package","end":""}],
    types: placeholder as Registry['uploads.uploads.upload']['types'],
  },
  'uploads.uploads.stats': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/uploads/:uploadId/stats',
    tokens: [{"old":"/api/v1/uploads/:uploadId/stats","type":0,"val":"api","end":""},{"old":"/api/v1/uploads/:uploadId/stats","type":0,"val":"v1","end":""},{"old":"/api/v1/uploads/:uploadId/stats","type":0,"val":"uploads","end":""},{"old":"/api/v1/uploads/:uploadId/stats","type":1,"val":"uploadId","end":""},{"old":"/api/v1/uploads/:uploadId/stats","type":0,"val":"stats","end":""}],
    types: placeholder as Registry['uploads.uploads.stats']['types'],
  },
  'package.package.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/package/:id',
    tokens: [{"old":"/api/v1/package/:id","type":0,"val":"api","end":""},{"old":"/api/v1/package/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/package/:id","type":0,"val":"package","end":""},{"old":"/api/v1/package/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['package.package.show']['types'],
  },
  'package.package.stats': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/package/:id/stats',
    tokens: [{"old":"/api/v1/package/:id/stats","type":0,"val":"api","end":""},{"old":"/api/v1/package/:id/stats","type":0,"val":"v1","end":""},{"old":"/api/v1/package/:id/stats","type":0,"val":"package","end":""},{"old":"/api/v1/package/:id/stats","type":1,"val":"id","end":""},{"old":"/api/v1/package/:id/stats","type":0,"val":"stats","end":""}],
    types: placeholder as Registry['package.package.stats']['types'],
  },
  'package.tracks.top': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/package/:id/tracks',
    tokens: [{"old":"/api/v1/package/:id/tracks","type":0,"val":"api","end":""},{"old":"/api/v1/package/:id/tracks","type":0,"val":"v1","end":""},{"old":"/api/v1/package/:id/tracks","type":0,"val":"package","end":""},{"old":"/api/v1/package/:id/tracks","type":1,"val":"id","end":""},{"old":"/api/v1/package/:id/tracks","type":0,"val":"tracks","end":""}],
    types: placeholder as Registry['package.tracks.top']['types'],
  },
  'package.tracks.get': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/package/:id/tracks/:trackId',
    tokens: [{"old":"/api/v1/package/:id/tracks/:trackId","type":0,"val":"api","end":""},{"old":"/api/v1/package/:id/tracks/:trackId","type":0,"val":"v1","end":""},{"old":"/api/v1/package/:id/tracks/:trackId","type":0,"val":"package","end":""},{"old":"/api/v1/package/:id/tracks/:trackId","type":1,"val":"id","end":""},{"old":"/api/v1/package/:id/tracks/:trackId","type":0,"val":"tracks","end":""},{"old":"/api/v1/package/:id/tracks/:trackId","type":1,"val":"trackId","end":""}],
    types: placeholder as Registry['package.tracks.get']['types'],
  },
  'package.albums.top': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/package/:id/albums',
    tokens: [{"old":"/api/v1/package/:id/albums","type":0,"val":"api","end":""},{"old":"/api/v1/package/:id/albums","type":0,"val":"v1","end":""},{"old":"/api/v1/package/:id/albums","type":0,"val":"package","end":""},{"old":"/api/v1/package/:id/albums","type":1,"val":"id","end":""},{"old":"/api/v1/package/:id/albums","type":0,"val":"albums","end":""}],
    types: placeholder as Registry['package.albums.top']['types'],
  },
  'package.package.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/package/:id',
    tokens: [{"old":"/api/v1/package/:id","type":0,"val":"api","end":""},{"old":"/api/v1/package/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/package/:id","type":0,"val":"package","end":""},{"old":"/api/v1/package/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['package.package.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
