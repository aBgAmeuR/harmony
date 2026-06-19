import { HttpClient } from './http/http-client.js'
import { ApiConfig } from '../interfaces/config.js'
import { ReleaseGroupManager } from './release-group/release-group-manager.js'
import { ResourceManager } from './resource/resource-manager.js'

export class MusicBrainzApi {
  readonly releaseGroups: ReleaseGroupManager
  readonly resources: ResourceManager

  constructor(config: ApiConfig) {
    const client = new HttpClient(config)

    this.releaseGroups = new ReleaseGroupManager(client)
    this.resources = new ResourceManager(client)
  }
}
