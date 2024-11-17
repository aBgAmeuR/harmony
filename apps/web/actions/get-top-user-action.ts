"use server";

import { spotify } from "@repo/spotify";

export const getTopArtistsAction = async (
  time_range: "long_term" | "medium_term" | "short_term",
) => {
  return await spotify.me.top("artists", time_range);
};

export const getTopTracksAction = async (
  time_range: "long_term" | "medium_term" | "short_term",
) => {
  return await spotify.me.top("tracks", time_range);
};
