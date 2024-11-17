import { SpotifyConfig } from '../types/SpotifyConfig';
import { ArtistManager } from './artist/ArtistManager';
import { HttpClient } from './http/HttpClient';
import { MeManager } from './me/MeManager';
import { TrackManager } from './track/TrackManager';

export class SpotifyAPI {
  me: MeManager;
  tracks: TrackManager;
  artists: ArtistManager;

  constructor(private config: SpotifyConfig) {
    const client = new HttpClient(this.config);

    this.me = new MeManager(client);
    this.tracks = new TrackManager(client);
    this.artists = new ArtistManager(client);
  }
}