import Dexie, { Table } from "dexie";
import relationships from "dexie-relationships";

interface User {
  id: number;
  username: string;
  conn_country: string;
  ip_addr_decrypted: string;
  user_agent_decrypted: string;
}

interface Track {
  id: number;
  name: string;
  artist_id: number;
  album_id: number;
  spotify_track_uri: string;
}

interface Artist {
  id: number;
  name: string;
}

interface Album {
  id: number;
  name: string;
  artist_id: number;
}

interface Playback {
  id: number;
  timestamp: Date;
  platform: string;
  ms_played: number;
  reason_start: string;
  reason_end: string;
  shuffle: boolean | null;
  skipped: boolean | null;
  offline: boolean | null;
  offline_timestamp: number;
  incognito_mode: boolean | null;
  track_id: number;
}

class MyAppDatabase extends Dexie {
  user!: Table<User, "id">;
  track!: Table<Track, "id">;
  artist!: Table<Artist, "id">;
  album!: Table<Album, "id">;
  playback!: Table<Playback, "id">;

  constructor() {
    super("MyAppDatabase", { addons: [relationships] });
    this.version(1).stores({
      user: "++id, username, conn_country, ip_addr_decrypted, user_agent_decrypted",
      track:
        "++id, [name+artist_id+album_id], artist_id -> artist.id, album_id -> album.id, spotify_track_uri",
      artist: "++id, name",
      album: "++id, [name+artist_id], artist_id -> artist.id",
      playback:
        "++id, timestamp, platform, ms_played, reason_start, reason_end, shuffle, skipped, offline, offline_timestamp, incognito_mode, track_id -> track.id"
    });
  }
}

export type { Album, Artist, Playback, Track, User };
export const db = new MyAppDatabase();
