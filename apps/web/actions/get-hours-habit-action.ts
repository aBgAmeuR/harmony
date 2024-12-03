"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";

export const getHoursHabitAction = async (minDate: Date, maxDate: Date) => {
  const session = await auth();

  if (!session?.user.id) {
    return null;
  }
  const tracks = await prisma.track.findMany({
    where: {
      userId: session.user.id,
      timestamp: {
        gte: minDate,
        lt: maxDate,
      },
    },
    select: {
      timestamp: true,
      msPlayed: true,
    },
  });

  const listeningHabits = Array.from({ length: 24 }, (_, i) => {
    return {
      hour: i,
      msPlayed: 0,
    };
  });

  tracks.forEach((track) => {
    const hour = new Date(track.timestamp).getHours();
    listeningHabits[hour].msPlayed += Number(track.msPlayed);
  });

  return listeningHabits;
};
