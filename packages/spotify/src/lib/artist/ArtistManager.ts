import { chunk } from '../../util/chunk';
import {
  AlbumSimplified,
  Artist,
  Markets,
  PagingObject,
  PagingOptions,
  Track
} from '../../types';
import { Manager } from '../Manager';

export class ArtistManager extends Manager {

  /**
   * @description Get a artist by ID.
   * @param {string} id
   * @returns {Promise<Artist[]>} Returns a promise with a single {@link Artist}.
   */
  async get(id: string): Promise<Artist> {
    return await this.http.get<Artist>(`/v1/artists/${id}`);
  }

  /**
   * @description Get multiple artists by ID.
   * @param {string[]} ids Array of IDs.
   * @returns {Promise<Artist[]>} Returns a promise with an array of {@link Artist}s.
   */
  async list(ids: string[]): Promise<Artist[]> {
    const artists = await Promise.all(
      chunk([...ids], 50).map(async (chunk) => {
        const res = await this.http.get<{
          artists: Artist[];
        }>('/v1/artists', { ids: chunk.join(',') });
        return  res.artists;
      })
    );

    return artists.flat();
  }
}