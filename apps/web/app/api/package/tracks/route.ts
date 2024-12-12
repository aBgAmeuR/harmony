import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
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
    const lastPackage = await prisma.package.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
      },
    });

    if (lastPackage) {
      const diff = new Date().getTime() - lastPackage.createdAt.getTime();
      // 24 hours of difference between the last package
      if (diff < 1000 * 60 * 60 * 24) {
        return NextResponse.json({
          message: "error",
          error: "You can only save tracks once a day",
        });
      }
    }

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
