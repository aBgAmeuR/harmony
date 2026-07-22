use std::env;
use std::sync::Arc;
use std::time::Instant;

use futures::stream::{self, StreamExt};
use opentelemetry::trace::Status;
use serde::Deserialize;
use strsim::jaro_winkler;
use tokio::runtime::Handle;
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::pipeline::deezer::{self, DeezerClient};
use crate::pipeline::error::ResolveError;
use crate::pipeline::PipelineContext;
use crate::progress::{ProgressAggregator, StepId};

const DEEZER_SEARCH: &str = "https://api.deezer.com/search";

struct ResolveItem {
    track_key: String,
    artist: String,
    track: String,
}

enum TrackOutcome {
    Matched { track_key: String, deezer_id: i64 },
    Missed,
    Error,
}

#[derive(Debug, Deserialize)]
struct SearchResponse {
    #[serde(default)]
    data: Vec<DeezerSearchTrack>,
}

#[derive(Debug, Deserialize)]
struct DeezerSearchTrack {
    id: i64,
    title: String,
}

fn build_deezer_search_url(artist: &str, track: &str) -> Result<String, ResolveError> {
    let mut url = reqwest::Url::parse(DEEZER_SEARCH).map_err(|err| {
        ResolveError::MissingConfig(format!("invalid Deezer search URL: {err}"))
    })?;

    let query = format!(r#"artist:"{artist}" track:"{track}""#);
    url.query_pairs_mut()
        .append_pair("q", &query)
        .append_pair("strict", "on");

    Ok(url.to_string())
}

fn find_matching_track<'a>(
    results: &'a [DeezerSearchTrack],
    our_track: &str,
    threshold: f64,
) -> Option<&'a DeezerSearchTrack> {
    let our_lower = our_track.to_lowercase();

    for result in results {
        let similarity = jaro_winkler(&result.title.to_lowercase(), &our_lower);
        if similarity >= threshold {
            return Some(result);
        }
    }

    None
}

#[tracing::instrument(
    skip(client, item),
    name = "pipeline.resolve_track",
    fields(
        track_key = item.track_key,
        track_found,
    ),
)]
async fn resolve_track(
    client: &DeezerClient,
    match_threshold: f64,
    item: ResolveItem,
) -> TrackOutcome {
    let target_url = match build_deezer_search_url(&item.artist, &item.track) {
        Ok(url) => url,
        Err(_) => {
            return TrackOutcome::Error;
        }
    };

    match client.get_json::<SearchResponse>(&target_url).await {
        Ok(payload) => {
            if let Some(matched) =
                find_matching_track(&payload.data, &item.track, match_threshold)
            {
                tracing::Span::current().record("track_found", true);

                return TrackOutcome::Matched {
                    track_key: item.track_key,
                    deezer_id: matched.id,
                };
            }

            tracing::Span::current().record("track_found", false);
            tracing::Span::current().set_status(Status::error("Deezer track not found"));

            TrackOutcome::Missed
        }
        Err(err) => {
            tracing::info!(
                track_key = %item.track_key,
                ?err,
                "Deezer search failed"
            );
            TrackOutcome::Error
        }
    }
}

#[tracing::instrument(
    skip(ctx),
    name = "pipeline.resolve",
    fields(
        package_id = ctx.package_id,
        catalogue_size = ctx.catalogue.len(),
        resolved,
        missed,
        errors,
    ),
)]
pub fn run(ctx: &mut PipelineContext) -> Result<(), ResolveError> {
    let started = Instant::now();
    if let Some(reporter) = ctx.reporter.as_ref() {
        reporter.step_started(StepId::ResolveTracks);
    }

    let items: Vec<ResolveItem> = ctx
        .catalogue
        .iter()
        .map(|(track_key, track_meta)| ResolveItem {
            track_key: track_key.clone(),
            artist: track_meta.artist.clone(),
            track: track_meta.track.clone(),
        })
        .collect();

    if items.is_empty() {
        tracing::info!("resolve stage finished with empty catalogue");
        if let Some(reporter) = ctx.reporter.as_ref() {
            reporter.step_completed(
                StepId::ResolveTracks,
                started.elapsed().as_millis() as u64,
                Some(serde_json::json!({
                    "resolved": 0,
                    "missed": 0,
                    "errors": 0,
                })),
            );
        }
        return Ok(());
    }

    let config = deezer::load_config().map_err(ResolveError::MissingConfig)?;
    let match_threshold = 0.8;

    let client = DeezerClient::new(config).map_err(ResolveError::HttpClient)?;
    let concurrency = client.concurrency();
    let client = Arc::new(client);
    let handle = Handle::current();
    let total = items.len() as u64;

    let mut aggregator = ctx
        .reporter
        .as_ref()
        .map(|reporter| ProgressAggregator::new(StepId::ResolveTracks, reporter.clone(), total));

    let mut resolved = 0usize;
    let mut missed = 0usize;
    let mut errors = 0usize;
    let mut done = 0u64;

    handle.block_on(async {
        let mut stream = stream::iter(items)
            .map(|item| {
                let client = Arc::clone(&client);
                async move { resolve_track(&client, match_threshold, item).await }
            })
            .buffer_unordered(concurrency);

        while let Some(outcome) = stream.next().await {
            done += 1;
            match outcome {
                TrackOutcome::Matched {
                    track_key,
                    deezer_id,
                } => {
                    ctx.deezer_matches.insert(track_key, deezer_id);
                    resolved += 1;
                }
                TrackOutcome::Missed => {
                    missed += 1;
                }
                TrackOutcome::Error => {
                    errors += 1;
                }
            }

            if let Some(aggregator) = aggregator.as_mut() {
                aggregator.on_item_done(done, errors as u64);
            }
        }
    });

    ctx.stats.deezer_resolved_count = resolved;
    ctx.stats.deezer_missed_count = missed;
    ctx.stats.deezer_error_count = errors;

    let span = tracing::Span::current();
    span.record("resolved", resolved as i64);
    span.record("missed", missed as i64);
    span.record("errors", errors as i64);

    tracing::info!(
        resolved = resolved,
        missed = missed,
        errors = errors,
        "resolve stage finished"
    );

    if let Some(reporter) = ctx.reporter.as_ref() {
        reporter.step_completed(
            StepId::ResolveTracks,
            started.elapsed().as_millis() as u64,
            Some(serde_json::json!({
                "resolved": resolved,
                "missed": missed,
                "errors": errors,
            })),
        );
    }

    Ok(())
}
