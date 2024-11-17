import { RecentlyPlayed } from "./types";

export const refreshAccessToken = async (refreshToken: string) => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.AUTH_SPOTIFY_ID || "",
    }),
  });

  return await response.json();
};

export const getUserRecentlyPlayed = async (accessToken: string) => {
  const response = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const { data, retryAfterDelay } = await handleResponse(response);
  return {
    items: data.items as RecentlyPlayed[],
    retryAfterDelay,
  };
};

const handleResponse = async (response: Response) => {
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    if (!retryAfter) {
      throw new Error("Rate limited but no Retry-After header");
    }

    const retryAfterDelay = parseInt(retryAfter, 10) * 1000;
    if (retryAfterDelay > 60000) {
      throw new Error("Rate limited for more than 60 seconds");
    }
    await new Promise((resolve) => setTimeout(resolve, retryAfterDelay));

    const response2 = await fetch(response.url, {
      headers: response.headers,
    });

    return await handleResponse(response2);
  }

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const retryAfterDelay = response.headers.get("Retry-After");
  return {
    data: await response.json(),
    retryAfterDelay: retryAfterDelay ? Number(retryAfterDelay) : 0,
  };
};
