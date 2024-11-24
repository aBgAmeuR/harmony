import { auth } from "@repo/auth";
import { spotify } from "@repo/spotify";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export type TrackInfo = {
  artists: string[];
  album: string;
  artistsAlbums: string[];
};

type ReturnedTrack = Map<string, TrackInfo>;

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user)
    return NextResponse.json({ error: "Not authenticated" });

  try {
    const data = (await req.json()) as string[];

    // to refresh the token
    await spotify.me.get();

    const tracks = await spotify.tracks.list(data);

    const returnedTracks: ReturnedTrack = new Map();

    for (const track of tracks) {
      if (!track || !track?.id || !track?.name || !track?.uri) continue;

      if (!returnedTracks.has(track.id)) {
        returnedTracks.set(track.id, {
          artists: track.artists.map((artist) => artist.id),
          album: track.album.id,
          artistsAlbums: track.album.artists.map((artist) => artist.id),
        });
      }
    }

    return NextResponse.json(Object.fromEntries(returnedTracks));
  } catch (error) {
    console.error("Error saving tracks:", error as Error);
    return NextResponse.json({
      message: "error",
      error: (error as Error).toString(),
    });
  }
}
