"use server";

import { auth } from "./auth";
import { env } from "./env";
import { prisma } from "./prisma";

import { Track } from "@/types/spotify";

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

  const now = new Date().getTime();
  if (account.access_token && account.expires_at && account.expires_at > now) {
    return account.access_token;
  }

  const client_id = env.SPOTIFY_CLIENT_ID;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
      client_id: client_id
    })
  });

  const data = await response.json();

  return data.access_token;
}

export async function getSpotifyTracksInfo(uris: string[]) {
  const accessToken = await getSpotifyAccessToken();

  const ids = uris.map((uri) => uri.split(":").pop()).join(",");
  const url = `https://api.spotify.com/v1/tracks?ids=${ids}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = (await response.json()) as { tracks: Track[] };
  return data.tracks;
}

export async function getSpotifyArtistsInfo(tracksUris: string[]) {
  const accessToken = await getSpotifyAccessToken();

  const tracksIds = tracksUris.map((uri) => uri.split(":").pop()).join(",");
  const tracksUrl = `https://api.spotify.com/v1/tracks?ids=${tracksIds}`;

  const tracksResponse = await fetch(tracksUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const tracksData = await tracksResponse.json();
  const tracks = tracksData.tracks;

  const artistsUris: string[] = tracks.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (track: any) => track.artists[0].uri
  );
  const artistsIds = artistsUris.map((uri) => uri.split(":").pop()).join(",");
  const artistsUrl = `https://api.spotify.com/v1/artists?ids=${artistsIds}`;

  const artistsResponse = await fetch(artistsUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const artistsData = await artistsResponse.json();
  return artistsData.artists;
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
  return data.tracks;
}

export async function getUserInfo(id: string) {
  const accessToken = await getSpotifyAccessToken();

  const url = `https://api.spotify.com/v1/users/${id}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  return data;
}

type getUserTopItemsProps = {
  type: "tracks" | "artists";
  time_range: "short_term" | "medium_term" | "long_term";
};
export async function getUserTopItems<T>({
  type,
  time_range
}: getUserTopItemsProps) {
  const accessToken = await getSpotifyAccessToken();

  const url = `https://api.spotify.com/v1/me/top/${type}?time_range=${time_range}&limit=50`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  return data.items as T[];
}
