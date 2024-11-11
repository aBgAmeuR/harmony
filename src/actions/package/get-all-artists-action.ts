"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const getAllArtistsAction = async () => {
  const session = await auth();

  if (!session || !session.user) return null;

  const res = await prisma.artist.findMany({
    select: {
      id: true,
      name: true
    }
  });

  return new Map(res.map((artist) => [artist.name, artist.id]));
};
