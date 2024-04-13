import {
  AlbumDetailsType,
  AlbumType,
  ArtistDetailsType,
  ArtistType,
  BasicUser,
  CleanDataType,
  DataType,
  TrackDetailsType,
  TrackType,
} from "@/types"

import {
  getSpotifyAlbums,
  getSpotifyArtists,
  getSpotifyTracks,
  getSpotifyUser,
} from "@/lib/api"
import {
  calculateScore,
  filterDataByKey,
  sortDataDescending,
} from "@/lib/utils"

/**
 * Fetches top tracks based on clean data and a limit.
 * @param data Array of CleanDataType
 * @param limit Maximum number of tracks to return
 * @returns Array of TrackType
 */
export async function getTopTracks(
  data: CleanDataType[],
  limit: number = 50
): Promise<TrackType[]> {
  const scoredData = data.map((track) => ({
    ...track,
    score: calculateScore(track.total_played, track.ms_played),
  }))

  sortDataDescending(scoredData, "score")

  const tracks = scoredData.slice(0, limit)
  const uris = tracks.map((track) => track.spotify_track_uri)
  const spotifyTracks = await getSpotifyTracks(uris)

  return tracks.map((track) => {
    const spotifyTrack = spotifyTracks.find(
      (spotifyTrack) => spotifyTrack.uri === track.spotify_track_uri
    )
    if (!spotifyTrack) {
      throw new Error("Spotify track not found")
    }

    return {
      ...track,
      spotify_uri: spotifyTrack.uri,
      image_url: spotifyTrack.album.images[0].url,
      href: spotifyTrack.external_urls.spotify,
    }
  })
}

/**
 * Fetches top artists from the provided data.
 * @param data Array of CleanDataType
 * @param limit Maximum number of artists to return
 * @returns Array of ArtistType
 */
export async function getTopArtists(
  data: CleanDataType[],
  limit: number = 50
): Promise<ArtistType[]> {
  const groupedData = filterDataByKey(data, "artist_name")
  const scoredData = Object.values(groupedData).map((artist) => ({
    ...artist,
    score: calculateScore(artist.total_played, artist.ms_played),
  }))

  sortDataDescending(scoredData, "score")

  const artists = scoredData.slice(0, limit)
  const uris = artists.map((artist) => artist.spotify_track_uri)
  const spotifyArtists = await getSpotifyArtists(uris)

  return artists.map((artist) => {
    const spotifyArtist = spotifyArtists.find(
      (spotifyArtist) => spotifyArtist.name === artist.artist_name
    )
    if (!spotifyArtist) {
      throw new Error("Spotify artist not found")
    }
    delete (artist as { spotify_track_uri?: string }).spotify_track_uri
    return {
      ...artist,
      name: artist.artist_name,
      image_url: spotifyArtist.images[0].url,
      href: spotifyArtist.external_urls.spotify,
      spotify_uri: spotifyArtist.uri,
    }
  })
}

/**
 * Fetches top albums from the provided data.
 * @param data Array of CleanDataType
 * @param limit Maximum number of albums to return
 * @returns Array of AlbumType
 */
export async function getTopAlbums(
  data: CleanDataType[],
  limit: number = 50
): Promise<AlbumType[]> {
  const groupedData = filterDataByKey(data, "album_name")
  const scoredData = Object.values(groupedData).map((album) => ({
    ...album,
    score: calculateScore(album.total_played, album.ms_played),
  }))

  sortDataDescending(scoredData, "score")

  const albums = scoredData.slice(0, limit)
  const uris = albums.map((album) => album.spotify_track_uri)
  const spotifyAlbums = await getSpotifyAlbums(uris)

  return albums.map((album) => {
    const spotifyAlbum = spotifyAlbums.find(
      (spotifyAlbum) => spotifyAlbum.uri === album.spotify_track_uri
    )
    if (!spotifyAlbum) {
      throw new Error("Spotify album not found")
    }
    delete (album as { spotify_track_uri?: string }).spotify_track_uri
    return {
      ...album,
      name: album.album_name,
      artist_name: album.artist_name,
      image_url: spotifyAlbum.album.images[0].url,
      href: spotifyAlbum.album.external_urls.spotify,
      spotify_uri: spotifyAlbum.album.uri,
    }
  })
}

