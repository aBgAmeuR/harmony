"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";

export const getDaysHabitAction = async (minDate: Date, maxDate: Date) => {
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

  const listeningHabits = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };

  tracks.forEach((track) => {
    const day = new Date(track.timestamp).getDay();
    switch (day) {
      case 0:
        listeningHabits.Sunday += Number(track.msPlayed);
        break;
      case 1:
        listeningHabits.Monday += Number(track.msPlayed);
        break;
      case 2:
        listeningHabits.Tuesday += Number(track.msPlayed);
        break;
      case 3:
        listeningHabits.Wednesday += Number(track.msPlayed);
        break;
      case 4:
        listeningHabits.Thursday += Number(track.msPlayed);
        break;
      case 5:
        listeningHabits.Friday += Number(track.msPlayed);
        break;
      case 6:
        listeningHabits.Saturday += Number(track.msPlayed);
        break;
    }
  });

  return Object.entries(listeningHabits).map(([day, msPlayed]) => ({
    day,
    msPlayed,
  }));
};
