"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const getAllTracksAction = async () => {
  const session = await auth();

  if (!session || !session.user) return null;

  const res = await prisma.track.findMany({
    select: {
      id: true
    }
  });

  return new Set(res.map((track) => track.id));
};
