"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const deleteUserAction = async () => {
  const session = await auth();

  if (!session || !session.user) return null;

  await prisma.playback.deleteMany({
    where: { userid: session.user.id }
  });

  await prisma.user.delete({
    where: { id: session.user.id }
  });
};
