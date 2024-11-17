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