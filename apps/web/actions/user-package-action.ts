"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";

type Package = {
  spotify_id: string;
  file_name: string;
  file_size: number;
};

export const createPackageAction = async (pakge: Package) => {
  const session = await auth();

  if (!session || !session.user || !session.user.id)
    return { message: "Not authenticated" };

  const userId = session.user.id;

  await prisma.package.create({
    data: {
      userId,
      spotify_id: pakge.spotify_id,
      fileName: pakge.file_name,
      fileSize: String(pakge.file_size),
    },
  });

  await prisma.track.deleteMany({
    where: {
      userId,
    },
  });
};

export const deleteLastPackageAction = async () => {
  const session = await auth();

  if (!session || !session.user || !session.user.id)
    return { message: "Not authenticated" };

  const userId = session.user.id;

  const lastPackage = await prisma.package.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!lastPackage) return { message: "No package found" };

  await prisma.package.delete({
    where: {
      id: lastPackage.id,
    },
  });

  await prisma.track.deleteMany({
    where: {
      userId,
    },
  });
};
