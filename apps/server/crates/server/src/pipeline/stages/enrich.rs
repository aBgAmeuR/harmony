use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use std::time::Instant;

use futures::stream::{self, StreamExt};
use serde::Deserialize;
use tokio::runtime::Handle;

use crate::pipeline::deezer::{self, DeezerClient, DeezerFetchError};
use crate::pipeline::error::EnrichError;
use crate::pipeline::image_encode::{build_image_data_url, cdn_http_client};
use crate::pipeline::types::{DeezerAlbum, DeezerAlbumType, DeezerArtist, DeezerTrack};
use crate::pipeline::PipelineContext;
use crate::progress::{ProgressAggregator, StepId, StepProgress};

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

fn enrich_request_output(
    completed: u64,
    total: u64,
    fetched: usize,
    failed: u64,
) -> serde_json::Value {
    serde_json::json!({
        "total": total,
        "completed": completed,
        "fetched": fetched,
        "failed": failed,
    })
}

fn emit_enrich_progress(
    reporter: &crate::progress::ProgressReporter,
    step_id: StepId,
    current: u64,
    total: u64,
    failed: u64,
) {
    if total == 0 {
        return;
    }

    reporter.step_progress(
        step_id,
        StepProgress {
            phase: None,
            current,
            total,
            failed: if failed > 0 { Some(failed) } else { None },
        },
    );
}

fn complete_empty_enrich(ctx: &mut PipelineContext) {
    if let Some(reporter) = ctx.reporter.as_ref() {
        reporter.step_started(StepId::EnrichTracks);
        reporter.step_completed(
            StepId::EnrichTracks,
            0,
            Some(enrich_request_output(0, 0, 0, 0)),
        );
        reporter.step_started(StepId::EnrichAlbums);
        reporter.step_completed(
            StepId::EnrichAlbums,
            0,
            Some(enrich_request_output(0, 0, 0, 0)),
        );
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
        complete_empty_enrich(ctx);
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

    let track_total = track_ids.len() as u64;
    let tracks_started = Instant::now();
    if let Some(reporter) = ctx.reporter.as_ref() {
        reporter.step_started(StepId::EnrichTracks);
        emit_enrich_progress(reporter, StepId::EnrichTracks, 0, track_total, 0);
    }

    let mut track_aggregator = ctx.reporter.as_ref().map(|reporter| {
        ProgressAggregator::new(StepId::EnrichTracks, reporter.clone(), track_total)
    });

    let mut tracks_fetched = 0usize;
    let mut tracks_failed = 0u64;
    let mut album_ids = HashSet::new();
    let mut track_done = 0u64;

    handle.block_on(async {
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
                        ctx.deezer_artists.insert(artist.id, artist);
                    }
                    ctx.deezer_tracks.insert(track.id, track);
                    tracks_fetched += 1;
                }
                Err(err) => {
                    tracks_failed += 1;
                    tracing::info!(?err, "failed to fetch Deezer track");
                }
            }

            if let Some(aggregator) = track_aggregator.as_mut() {
                aggregator.on_item_done(track_done, tracks_failed);
            }
        }
    });

    if let Some(reporter) = ctx.reporter.as_ref() {
        reporter.step_completed(
            StepId::EnrichTracks,
            tracks_started.elapsed().as_millis() as u64,
            Some(enrich_request_output(
                track_done,
                track_total,
                tracks_fetched,
                tracks_failed,
            )),
        );
    }

    let album_id_list: Vec<i64> = album_ids.into_iter().collect();
    let album_total = album_id_list.len() as u64;
    let albums_started = Instant::now();
    if let Some(reporter) = ctx.reporter.as_ref() {
        reporter.step_started(StepId::EnrichAlbums);
        emit_enrich_progress(reporter, StepId::EnrichAlbums, 0, album_total, 0);
    }

    let mut album_aggregator = ctx.reporter.as_ref().map(|reporter| {
        ProgressAggregator::new(StepId::EnrichAlbums, reporter.clone(), album_total)
    });

    let mut albums_fetched = 0usize;
    let mut albums_failed = 0u64;
    let mut album_done = 0u64;
    let mut artist_picture_small_urls = HashMap::<i64, String>::new();
    let cdn_http = Arc::new(cdn_http_client()?);

    handle.block_on(async {
        let mut stream = stream::iter(album_id_list)
            .map(|album_id| {
                let client = Arc::clone(&client);
                let cdn_http = Arc::clone(&cdn_http);
                let url = format!("{DEEZER_ALBUM_URL}/{album_id}");
                async move {
                    let api_album = client.get_json::<ApiAlbum>(&url).await?;
                    let image =
                        build_image_data_url(cdn_http.as_ref(), &api_album.cover_small).await;
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
                    ctx.deezer_albums.insert(album.id, album);
                    albums_fetched += 1;
                }
                Err(err) => {
                    albums_failed += 1;
                    tracing::info!(?err, "failed to fetch Deezer album");
                }
            }

            if let Some(aggregator) = album_aggregator.as_mut() {
                aggregator.on_item_done(album_done, albums_failed);
            }
        }
    });

    let artist_image_ids: Vec<i64> = artist_picture_small_urls
        .keys()
        .copied()
        .filter(|artist_id| {
            ctx.deezer_artists
                .get(artist_id)
                .is_none_or(|artist| artist.image.is_none())
        })
        .collect();

    handle.block_on(async {
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
                if let Some(artist) = ctx.deezer_artists.get_mut(&artist_id) {
                    artist.image = Some(image);
                }
            } else {
                tracing::info!(artist_id, "failed to build artist image from picture_small");
            }
        }
    });

    ctx.stats.deezer_tracks_fetched_count = tracks_fetched;
    ctx.stats.deezer_albums_fetched_count = albums_fetched;

    if let Some(reporter) = ctx.reporter.as_ref() {
        reporter.step_completed(
            StepId::EnrichAlbums,
            albums_started.elapsed().as_millis() as u64,
            Some(enrich_request_output(
                album_done,
                album_total,
                albums_fetched,
                albums_failed,
            )),
        );
    }

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
