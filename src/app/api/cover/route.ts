import { NextResponse } from "next/server";

import { getCoverUrl } from "@/lib/cover";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    if (!body.album || !body.artist) throw new Error("Missing album or artist");

    const res = await getCoverUrl(body.album, body.artist);

    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
