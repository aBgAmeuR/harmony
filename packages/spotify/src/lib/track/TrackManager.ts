import { Manager } from "../Manager";
import { chunk } from "../../util/chunk";
import { Track } from "../../types";

export class TrackManager extends Manager {
  /**
   * @description Get multiple tracks by ID.
   * @param {string[]} ids Array of IDs.
   * @returns {Promise<Track[]>} Returns a promise with {@link Track}s.
   */
  async list(ids: string[]): Promise<Track[]> {
    const tracks = await Promise.all(
      chunk([...ids], 50).map(async (chunk) => {
        const res = await this.http.get<{
          tracks: Track[];
        }>("/v1/tracks", { ids: chunk.join(",") });

        return res.tracks;
      })
    );

    return tracks.flat();
  }
}
