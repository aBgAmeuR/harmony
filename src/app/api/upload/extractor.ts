import { getSpotifyTracksInfo } from "@/lib/spotify"

import {
  BasicUser,
  CleanDataType,
  CleanDataTypeWithScore,
  DataType,
  TrackType,
} from "./data"

export function getTopTracks(
  data: CleanDataType[],
  limit: number = 50
): CleanDataTypeWithScore[] {
  const scoredData = data.map((track) => ({
    ...track,
    score: (track.total_played + track.ms_played / 1e6) / 2,
  }))

  scoredData.sort((a, b) => b.score - a.score)

  return scoredData.slice(0, limit)
}

export async function getTracksInfo(
  tracks: CleanDataTypeWithScore[]
): Promise<TrackType[]> {
  const uris = tracks.map((track) => track.spotify_track_uri)
  const spotifyTracks = await getSpotifyTracksInfo(uris)

  return tracks.map((track) => {
    const spotifyTrack = spotifyTracks.find(
      (spotifyTrack: any) => spotifyTrack.uri === track.spotify_track_uri
    )

    return {
      ...track,
      image_url: spotifyTrack.album.images[0].url,
    }
  })
}

export function getUserData(data: DataType): BasicUser {
  return {
    id: data.username,
    username: data.username,
  }
}
