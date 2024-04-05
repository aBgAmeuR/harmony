import { getSpotifyArtistsInfo, getSpotifyTracksInfo } from "@/lib/spotify"

import {
  ArtistType,
  BasicUser,
  CleanDataType,
  DataType,
  GroupedArtistType,
  TrackType,
} from "./data"

export async function getTopTracks(
  data: CleanDataType[],
  limit: number = 50
): Promise<TrackType[]> {
  const scoredData = data.map((track) => ({
    ...track,
    score: (track.total_played + track.ms_played / 1e6) / 2,
  }))

  scoredData.sort((a, b) => b.score - a.score)

  const tracks = scoredData.slice(0, limit)
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

export async function getTopArtists(
  data: CleanDataType[],
  limit: number = 50
): Promise<ArtistType[]> {
  const groupedData: Record<string, GroupedArtistType> = {}

  data.forEach((track) => {
    if (groupedData[track.artist_name]) {
      groupedData[track.artist_name].total_played += track.total_played
      groupedData[track.artist_name].ms_played += track.ms_played
    } else {
      groupedData[track.artist_name] = {
        total_played: track.total_played,
        ms_played: track.ms_played,
        name: track.artist_name,
        spotify_track_uri: track.spotify_track_uri,
      }
    }
  })

  const scoredData = Object.values(groupedData).map(
    (artist: GroupedArtistType) => ({
      ...artist,
      score: (artist.total_played + artist.ms_played / 1e6) / 2,
    })
  )

  scoredData.sort((a, b) => b.score - a.score)

  const artists = scoredData.slice(0, limit)

  const uris = artists.map((artist) => artist.spotify_track_uri)
  const spotifyArtists = await getSpotifyArtistsInfo(uris)

  return artists.map((artist) => {
    const spotifyArtist = spotifyArtists.find(
      (spotifyArtist: any) => spotifyArtist.name === artist.name
    )
    
    delete (artist as {spotify_track_uri?: string}).spotify_track_uri;
    return {
      ...artist,
      image_url: spotifyArtist.images[0].url,
      href: spotifyArtist.external_urls.spotify,
      spotify_artist_uri: spotifyArtist.uri,
    }
  })
}

export function getUserData(data: DataType): BasicUser {
  return {
    id: data.username,
    username: data.username,
  }
}
