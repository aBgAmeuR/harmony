import { NextResponse } from "next/server";

import { getSpotifyArtistsInfo } from "@/lib/spotify";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    if (!body.uris) throw new Error("Tracks not found");

    const artists = await getSpotifyArtistsInfo(body.uris);

    return NextResponse.json(artists);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