/**
 * Fetches user data from Spotify API.
 * @param data DataType from which the user's username is extracted.
 * @returns BasicUser with detailed user information.
 */
export async function getUserData(data: DataType): Promise<BasicUser> {
  const userInfo = await getSpotifyUser(data.username)

  return {
    id: data.username,
    username: userInfo.display_name || userInfo.id,
    href: userInfo.external_urls.spotify,
    image_url: userInfo.images[0]?.url || "",
  }
}

/**
 * Groups data by a specified filter key and aggregates play metrics.
 * @param data Array of CleanDataType
 * @param filter Key to group by
 * @returns Array of grouped CleanDataType
 */
export function filterDataWithFilter(
  data: CleanDataType[],
  filter: keyof CleanDataType
): CleanDataType[] {
  const groupedData: Record<string, CleanDataType> = {}

  data.forEach((track) => {
    const key = track[filter] as string
    if (groupedData[key]) {
      groupedData[key].total_played += track.total_played
      groupedData[key].ms_played += track.ms_played
    } else {
      groupedData[key] = {
        ...track,
        total_played: track.total_played,
        ms_played: track.ms_played,
      }
    }
  })

  return Object.values(groupedData)
}

/**
 * Fetches detailed artist information including albums and tracks.
 * @param data Array of ArtistType
 * @param allData Array of CleanDataType for detailed computation.
 * @returns Array of ArtistDetailsType with aggregated scores and details.
 */
export async function getArtistsDetails(
  data: ArtistType[],
  allData: CleanDataType[]
): Promise<ArtistDetailsType[]> {
  return data.map((artist) => {
    const artistData = allData.filter(
      (track) => track.artist_name === artist.name
    )
    const albums = filterDataWithFilter(artistData, "album_name")
    const tracks = filterDataWithFilter(artistData, "track_name")

    return {
      ...artist,
      albums: albums
        .map((album) => ({
          total_played: album.total_played,
          ms_played: album.ms_played,
          name: album.album_name,
          score: calculateScore(album.total_played, album.ms_played),
        }))
        .sort((a, b) => b.score - a.score),
      tracks: tracks
        .map((track) => ({
          total_played: track.total_played,
          ms_played: track.ms_played,
          name: track.track_name,
          score: calculateScore(track.total_played, track.ms_played),
        }))
        .sort((a, b) => b.score - a.score),
    }
  })
}

/**
 * Fetches detailed album information including the tracks.
 * @param data Array of AlbumType
 * @param allData Array of CleanDataType for detailed computation.
 * @returns Array of AlbumDetailsType with aggregated scores and details.
 */
export async function getAlbumsDetails(
  data: AlbumType[],
  allData: CleanDataType[]
): Promise<AlbumDetailsType[]> {
  return data.map((album) => {
    const albumData = allData.filter(
      (track) =>
        track.album_name === album.name &&
        track.artist_name === album.artist_name
    )
    const tracks = filterDataWithFilter(albumData, "track_name")
    return {
      ...album,
      tracks: tracks
        .map((track) => ({
          total_played: track.total_played,
          ms_played: track.ms_played,
          name: track.track_name,
          score: calculateScore(track.total_played, track.ms_played),
        }))
        .sort((a, b) => b.score - a.score),
    }
  })
}

/**
 * Fetches detailed track information including artist and album data.
 * @param data Array of TrackType
 * @param allData Array of CleanDataType for correlation.
 * @returns Array of TrackDetailsType with aggregated scores and details.
 */
export async function getTracksDetails(
  data: TrackType[],
  allData: CleanDataType[]
): Promise<TrackDetailsType[]> {
  return data.map((track) => {
    const trackData = allData.filter(
      (data) => data.spotify_track_uri === track.spotify_uri
    )
    const artist = filterDataWithFilter(trackData, "artist_name")[0]
    const album = filterDataWithFilter(trackData, "album_name")[0]

    return {
      ...track,
      name: track.track_name,
      artist: {
        total_played: artist.total_played,
        ms_played: artist.ms_played,
        name: artist.artist_name,
        score: calculateScore(artist.total_played, artist.ms_played),
      },
      album: {
        total_played: album.total_played,
        ms_played: album.ms_played,
        name: album.album_name,
        score: calculateScore(album.total_played, album.ms_played),
      },
    }
  })
}
