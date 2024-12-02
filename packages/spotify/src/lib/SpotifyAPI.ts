'server-only';

import { SpotifyConfig } from '../types/SpotifyConfig';
import { AlbumManager } from './album/AlbumManager';
import { ArtistManager } from './artist/ArtistManager';
import { HttpClient } from './http/HttpClient';
import { MeManager } from './me/MeManager';
import { TrackManager } from './track/TrackManager';

export class SpotifyAPI {
  me: MeManager;
  tracks: TrackManager;
  artists: ArtistManager;
  albums: AlbumManager;
  private client: HttpClient;

  constructor(private config: SpotifyConfig) {
   this.client = new HttpClient(this.config);
    
    this.me = new MeManager(this.client);
    this.tracks = new TrackManager(this.client);
    this.artists = new ArtistManager(this.client);
    this.albums = new AlbumManager(this.client);
  }

  async refreshToken() {
    await this.client.refreshToken();
  }
}