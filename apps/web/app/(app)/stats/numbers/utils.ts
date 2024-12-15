import { prisma } from "@repo/database";

export const getTracks = async (userId: string, minDate: Date, maxDate: Date) =>
  prisma.track.findMany({
    where: {
      userId,
      timestamp: { gte: minDate, lt: maxDate },
    },
    select: {
      timestamp: true,
      msPlayed: true,
      spotifyId: true,
      artistIds: true,
      offline: true,
      reasonStart: true,
    },
    orderBy: { timestamp: "asc" },
  });
