"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";

type Package = {
  spotify_id?: string;
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
      spotify_id: pakge.spotify_id || session.user.id || "Unknown",
      fileName: pakge.file_name || "Unknown",
      fileSize: String(pakge.file_size) || "Unknown",
    },
  });

  const queries = [
    prisma.track.deleteMany({
      where: {
        userId,
      },
    }),
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hasPackage: true,
      },
    }),
  ];

  await prisma.$transaction(queries);
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

  const queries = [
    prisma.package.delete({
      where: {
        id: lastPackage.id,
      },
    }),

    prisma.track.deleteMany({
      where: {
        userId,
      },
    }),
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hasPackage: false,
      },
    }),
  ];

  await prisma.$transaction(queries);
};
