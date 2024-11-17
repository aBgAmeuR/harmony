import { auth } from "@repo/auth";
import { spotify } from "@repo/spotify";
import { NextResponse } from "next/server";

import { saveNewAlbums } from "./save-new-albums";
import { saveNewArtists } from "./save-new-artists";
import { saveNewTracks } from "./save-new-tracks";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user)
    return NextResponse.json({ message: "Not authenticated" });

  try {
    const data = (await req.json()) as string[];

    if (data.length <= 0) return NextResponse.json({ message: "ok" });

    const tracks = await spotify.tracks.list(data);

    await saveNewArtists(tracks);
    await saveNewAlbums(tracks);
    await saveNewTracks(tracks);

    return NextResponse.json({ message: "ok" });
  } catch (error) {
    console.error("Error saving tracks:", error as Error);
    return NextResponse.json({
      message: "error",
      error: (error as Error).toString(),
    });
  }
}
