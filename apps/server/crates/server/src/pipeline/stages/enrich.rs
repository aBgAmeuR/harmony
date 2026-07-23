use std::collections::{HashMap, HashSet};
use std::sync::Arc;

use futures::stream::{self, StreamExt};
use serde::Deserialize;

use crate::pipeline::deezer::{DeezerClient, DeezerFetchError};
use crate::pipeline::error::EnrichError;
use crate::pipeline::image_encode::{build_image_data_url, cdn_http_client};
use crate::pipeline::report::{EnrichAlbumsReport, EnrichTracksReport};
use crate::pipeline::types::{DeezerAlbum, DeezerAlbumType, DeezerArtist, DeezerTrack};

const DEEZER_TRACK_URL: &str = "https://api.deezer.com/track";
const DEEZER_ALBUM_URL: &str = "https://api.deezer.com/album";

#[derive(Debug, Deserialize)]
struct ApiArtist {
    id: i64,
    name: String,
    picture: String,
    #[serde(default)]
    picture_small: String,
}

#[derive(Debug, Deserialize)]
struct ApiAlbumRef {
    id: i64,
}

#[derive(Debug, Deserialize)]
struct ApiTrack {
    id: i64,
    title: String,
    duration: i64,
    track_position: i64,
    disk_number: i64,
    #[serde(default)]
    release_date: Option<String>,
    #[serde(default)]
    contributors: Vec<ApiArtist>,
    artist: ApiArtist,
    album: ApiAlbumRef,
}

#[derive(Debug, Deserialize)]
struct ApiGenre {
    name: String,
}

#[derive(Debug, Deserialize)]
struct ApiGenres {
    #[serde(default)]
    data: Vec<ApiGenre>,
}

#[derive(Debug, Deserialize)]
struct ApiAlbum {
    id: i64,
    title: String,
    cover: String,
    #[serde(default)]
    cover_small: String,
    #[serde(default)]
    release_date: Option<String>,
    nb_tracks: i64,
    duration: i64,
    record_type: String,
    genres: ApiGenres,
    artist: ApiArtist,
    #[serde(default)]
    contributors: Vec<ApiArtist>,
}

fn normalize_release_date(value: Option<String>) -> Option<String> {
    value.and_then(|date| {
        let trimmed = date.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_string())
        }
    })
}

fn map_album_type(record_type: &str) -> DeezerAlbumType {
    if record_type.eq_ignore_ascii_case("single") {
        DeezerAlbumType::Single
    } else {
        DeezerAlbumType::Album
    }
}

fn map_track(api: ApiTrack) -> (DeezerTrack, Vec<DeezerArtist>) {
    let artists: Vec<i64> = if api.contributors.is_empty() {
        vec![api.artist.id]
    } else {
        api.contributors.iter().map(|artist| artist.id).collect()
    };

    let deezer_artists: Vec<DeezerArtist> = if api.contributors.is_empty() {
        vec![DeezerArtist {
            id: api.artist.id,
            name: api.artist.name,
            image_uri: api.artist.picture,
            image: None,
        }]
    } else {
        api.contributors
            .into_iter()
            .map(|artist| DeezerArtist {
                id: artist.id,
                name: artist.name,
                image_uri: artist.picture,
                image: None,
            })
            .collect()
    };

    let track = DeezerTrack {
        id: api.id,
        title: api.title,
        duration: api.duration,
        track_position: api.track_position,
        disk_number: api.disk_number,
        release_date: normalize_release_date(api.release_date),
        artists,
        album: api.album.id,
    };

    (track, deezer_artists)
}

fn map_album(api: ApiAlbum, image: Option<String>) -> DeezerAlbum {
    let artists: Vec<i64> = if api.contributors.is_empty() {
        vec![api.artist.id]
    } else {
        api.contributors.iter().map(|artist| artist.id).collect()
    };

    DeezerAlbum {
        id: api.id,
        title: api.title,
        image_uri: api.cover,
        image,
        release_date: normalize_release_date(api.release_date),
        genres: api.genres.data.into_iter().map(|genre| genre.name).collect(),
        nb_tracks: api.nb_tracks,
        duration: api.duration,
        album_type: map_album_type(&api.record_type),
        artists,
    }
}

fn collect_artist_picture_small_urls(
    artist_urls: &mut HashMap<i64, String>,
    api_album: &ApiAlbum,
) {
    let artists = if api_album.contributors.is_empty() {
        std::slice::from_ref(&api_album.artist)
    } else {
        api_album.contributors.as_slice()
    };

    for artist in artists {
        if !artist.picture_small.trim().is_empty() {
            artist_urls
                .entry(artist.id)
                .or_insert_with(|| artist.picture_small.clone());
        }
    }
}

pub struct EnrichTracksInput {
    pub deezer_matches: HashMap<String, i64>,
}

pub struct EnrichTracksOutput {
    pub deezer_tracks: HashMap<i64, DeezerTrack>,
    pub deezer_artists: HashMap<i64, DeezerArtist>,
    pub album_ids: HashSet<i64>,
}

