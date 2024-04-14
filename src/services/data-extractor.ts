import {
  Album,
  AlbumSimplified,
  Artist,
  ArtistSimplified,
  BasicUser,
  CleanDataType,
  DataType,
  StatsData,
  Track,
  TrackSimplified,
} from "@/types"

import {
  getSpotifyAlbums,
  getSpotifyArtists,
  getSpotifyTracks,
  getSpotifyUser,
} from "@/lib/api"
import {
  calculateScore,
  countUniqueValuesForKey,
  filterDataByKey,
  getAverageDailyData,
  getChartData,
  getDayWithMostStreams,
  sortDataDescending,
} from "@/lib/utils"

/**
 * Filters data by key and returns a simplified version of the data.
 * @param data Array of CleanDataType
 * @param keys Array of objects with keys to filter by
 * @param name Name of the key to group by
 * @returns Array of TrackSimplified, AlbumSimplified, or ArtistSimplified
 * depending on the name parameter
 */
function filterDataByKeys<
  T extends AlbumSimplified | ArtistSimplified | TrackSimplified,
>(
  data: CleanDataType[],
  keys: Array<{ [key in keyof CleanDataType]?: string }>,
  name: "artist_name" | "album_name" | "track_name"
): T[] {
  const res = data.filter((entry) =>
    keys.every((key) =>
      Object.entries(key).every(
        ([k, v]) => entry[k as keyof CleanDataType] === v
      )
    )
  )

  const finalData: Record<string, T> = {}
  res.forEach((data) => {
    const key = data[name]
    if (!finalData[key]) {
      finalData[key] = {
        name: data[name],
        total_played: 0,
        ms_played: 0,
        score: 0,
      } as T
    }
    finalData[key].total_played += data.total_played
    finalData[key].ms_played += data.ms_played
    finalData[key].score += calculateScore(data.total_played, data.ms_played)
  })

  return Object.values(finalData).sort((a, b) => b.score - a.score)
}

/**
 * Fetches top tracks based on clean data and a limit.
 * @param data Array of CleanDataType
 * @param limit Maximum number of tracks to return
 * @returns Array of Track
 */
export async function getTopTracks(
  data: CleanDataType[],
  limit: number = 50
): Promise<Track[]> {
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
    if (!spotifyTrack) throw new Error("Spotify track not found")

    const artist = filterDataByKeys<ArtistSimplified>(
      data,
      [{ artist_name: track.artist_name }],
      "artist_name"
    )[0]

    const album = filterDataByKeys<AlbumSimplified>(
      data,
      [{ album_name: track.album_name }, { artist_name: track.artist_name }],
      "album_name"
    )[0]

    return {
      name: track.track_name,
      spotify_uri: spotifyTrack.uri,
      image_url: spotifyTrack.album.images[0].url,
      href: spotifyTrack.external_urls.spotify,
      total_played: track.total_played,
      ms_played: track.ms_played,
      score: track.score,
      artist,
      album,
    }
  })
}

/**
 * Fetches top albums based on clean data and a limit.
 * @param data Array of CleanDataType
 * @param limit Maximum number of albums to return
 * @returns Array of Album
 */
export async function getTopAlbums(
  data: CleanDataType[],
  limit: number = 50
): Promise<Album[]> {
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
      (spotifyAlbum) =>
        spotifyAlbum.album.name?.includes(album.album_name) &&
        spotifyAlbum.album.artists[0].name.includes(album.artist_name)
    )
    if (!spotifyAlbum) throw new Error("Spotify album not found")

    const artist = filterDataByKeys<ArtistSimplified>(
      data,
      [
        { album_name: album.album_name },
        { artist_name: spotifyAlbum.artists[0].name },
      ],
      "artist_name"
    )[0]

    const tracks = filterDataByKeys<TrackSimplified>(
      data,
      [{ album_name: album.album_name }],
      "track_name"
    )

    return {
      name: album.album_name,
      spotify_uri: spotifyAlbum.album.uri,
      image_url: spotifyAlbum.album.images[0].url,
      href: spotifyAlbum.album.external_urls.spotify,
      total_played: album.total_played,
      ms_played: album.ms_played,
      score: album.score,
      artist,
      tracks,
    }
  })
}

/**
 * Fetches top artists based on clean data and a limit.
 * @param data Array of CleanDataType
 * @param limit Maximum number of artists to return
 * @returns Array of Artist
 */
export async function getTopArtists(
  data: CleanDataType[],
  limit: number = 50
): Promise<Artist[]> {
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
    const spotifyArtist = spotifyArtists.find((spotifyArtist) =>
      spotifyArtist.name.includes(artist.artist_name)
    )
    if (!spotifyArtist) throw new Error("Spotify artist not found")

    const albums = filterDataByKeys<AlbumSimplified>(
      data,
      [{ artist_name: artist.artist_name }],
      "album_name"
    )

    const tracks = filterDataByKeys<TrackSimplified>(
      data,
      [{ artist_name: artist.artist_name }],
      "track_name"
    )

    return {
      name: artist.artist_name,
      spotify_uri: spotifyArtist.uri,
      image_url: spotifyArtist.images[0].url,
      href: spotifyArtist.external_urls.spotify,
      total_played: artist.total_played,
      ms_played: artist.ms_played,
      score: artist.score,
      albums,
      tracks,
    }
  })
}

/**
 * Fetches basic user data from Spotify.
 * @param data Data to fetch user data from.
 * @returns BasicUser
 */
export async function getUserData(data: DataType): Promise<BasicUser> {
  const userInfo = await getSpotifyUser(data.username)

  return {
    id: data.username,
    username: userInfo.display_name || userInfo.id,
    href: userInfo.external_urls.spotify,
    image_url: userInfo.images[0]?.url || null,
  }
}

/**
 * Fetches stats data based on clean data.
 * @param data Array of CleanDataType
 * @param raw_data Array of DataType
 * @returns StatsData["long_term"]
 */
export async function getStatsData(
  data: CleanDataType[],
  raw_data: DataType[]
): Promise<StatsData["long_term"]> {
  const totalStreams = raw_data.length
  const totalMsPlayed = raw_data.reduce((acc, curr) => acc + curr.ms_played, 0)
  const totalTracks = countUniqueValuesForKey(data, "track_name")
  const totalArtists = countUniqueValuesForKey(data, "artist_name")
  const totalAlbums = countUniqueValuesForKey(data, "album_name")
  const { monthly_distribution, hourly_distribution } = getChartData(raw_data)
  const { averageDailyStreams, averageDailyMsPlayed } =
    getAverageDailyData(raw_data)
  const day_with_most_streams = getDayWithMostStreams(raw_data)

  return {
    total_streams: totalStreams,
    total_ms_played: totalMsPlayed,
    total_tracks: totalTracks,
    total_artists: totalArtists,
    total_albums: totalAlbums,
    average_daily_streams: averageDailyStreams,
    average_daily_ms_played: averageDailyMsPlayed,
    hourly_distribution,
    monthly_distribution,
    day_with_most_streams,
  }
}
