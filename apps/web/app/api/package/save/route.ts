import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type Track = {
  timestamp: string;
  platform: string;
  msPlayed: number;
  spotifyId: string;
  artistIds: string[];
  albumId: string;
  albumArtistIds: string[];
  reasonStart: string;
  reasonEnd: string;
  shuffle: boolean | null;
  skipped: boolean | null;
  offline: boolean | null;
}[];

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id)
    return NextResponse.json({ message: "Not authenticated" });

  try {
    const userId = session.user.id;
    const data = (await req.json()) as Track;

    if (data.length <= 0) return NextResponse.json({ message: "ok" });

    console.log("data:", data.length);

    await prisma.track.createMany({
      data: data.map((track) => ({
        ...track,
        timestamp: new Date(track.timestamp),
        userId: userId,
      })),
    });

    return NextResponse.json({ message: "ok" });
  } catch (error) {
    console.error("Error saving tracks:", error as Error);
    return NextResponse.json({
      message: "error",
      error: (error as Error).toString(),
    });
  }
}
