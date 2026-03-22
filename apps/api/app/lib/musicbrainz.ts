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
    'https://harmony-proxy-06.a-josset.workers.dev/',
    'https://harmony-proxy-07.a-josset.workers.dev/',
    'https://harmony-proxy-08.a-josset.workers.dev/',
    'https://harmony-proxy-09.a-josset.workers.dev/',
    'https://harmony-proxy-10.a-josset.workers.dev/',
    'https://harmony-proxy-11.a-josset.workers.dev/',
    'https://harmony-proxy-12.a-josset.workers.dev/',
    'https://harmony-proxy-13.a-josset.workers.dev/',
    'https://harmony-proxy-14.a-josset.workers.dev/',
    'https://harmony-proxy-15.a-josset.workers.dev/',
    'https://harmony-proxy-16.a-josset.workers.dev/',
    'https://harmony-proxy-17.a-josset.workers.dev/',
    'https://harmony-proxy-18.a-josset.workers.dev/',
    'https://harmony-proxy-19.a-josset.workers.dev/',
    'https://harmony-proxy-20.a-josset.workers.dev/',
  ],
  proxyAuthSecret: env.get('MB_PROXY_SECRET'),
})
