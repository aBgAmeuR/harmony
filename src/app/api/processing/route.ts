import { NextResponse } from "next/server"
import fetch from "node-fetch"

import { getTopArtists, getTopTracks, getUserData } from "./extractor"
import { storeArtists, storeTracks } from "./store"
import {
  extractZipAndVerifyFiles,
  mergeStreamingDataAndSort,
} from "./validation"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const response = await fetch(body.url)
    if (!response.ok) throw new Error("Failed to fetch the uploaded file")

    const buffer = await response.arrayBuffer()
    const arrayBuffer = Buffer.from(buffer)

    const files = await extractZipAndVerifyFiles(arrayBuffer)

    const { allTimeData, lastYearData, last6MonthsData, lastTrack } =
      await mergeStreamingDataAndSort(files)

    const user = getUserData(lastTrack)

    // Tracks
    const [allTimeTracks, lastYearTracks, last6MonthsTracks] =
      await Promise.all([
        getTopTracks(allTimeData),
        getTopTracks(lastYearData),
        getTopTracks(last6MonthsData),
      ])
    await storeTracks(allTimeTracks, lastYearTracks, last6MonthsTracks, user)

    // Artists
    const [allTimeArtists, lastYearArtists, last6MonthsArtists] =
      await Promise.all([
        getTopArtists(allTimeData),
        getTopArtists(lastYearData),
        getTopArtists(last6MonthsData),
      ])
    await storeArtists(
      allTimeArtists,
      lastYearArtists,
      last6MonthsArtists,
      user
    )

    return NextResponse.json({ message: "Data uploaded successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
