import { NextResponse } from "next/server"
import songs from "@/data/songs.json"
import stats from "@/data/stats.json"
import { BasicUser } from "@/types"

export async function GET() {
  try {
    const user: BasicUser = {
      id: "demo",
      username: "Demo",
      image_url: "https://avatar.vercel.sh/hello.svg",
      href: "https://antoinejosset.fr/",
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }

    return NextResponse.json({ user, songs, stats })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
