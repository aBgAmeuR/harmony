import { Manager } from '../manager.js'

export class ResourceManager extends Manager {
  async get(url: string) {
    return this.http.get<any>('/url', {
      fmt: 'json',
      resource: url,
    })
  }
}
