"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";

export const getAllTracksAction = async () => {
  const session = await auth();

  if (!session || !session.user) return null;

  const res = await prisma.track.findMany({
    select: {
      spotify_id: true,
    },
  });

  return new Set(res.map((track) => track.spotify_id));
};
