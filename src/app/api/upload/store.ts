import { prisma } from "@/lib/prisma"

import { ArtistType, BasicUser, TrackType } from "./data"

export async function storeTracks(
  allTimeTracks: TrackType[],
  lastYearTracks: TrackType[],
  last6MonthsTracks: TrackType[],
  user: BasicUser
) {
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

export async function storeArtists(
  allTimeArtists: ArtistType[],
  lastYearArtists: ArtistType[],
  last6MonthsArtists: ArtistType[],
  user: BasicUser
) {
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
  await prisma.allTimeArtist.deleteMany({ where: { userId: userRecord.id } })
  await prisma.lastYearArtist.deleteMany({ where: { userId: userRecord.id } })
  await prisma.last6MonthsArtist.deleteMany({ where: { userId: userRecord.id } })

  await prisma.user.update({
    where: {
      id: userRecord.id,
    },
    data: {
      allTimeArtists: {
        create: allTimeArtists,
      },
      lastYearArtists: {
        create: lastYearArtists,
      },
      last6MonthsArtists: {
        create: last6MonthsArtists,
      },
    },
  })
}
