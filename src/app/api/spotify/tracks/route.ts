import { NextResponse } from "next/server";

import { getSpotifyTracksInfo } from "@/lib/spotify";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    if (!body.uris) throw new Error("Tracks not found");

    const tracks = await getSpotifyTracksInfo(body.uris);

    return NextResponse.json(tracks);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
