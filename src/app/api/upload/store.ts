import { prisma } from "@/lib/prisma"

import { BasicUser, TrackType } from "./data"

type TracksData = {
  allTimeTracks: TrackType[]
  lastYearTracks: TrackType[]
  last6MonthsTracks: TrackType[]
}

/**
 *
 * Si l'utilisateur n'existe pas, créez-le. Sinon, on supprime les anciennes pistes et on les remplace par les nouvelles.
 *
 */
export async function storeTracks(tracks: TracksData, user: BasicUser) {
  const { allTimeTracks, last6MonthsTracks, lastYearTracks } = tracks
  const { username } = user

  let userRecord = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!userRecord) {
    userRecord = await prisma.user.create({
      data: {
        username,
      },
    })
  }

  // Supprimez d'abord toutes les pistes existantes pour cet utilisateur, puis recréez-les.
  await prisma.allTimeTrack.deleteMany({ where: { userId: userRecord.id } })
  await prisma.lastYearTrack.deleteMany({ where: { userId: userRecord.id } })
  await prisma.last6MonthsTrack.deleteMany({ where: { userId: userRecord.id } })

  // Ensuite, pour chaque type de piste, créez les nouvelles entrées.
  // await prisma.allTimeTrack.createMany({
  //   data: allTimeTracks.map((track) => ({
  //     ...track,
  //     userId: userRecord.id,
  //   })),
  // })

  // await prisma.lastYearTrack.createMany({
  //   data: lastYearTracks.map((track) => ({
  //     ...track,
  //     userId: userRecord.id,
  //   })),
  // })

  // await prisma.last6MonthsTrack.createMany({
  //   data: last6MonthsTracks.map((track) => ({
  //     ...track,
  //     userId: userRecord.id,
  //   })),
  // })

  await prisma.user.update({
    where: {
      id: userRecord.id,
    },
    data: {
      allTimeTracks: {
        create: allTimeTracks,
      },
      lastYearTracks: {
        create: lastYearTracks,
      },
      last6MonthsTracks: {
        create: last6MonthsTracks,
      },
    },
  })
}
