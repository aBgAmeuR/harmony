import { MusicBrainzConfig } from './config.js'
import { HttpClient } from './http-client.js'
import { ReleaseGroupManager } from './managers/release-group-manager.js'

export class MusicBrainzApi {
  private readonly client: HttpClient
  readonly releaseGroups: ReleaseGroupManager
  readonly releases: ReleaseGroupManager

  constructor(config: MusicBrainzConfig) {
    this.client = new HttpClient(config)
    this.releaseGroups = new ReleaseGroupManager(this.client)
    this.releases = this.releaseGroups
  }

  async get<T>(path: string, query?: Record<string, string>): Promise<T> {
    return this.client.get<T>(path, query)
  }
}