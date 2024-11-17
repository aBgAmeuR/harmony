import { SpotifyAPI } from './lib/SpotifyAPI'

export const spotify = new SpotifyAPI({
  clientId: process.env.AUTH_SPOTIFY_ID || 'missing',
  clientSecret: process.env.AUTH_SPOTIFY_SECRET || 'missing',
  debug: true,
})