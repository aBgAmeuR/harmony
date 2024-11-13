import {
  getSpotifyAccessToken,
  getSpotifyArtistsInfo,
  getSpotifyTracksInfo
} from "./spotify";
import { chunkSet } from "./utils";

export class Spotify {
  constructor() {}

  private async delay(s: number) {
    return new Promise((resolve) => setTimeout(resolve, s * 1000));
  }

  private async refreshSpotifyAccessToken() {
    await getSpotifyAccessToken();
  }

  public async getSpotifyTracksInfo(tracks: Set<string>) {
    await this.refreshSpotifyAccessToken();

    const tracksChunks = chunkSet(tracks, 50);
    const tracksData = [];
    console.log(tracksChunks.length + " chunks");

    for (const chunk of tracksChunks) {
      const data = await getSpotifyTracksInfo(Array.from(chunk.values()));
      tracksData.push(...data.tracks);
      console.log("Retrying after delay...", data.retryAfterDelay);
      await this.delay(data.retryAfterDelay);
    }
    console.log("Tracks data:", tracksData.length);

    return tracksData;
  }

  public async getSpotifyArtistsInfo(artists: Set<string>) {
    await this.refreshSpotifyAccessToken();

    const artistsChunks = chunkSet(artists, 50);
    const artistsData = [];

    for (const chunk of artistsChunks) {
      const data = await getSpotifyArtistsInfo(Array.from(chunk.values()));
      artistsData.push(...data.artists);
      console.log("Retrying after delay...", data.retryAfterDelay);
      await this.delay(data.retryAfterDelay);
    }
    console.log("Artists data:", artistsData.length);

    return artistsData;
  }
}
