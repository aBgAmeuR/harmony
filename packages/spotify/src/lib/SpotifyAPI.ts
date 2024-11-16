import { SpotifyConfig } from 'src/types/SpotifyConfig';
import { HttpClient } from './http/HttpClient';
import { MeManager } from './me/MeManager';
export class SpotifyAPI {
  me: MeManager;

  constructor(private config: SpotifyConfig) {
    const client = new HttpClient(this.config);

    this.me = new MeManager(client);
  }
}