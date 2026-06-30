import { albumsQueries } from "@/features/albums/queries";
import { artistsQueries } from "@/features/artists/queries";
import { interactionsQueries } from "@/features/interactions/queries";
import { listeningQueries } from "@/features/listening/queries";
import { packagesQueries } from "@/features/packages/queries";
import { tracksQueries } from "@/features/tracks/queries";

export const query = {
  albums: albumsQueries,
  artists: artistsQueries,
  interactions: interactionsQueries,
  listeningHabits: listeningQueries,
  packages: packagesQueries,
  tracks: tracksQueries,
};
