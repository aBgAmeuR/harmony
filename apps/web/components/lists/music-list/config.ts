import { MusicItemCardProps } from "~/components/cards/music-item-card/type";
import {
  getRankingAlbums,
  getRankingArtists,
  getRankingTracks,
  getRecentlyPlayedTracks,
  getTopArtists,
  getTopTracks,
} from "~/services/music-lists";

type Config = {
  [key: string]: {
    action: (
      // eslint-disable-next-line no-unused-vars
      userId: string | undefined,
    ) => Promise<MusicItemCardProps["item"][] | null>;
    label: string;
    showAction?: boolean;
    showRank?: boolean;
  };
};

export const musicListConfig = {
  rankingTracks: {
    action: getRankingTracks,
    label: "tracks",
    showAction: true,
    showRank: true,
  },
  rankingArtists: {
    action: getRankingArtists,
    label: "artists",
    showAction: true,
    showRank: true,
  },
  rankingAlbums: {
    action: getRankingAlbums,
    label: "albums",
    showAction: true,
    showRank: true,
  },
  topTracks: {
    action: getTopTracks,
    label: "tracks",
    showAction: false,
    showRank: true,
  },
  topArtists: {
    action: getTopArtists,
    label: "artists",
    showAction: false,
    showRank: true,
  },
  recentlyPlayed: {
    action: getRecentlyPlayedTracks,
    label: "tracks",
    showAction: false,
    showRank: false,
  },
  dashboardTracks: {
    action: getRankingTracks,
    label: "tracks",
    showAction: false,
    showRank: true,
  },
  dashboardArtists: {
    action: getRankingArtists,
    label: "artists",
    showAction: false,
    showRank: true,
  },
} satisfies Config;
