import env from '#start/env'
import { MusicBrainzApi } from '@harmony/musicbrainz'

export const mbApi = new MusicBrainzApi({
  appName: 'Harmony',
  appVersion: '2.6',
  appContactInfo: 'https://antoinejosset.fr',
  rateLimit: [1, 1],
  proxyUrls: [
    'https://harmony-proxy-01.a-josset.workers.dev/',
    'https://harmony-proxy-02.a-josset.workers.dev/',
    'https://harmony-proxy-03.a-josset.workers.dev/',
    'https://harmony-proxy-04.a-josset.workers.dev/',
    'https://harmony-proxy-05.a-josset.workers.dev/',
  ],
  proxyAuthSecret: env.get('MB_PROXY_SECRET'),
})
