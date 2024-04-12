import {
  AlbumDetailsType,
  AlbumType,
  ArtistDetailsType,
  ArtistType,
  BasicUser,
  CleanDataType,
  DataType,
  GroupedAlbumsType,
  GroupedArtistType,
  TrackDetailsType,
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
  const spotifyTracks = await fetch("/api/spotify/tracks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris }),
  }).then((res) => res.json())

  return tracks.map((track) => {
    const spotifyTrack = spotifyTracks.find(
      (spotifyTrack: any) => spotifyTrack.uri === track.spotify_track_uri
    )

    return {
      ...track,
      image_url: spotifyTrack.album.images[0].url,
      href: spotifyTrack.external_urls.spotify,
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
  const spotifyArtists = await fetch("/api/spotify/artists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris }),
  }).then((res) => res.json())

  return artists.map((artist) => {
    const spotifyArtist = spotifyArtists.find(
      (spotifyArtist: any) => spotifyArtist.name === artist.name
    )

    delete (artist as { spotify_track_uri?: string }).spotify_track_uri
    return {
      ...artist,
      image_url: spotifyArtist.images[0].url,
      href: spotifyArtist.external_urls.spotify,
      spotify_artist_uri: spotifyArtist.uri,
    }
  })
}

export async function getTopAlbums(
  data: CleanDataType[],
  limit: number = 50
): Promise<AlbumType[]> {
  const groupedData: Record<string, GroupedAlbumsType> = {}

  data.forEach((track) => {
    if (groupedData[track.album_name]) {
      groupedData[track.album_name].total_played += track.total_played
      groupedData[track.album_name].ms_played += track.ms_played
    } else {
      groupedData[track.album_name] = {
        total_played: track.total_played,
        ms_played: track.ms_played,
        name: track.album_name,
        artist_name: track.artist_name,
        spotify_track_uri: track.spotify_track_uri,
      }
    }
  })

  const scoredData = Object.values(groupedData).map(
    (album: GroupedAlbumsType) => ({
      ...album,
      score: (album.total_played + album.ms_played / 1e6) / 2,
    })
  )

  scoredData.sort((a, b) => b.score - a.score)

  const albums = scoredData.slice(0, limit)

  const uris = albums.map((album) => album.spotify_track_uri)
  const spotifyAlbums = await fetch("/api/spotify/albums", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris }),
  }).then((res) => res.json())

  return albums.map((album) => {
    const spotifyAlbum = spotifyAlbums.find(
      (spotifyAlbum: any) => spotifyAlbum.uri === album.spotify_track_uri
    )

    delete (album as { spotify_track_uri?: string }).spotify_track_uri
    return {
      ...album,
      artist_name: album.artist_name,
      image_url: spotifyAlbum.album.images[0].url,
      href: spotifyAlbum.album.external_urls.spotify,
      spotify_album_uri: spotifyAlbum.album.uri,
    }
  })
}

export function getUserData(data: DataType): BasicUser {
  return {
    id: data.username,
    username: data.username,
  }
}

export function filterDataWithFilter(
  data: CleanDataType[],
  filter: keyof CleanDataType
): CleanDataType[] {
  const groupedData: Record<string, CleanDataType> = {}

  data.forEach((track) => {
    if (groupedData[track[filter]]) {
      groupedData[track[filter]].total_played += track.total_played
      groupedData[track[filter]].ms_played += track.ms_played
    } else {
      groupedData[track[filter]] = {
        ...track,
      }
    }
  })

  return Object.values(groupedData)
}

export async function getArtistsDetails(
  data: ArtistType[],
  allData: CleanDataType[]
): Promise<ArtistDetailsType[]> {
  const artists = data.map((artist) => {
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
          score: (album.total_played + album.ms_played / 1e6) / 2,
        }))
        .sort((a, b) => b.score - a.score),
      tracks: tracks
        .map((track) => ({
          total_played: track.total_played,
          ms_played: track.ms_played,
          name: track.track_name,
          score: (track.total_played + track.ms_played / 1e6) / 2,
        }))
        .sort((a, b) => b.score - a.score),
    }
  })

  return artists
}

export async function getAlbumsDetails(
  data: AlbumType[],
  allData: CleanDataType[]
): Promise<AlbumDetailsType[]> {
  const albums = data.map((album) => {
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
          score: (track.total_played + track.ms_played / 1e6) / 2,
        }))
        .sort((a, b) => b.score - a.score),
    }
  })

  return albums
}

export async function getTracksDetails(
  data: TrackType[],
  allData: CleanDataType[]
): Promise<TrackDetailsType[]> {
  const tracks = data.map((track) => {
    const trackData = allData.filter(
      (data) => data.spotify_track_uri === track.spotify_track_uri
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
        score: (artist.total_played + artist.ms_played / 1e6) / 2,
      },
      album: {
        total_played: album.total_played,
        ms_played: album.ms_played,
        name: album.album_name,
        score: (album.total_played + album.ms_played / 1e6) / 2,
      },
    }
  })

  return tracks
}
