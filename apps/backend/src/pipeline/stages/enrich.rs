use std::collections::HashSet;
use std::sync::Arc;

use futures::stream::{self, StreamExt};
use serde::Deserialize;
use tokio::runtime::Handle;

use crate::pipeline::deezer::{self, DeezerClient, DeezerFetchError};
use crate::pipeline::error::EnrichError;
use crate::pipeline::types::{DeezerAlbum, DeezerAlbumType, DeezerArtist, DeezerTrack};
use crate::pipeline::PipelineContext;

const DEEZER_TRACK_URL: &str = "https://api.deezer.com/track";
const DEEZER_ALBUM_URL: &str = "https://api.deezer.com/album";

#[derive(Debug, Deserialize)]
struct ApiArtist {
    id: i64,
    name: String,
    picture: String,
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
            picture: api.artist.picture,
        }]
    } else {
        api.contributors
            .into_iter()
            .map(|artist| DeezerArtist {
                id: artist.id,
                name: artist.name,
                picture: artist.picture,
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

fn map_album(api: ApiAlbum) -> DeezerAlbum {
    let artists: Vec<i64> = if api.contributors.is_empty() {
        vec![api.artist.id]
    } else {
        api.contributors.iter().map(|artist| artist.id).collect()
    };

    DeezerAlbum {
        id: api.id,
        title: api.title,
        cover: api.cover,
        release_date: normalize_release_date(api.release_date),
        genres: api.genres.data.into_iter().map(|genre| genre.name).collect(),
        nb_tracks: api.nb_tracks,
        duration: api.duration,
        album_type: map_album_type(&api.record_type),
        artists,
    }
}

#[tracing::instrument(
    skip(ctx),
    name = "pipeline.enrich",
    fields(
        package_id = ctx.package_id,
        track_ids_count,
        tracks_fetched,
        albums_fetched,
    ),
)]
pub fn run(ctx: &mut PipelineContext) -> Result<(), EnrichError> {
    if ctx.deezer_matches.is_empty() {
        tracing::info!("enrich stage finished with no resolved Deezer track ids");
        return Ok(());
    }

    let config = deezer::load_config().map_err(EnrichError::MissingConfig)?;
    let client = DeezerClient::new(config).map_err(EnrichError::HttpClient)?;
    let concurrency = client.concurrency();
    let client = Arc::new(client);
    let handle = Handle::current();

    let track_ids: Vec<i64> = ctx
        .deezer_matches
        .values()
        .copied()
        .collect::<HashSet<_>>()
        .into_iter()
        .collect();

    let span = tracing::Span::current();
    span.record("track_ids_count", track_ids.len() as i64);

    let track_results: Vec<Result<ApiTrack, DeezerFetchError>> = handle.block_on(async {
        stream::iter(track_ids)
            .map(|track_id| {
                let client = Arc::clone(&client);
                let url = format!("{DEEZER_TRACK_URL}/{track_id}");
                async move {
                    client
                        .get_json::<ApiTrack>(&url)
                        .await
                        .map_err(|err| err)
                }
            })
            .buffer_unordered(concurrency)
            .collect()
            .await
    });

    let mut tracks_fetched = 0usize;
    let mut album_ids = HashSet::new();

    for result in track_results {
        match result {
            Ok(api_track) => {
                album_ids.insert(api_track.album.id);
                let (track, artists) = map_track(api_track);
                for artist in artists {
                    ctx.deezer_artists.insert(artist.id, artist);
                }
                ctx.deezer_tracks.insert(track.id, track);
                tracks_fetched += 1;
            }
            Err(err) => {
                tracing::info!(?err, "failed to fetch Deezer track");
            }
        }
    }

    let album_id_list: Vec<i64> = album_ids.into_iter().collect();

    let album_results: Vec<Result<ApiAlbum, DeezerFetchError>> = handle.block_on(async {
        stream::iter(album_id_list)
            .map(|album_id| {
                let client = Arc::clone(&client);
                let url = format!("{DEEZER_ALBUM_URL}/{album_id}");
                async move {
                    client
                        .get_json::<ApiAlbum>(&url)
                        .await
                        .map_err(|err| err)
                }
            })
            .buffer_unordered(concurrency)
            .collect()
            .await
    });

    let mut albums_fetched = 0usize;

    for result in album_results {
        match result {
            Ok(api_album) => {
                let album = map_album(api_album);
                ctx.deezer_albums.insert(album.id, album);
                albums_fetched += 1;
            }
            Err(err) => {
                tracing::info!(?err, "failed to fetch Deezer album");
            }
        }
    }

    ctx.stats.deezer_tracks_fetched_count = tracks_fetched;
    ctx.stats.deezer_albums_fetched_count = albums_fetched;

    span.record("tracks_fetched", tracks_fetched as i64);
    span.record("albums_fetched", albums_fetched as i64);

    tracing::info!(
        tracks_fetched = tracks_fetched,
        albums_fetched = albums_fetched,
        artists_count = ctx.deezer_artists.len(),
        "enrich stage finished"
    );

    Ok(())
}
