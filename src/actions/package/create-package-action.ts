"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DataType } from "@/types/data";

export const createPackageAction = async (data: DataType) => {
  const session = await auth();

  if (!session || !session.user || !session.user.id)
    return new Error("User not authenticated");

  const packageId = await prisma.package.create({
    data: {
      spotify_id: data.username,
      userId: session.user.id
    }
  });

  return packageId.id;
};
