import { albumsQueries } from "@/features/albums/queries";
import { artistsQueries } from "@/features/artists/queries";
import { tracksQueries } from "@/features/tracks/queries";

export const query = {
  albums: albumsQueries,
  artists: artistsQueries,
  tracks: tracksQueries,
};
