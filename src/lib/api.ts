import { Artist, Track, UserPublic } from "@/types/spotify";

import { fetchData } from "./utils";

export const getSpotifyTracks = (uris: string[]) => fetchData<Track[]>("/api/spotify/tracks", { uris });
export const getSpotifyArtists = (uris: string[]) => fetchData<Artist[]>("/api/spotify/artists", { uris });
export const getSpotifyAlbums = (uris: string[]) => fetchData<Track[]>("/api/spotify/albums", { uris });
export const getSpotifyUser = (id: string) => fetchData<UserPublic>("/api/spotify/user", { id });