pub async fn fetch_tracks(
    client: Arc<DeezerClient>,
    input: EnrichTracksInput,
    mut on_item: impl FnMut(u64, u64),
) -> Result<(EnrichTracksOutput, EnrichTracksReport), EnrichError> {
    if input.deezer_matches.is_empty() {
        return Ok((
            EnrichTracksOutput {
                deezer_tracks: HashMap::new(),
                deezer_artists: HashMap::new(),
                album_ids: HashSet::new(),
            },
            EnrichTracksReport::default(),
        ));
    }

    let concurrency = client.concurrency();
    let track_ids: Vec<i64> = input
        .deezer_matches
        .values()
        .copied()
        .collect::<HashSet<_>>()
        .into_iter()
        .collect();

    let track_total = track_ids.len() as u64;
    let mut deezer_tracks = HashMap::new();
    let mut deezer_artists = HashMap::new();
    let mut album_ids = HashSet::new();
    let mut tracks_fetched = 0usize;
    let mut tracks_failed = 0u64;
    let mut track_done = 0u64;

    let mut stream = stream::iter(track_ids)
        .map(|track_id| {
            let client = Arc::clone(&client);
            let url = format!("{DEEZER_TRACK_URL}/{track_id}");
            async move { client.get_json::<ApiTrack>(&url).await }
        })
        .buffer_unordered(concurrency);

    while let Some(result) = stream.next().await {
        track_done += 1;
        match result {
            Ok(api_track) => {
                album_ids.insert(api_track.album.id);
                let (track, artists) = map_track(api_track);
                for artist in artists {
                    deezer_artists.insert(artist.id, artist);
                }
                deezer_tracks.insert(track.id, track);
                tracks_fetched += 1;
            }
            Err(err) => {
                tracks_failed += 1;
                tracing::info!(?err, "failed to fetch Deezer track");
            }
        }
        on_item(track_done, tracks_failed);
    }

    Ok((
        EnrichTracksOutput {
            deezer_tracks,
            deezer_artists,
            album_ids,
        },
        EnrichTracksReport {
            total: track_total,
            completed: track_done,
            fetched: tracks_fetched,
            failed: tracks_failed,
        },
    ))
}

pub struct EnrichAlbumsInput {
    pub album_ids: HashSet<i64>,
    pub deezer_artists: HashMap<i64, DeezerArtist>,
}

pub struct EnrichAlbumsOutput {
    pub deezer_albums: HashMap<i64, DeezerAlbum>,
    pub deezer_artists: HashMap<i64, DeezerArtist>,
}

pub async fn fetch_albums(
    client: Arc<DeezerClient>,
    input: EnrichAlbumsInput,
    mut on_item: impl FnMut(u64, u64),
) -> Result<(EnrichAlbumsOutput, EnrichAlbumsReport), EnrichError> {
    let concurrency = client.concurrency();
    let album_id_list: Vec<i64> = input.album_ids.into_iter().collect();
    let album_total = album_id_list.len() as u64;
    let mut deezer_albums = HashMap::new();
    let mut deezer_artists = input.deezer_artists;
    let mut albums_fetched = 0usize;
    let mut albums_failed = 0u64;
    let mut album_done = 0u64;
    let mut artist_picture_small_urls = HashMap::<i64, String>::new();
    let cdn_http = Arc::new(cdn_http_client()?);

    let mut stream = stream::iter(album_id_list)
        .map(|album_id| {
            let client = Arc::clone(&client);
            let cdn_http = Arc::clone(&cdn_http);
            let url = format!("{DEEZER_ALBUM_URL}/{album_id}");
            async move {
                let api_album = client.get_json::<ApiAlbum>(&url).await?;
                let image = build_image_data_url(cdn_http.as_ref(), &api_album.cover_small).await;
                Ok::<_, DeezerFetchError>((api_album, image))
            }
        })
        .buffer_unordered(concurrency);

    while let Some(result) = stream.next().await {
        album_done += 1;
        match result {
            Ok((api_album, image)) => {
                collect_artist_picture_small_urls(&mut artist_picture_small_urls, &api_album);
                let album = map_album(api_album, image);
                deezer_albums.insert(album.id, album);
                albums_fetched += 1;
            }
            Err(err) => {
                albums_failed += 1;
                tracing::info!(?err, "failed to fetch Deezer album");
            }
        }
        on_item(album_done, albums_failed);
    }

    let artist_image_ids: Vec<i64> = artist_picture_small_urls
        .keys()
        .copied()
        .filter(|artist_id| {
            deezer_artists
                .get(artist_id)
                .is_none_or(|artist| artist.image.is_none())
        })
        .collect();

    let mut stream = stream::iter(artist_image_ids)
        .map(|artist_id| {
            let cdn_http = Arc::clone(&cdn_http);
            let picture_small = artist_picture_small_urls
                .get(&artist_id)
                .cloned()
                .unwrap_or_default();
            async move {
                let image = build_image_data_url(cdn_http.as_ref(), &picture_small).await;
                (artist_id, image)
            }
        })
        .buffer_unordered(concurrency);

    while let Some((artist_id, image)) = stream.next().await {
        if let Some(image) = image {
            if let Some(artist) = deezer_artists.get_mut(&artist_id) {
                artist.image = Some(image);
            }
        } else {
            tracing::info!(artist_id, "failed to build artist image from picture_small");
        }
    }

    Ok((
        EnrichAlbumsOutput {
            deezer_albums,
            deezer_artists,
        },
        EnrichAlbumsReport {
            total: album_total,
            completed: album_done,
            fetched: albums_fetched,
            failed: albums_failed,
        },
    ))
}
