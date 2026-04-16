import type { MusicBrainzHttpClient } from '../http/musicbrainz-http-client.js'

export abstract class Manager {
  constructor(protected readonly http: MusicBrainzHttpClient) {}
}
