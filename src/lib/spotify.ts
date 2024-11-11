"use server";

import { auth } from "./auth";
import { prisma } from "./prisma";

import { Artist, RecentlyPlayed, Track } from "@/types/spotify";

async function getSpotifyAccessToken() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id }
  });
  if (!account || !account.refresh_token) {
    throw new Error("Unauthorized");
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = Number(account.expires_at);
  const difference = Math.floor((expiresAt - now) / 60);

  if (difference > 10 && account.access_token) {
    return account.access_token;
  }

  console.log("REFRESHING TOKEN", difference);

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
      client_id: process.env.SPOTIFY_CLIENT_ID || ""
    }),
    cache: "no-cache"
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  } else {
    console.log("TOKEN REFRESHED");
  }

  const data = await response.json();
  const { access_token, expires_in, refresh_token } = data;
  const timestamp = Math.floor((Date.now() + expires_in * 1000) / 1000);

  await prisma.account.update({
    where: {
      provider_providerAccountId: {
        provider: "spotify",
        providerAccountId: account.providerAccountId
      }
    },
    data: {
      access_token,
      expires_at: timestamp,
      refresh_token
    }
  });

  return data.access_token;
}

export async function getSpotifyTracksInfo(uris: string[]) {
  const accessToken = await getSpotifyAccessToken();

  const ids = uris.join(",");
  const url = `https://api.spotify.com/v1/tracks?ids=${ids}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (response.status === 429) {
    throw new Error("Spotify Rate limit exceeded");
  }

  const data = await response.json();
  return data.tracks as Track[];
}

export async function getSpotifyArtistsInfo(artistUris: string[]) {
  const accessToken = await getSpotifyAccessToken();

  const artistsIds = artistUris.join(",");
  const artistsUrl = `https://api.spotify.com/v1/artists?ids=${artistsIds}`;

  const response = await fetch(artistsUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (response.status === 429) {
    throw new Error("Spotify Rate limit exceeded");
  }

  const artistsData = await response.json();
  return artistsData.artists as Artist[];
}

export async function getSpotifyAlbumsInfo(uris: string[]) {
  const accessToken = await getSpotifyAccessToken();

  const ids = uris.map((uri) => uri.split(":").pop()).join(",");
  const url = `https://api.spotify.com/v1/tracks?ids=${ids}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  return data.tracks as Track[];
}

export async function getUserTopItems<T>(
  type: "tracks" | "artists",
  time_range: "short_term" | "medium_term" | "long_term"
) {
  const accessToken = await getSpotifyAccessToken();

  const url = `https://api.spotify.com/v1/me/top/${type}?time_range=${time_range}&limit=50`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-cache"
  });

  const data = await response.json();
  return data.items as T[];
}

export async function getUserRecentlyPlayed() {
  const accessToken = await getSpotifyAccessToken();

  const url = "https://api.spotify.com/v1/me/player/recently-played?limit=50";

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-cache"
  });

  const data = await response.json();
  return data.items as RecentlyPlayed[];
}
