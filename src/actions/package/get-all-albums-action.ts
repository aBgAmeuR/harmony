"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const getAllAlbumsAction = async () => {
  const session = await auth();

  if (!session || !session.user) return null;

  const res = await prisma.album.findMany({
    select: {
      id: true,
      title: true,
      artist: {
        select: {
          name: true
        }
      }
    }
  });

  return new Map(
    res.map((album) => [`${album.artist.name}::${album.title}`, album.id])
  );
};
