import { NextResponse } from "next/server"

import { getSpotifyAlbumsInfo, getSpotifyTracksInfo } from "@/lib/spotify"

export async function POST(req: Request) {
  const body = await req.json()
  try {
    if (!body.uris) throw new Error("Tracks not found")

    // const uris1 = body.uris.slice(0, 19)
    // const uris2 = body.uris.slice(19, 38)
    // const uris3 = body.uris.slice(38, 57)

    // const albums1 = await getSpotifyAlbumsInfo(uris1)
    // const albums2 = await getSpotifyAlbumsInfo(uris2)
    // const albums3 = await getSpotifyAlbumsInfo(uris3)

    // const albums = albums1.concat(albums2, albums3)

    const albums = await getSpotifyTracksInfo(body.uris)

    return NextResponse.json(albums)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
