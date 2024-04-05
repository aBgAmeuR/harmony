import { env } from "./env"

let spotifyAuth = {
  accessToken: "",
  expiresAt: 0,
}

async function getSpotifyAccessToken() {
  const now = new Date().getTime()
  if (spotifyAuth.accessToken && spotifyAuth.expiresAt > now) {
    return spotifyAuth.accessToken
  }

  const client_id = env.SPOTIFY_CLIENT_ID
  const client_secret = env.SPOTIFY_CLIENT_SECRET

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${client_id}:${client_secret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  })

  const data = await response.json()

  spotifyAuth.accessToken = data.access_token
  spotifyAuth.expiresAt = now + data.expires_in * 1000

  return data.access_token
}

export async function getSpotifyTracksInfo(uris: string[]) {
  const accessToken = await getSpotifyAccessToken()

  const ids = uris.map((uri) => uri.split(":").pop()).join(",")
  const url = `https://api.spotify.com/v1/tracks?ids=${ids}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await response.json()
  return data.tracks
}
