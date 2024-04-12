import { NextResponse } from "next/server"

import { getUserInfo } from "@/lib/spotify"

export async function POST(req: Request) {
  const body = await req.json()
  try {
    if (!body.id) throw new Error("User not found")

    const userInfo = await getUserInfo(body.id)

    return NextResponse.json(userInfo)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
