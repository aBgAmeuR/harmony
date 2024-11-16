import {
  Artist,
  CursorPagingObject,
  PagingObject,
  RecentlyPlayed,
  Track,
  UserPrivate
} from "../../types";

import { Manager } from "../Manager";

export class MeManager extends Manager {
  /**
   * @description Get current user's top artists.
   * @param {string} type
   * @param {"long_term" | "medium_term" | "short_term"} time_range
   * @returns {Promise<Artist[]>} Returns a promise with the paginated {@link Artist}.
   */
  // eslint-disable-next-line no-unused-vars
  async top(
    type: "artists",
    time_range: "long_term" | "medium_term" | "short_term"
  ): Promise<Artist[]>;

  /**
   * @description Get current user's top tracks.
   * @param {string} type
   * @param {"long_term" | "medium_term" | "short_term"} time_range
   * @returns {Promise<Track[]>} Returns a promise with the paginated {@link Track}.
   */
  // eslint-disable-next-line no-unused-vars
  async top(
    type: "tracks",
    time_range: "long_term" | "medium_term" | "short_term"
  ): Promise<Track[]>;

  /**
   * @description Get the current user's top tracks or artists.
   * @param  {string} type
   * @param {"long_term" | "medium_term" | "short_term"} time_range
   */
  async top(
    type: "artists" | "tracks",
    time_range: "long_term" | "medium_term" | "short_term"
  ): Promise<unknown> {
    const res = await this.http.get<PagingObject<unknown>>(`/v1/me/top/${type}`, {
      time_range,
      limit: "50",
      offset: "0",
    })

    return res.items;
  }

  /**
   * @description Get current user's (private) data. (required scropes: user-read-private, user-read-email).
   * @returns {Promise<UserPrivate>}
   */
  async get(): Promise<UserPrivate> {
    return await this.http.get<UserPrivate>("/v1/me");
  }

  /**
   * @description Get current user's recently played tracks. (required scoped: user-read-recently-played).
   * @param {limit?:number after?:number;before?:number} options?
   * @returns {Promise<RecentlyPlayed[]>} Returns a promise with the {@link RecentlyPlayed} items.
   */
  async recentlyPlayed(): Promise<RecentlyPlayed[]> {
    const query: Record<string, string> = {
      limit: "50",
    };

    const res = await this.http.get<CursorPagingObject<RecentlyPlayed>>(`/v1/me/player/recently-played`, query);

    res.items.map((item: { played_at: string | number | Date; }) => ({
      ...item,
      played_at: new Date(item.played_at),
    }));

    return res.items;
  }
}
