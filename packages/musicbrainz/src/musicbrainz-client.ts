import { MusicBrainzHttpClient } from './http/musicbrainz-http-client.js'
import type { MusicBrainzClientOptions } from './options.js'
import { ArtistManager } from './managers/artist-manager.js'
import { CoverArtManager } from './managers/cover-art-manager.js'
import { RecordingManager } from './managers/recording-manager.js'
import { ReleaseManager } from './managers/release-manager.js'

/**
 * MusicBrainz Web Service (`ws/2`) and Cover Art Archive access.
 * All `ws/2` traffic uses configured proxies; Cover Art Archive uses direct HTTP.
 * @see https://musicbrainz.org/doc/MusicBrainz_API
 */
export class MusicBrainzClient {
  readonly recordings: RecordingManager
  readonly artists: ArtistManager
  readonly releases: ReleaseManager
  readonly coverArt: CoverArtManager

  private readonly http: MusicBrainzHttpClient

  constructor(options: MusicBrainzClientOptions) {
    const {
      appName,
      appVersion,
      appContactInfo,
      rateLimit = [1, 1],
      proxyUrls = [],
      proxyAuthSecret,
    } = options

    const userAgent = `${appName}/${appVersion} ( ${appContactInfo} )`

    this.http = new MusicBrainzHttpClient(userAgent, proxyAuthSecret, proxyUrls, rateLimit)

    this.recordings = new RecordingManager(this.http)
    this.artists = new ArtistManager(this.http)
    this.releases = new ReleaseManager(this.http)
    this.coverArt = new CoverArtManager(userAgent)
  }
}
