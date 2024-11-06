import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma || new PrismaClient().$extends(withAccelerate());

// if (process.env.NODE_ENV === "development") global.prisma = prisma;
