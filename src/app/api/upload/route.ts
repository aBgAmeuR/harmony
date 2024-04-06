import { NextResponse } from "next/server"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import fetch from "node-fetch"

import { env } from "@/lib/env"

import { getTopArtists, getTopTracks, getUserData } from "./extractor"
import { storeArtists, storeTracks } from "./store"
import {
  extractZipAndVerifyFiles,
  mergeStreamingDataAndSort,
  validateFile,
} from "./validation"

export async function POST(req: Request) {
  if (env.VERCEL_ENV !== "development") {
    const body = (await req.json()) as HandleUploadBody
    try {
      const jsonResponse = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async (
          pathname
          /* clientPayload */
        ) => {
          // Generate a client token for the browser to upload the file
          // ⚠️ Authenticate and authorize users before generating the token.
          // Otherwise, you're allowing anonymous uploads.
          return {
            allowedContentTypes: ["application/zip"],
            maxFileSize: 50 * 1024 * 1024, // 50MB
            tokenPayload: JSON.stringify({
              // optional, sent to your server on upload completion
              // you could pass a user id from auth, or a value from clientPayload
            }),
          }
        },
        onUploadCompleted: async ({ blob, tokenPayload }) => {
          // Get notified of client upload completion
          // ⚠️ This will not work on `localhost` websites,
          // Use ngrok or similar to get the full upload flow
          console.log("blob upload completed", blob, tokenPayload)
          const response = await fetch(blob.url)
          if (!response.ok) {
            throw new Error("Failed to fetch the uploaded file")
          }
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
          await storeTracks(
            allTimeTracks,
            lastYearTracks,
            last6MonthsTracks,
            user
          )

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
        },
      })
      return NextResponse.json(jsonResponse)
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 } // The webhook will retry 5 times waiting for a 200
      )
    }
  } else {
    try {
      const url = new URL(
        "https://xuacnbrvpye17izq.public.blob.vercel-storage.com/my_spotify_data-OZbWwCCj7G5CGyjjE4Zo98pIM6tnkY.zip"
      )
      const response = await fetch(url)
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
}
