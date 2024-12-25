"server-only";

import { spotify } from "@repo/spotify";
import { formatDistanceToNowStrict } from "date-fns";

import { getMsPlayedInMinutes } from "~/lib/utils";

export const getRecentlyPlayedTracks = async (userId: string | undefined) => {
  if (!userId) return null;

  const tracks = await spotify.me.recentlyPlayed();

  return tracks?.map((track) => ({
    id: track.track.id,
    image: track.track.album.images[0].url,
    name: track.track.name,
    href: track.track.external_urls.spotify,
    artists: track.track.artists.map((artist) => artist.name).join(", "),
    stat1: `${getMsPlayedInMinutes(track.track.duration_ms)} minutes`,
    stat2: `${formatDistanceToNowStrict(new Date(track.played_at))} ago`,
  }));
};
