import {
  AlbumType,
  ArtistType,
  BasicUser,
  CleanDataType,
  DataType,
  GroupedAlbumsType,
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
