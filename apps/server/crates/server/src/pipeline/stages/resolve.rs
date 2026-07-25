use std::collections::HashMap;
use std::sync::Arc;

use futures::stream::{self, StreamExt};
use opentelemetry::trace::Status;
use serde::Deserialize;
use strsim::jaro_winkler;
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::pipeline::deezer::DeezerClient;
use crate::pipeline::error::ResolveError;
use crate::pipeline::report::ResolveReport;
use crate::pipeline::types::TrackKey;

const DEEZER_SEARCH: &str = "https://api.deezer.com/search";
const MATCH_THRESHOLD: f64 = 0.8;

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
    let mut url = reqwest::Url::parse(DEEZER_SEARCH)
        .map_err(|err| ResolveError::MissingConfig(format!("invalid Deezer search URL: {err}")))?;

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

    results
        .iter()
        .find(|result| jaro_winkler(&result.title.to_lowercase(), &our_lower) >= threshold)
}

#[tracing::instrument(
    skip(client, item),
    name = "pipeline.resolve_track",
    fields(
        track_key = item.track_key,
        track_found,
    ),
)]
async fn resolve_track(client: &DeezerClient, item: ResolveItem) -> TrackOutcome {
    let target_url = match build_deezer_search_url(&item.artist, &item.track) {
        Ok(url) => url,
        Err(_) => return TrackOutcome::Error,
    };

    match client.get_json::<SearchResponse>(&target_url).await {
        Ok(payload) => {
            if let Some(matched) = find_matching_track(&payload.data, &item.track, MATCH_THRESHOLD)
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
            tracing::info!(track_key = %item.track_key, ?err, "Deezer search failed");
            TrackOutcome::Error
        }
    }
}

pub struct ResolveInput {
    pub catalogue: HashMap<String, TrackKey>,
}

pub struct ResolveOutput {
    pub deezer_matches: HashMap<String, i64>,
}

/// Resolve catalogue entries against Deezer.
///
/// `on_item(done, errors)` is called after each track completes for progress reporting.
pub async fn run(
    client: Arc<DeezerClient>,
    input: ResolveInput,
    mut on_item: impl FnMut(u64, u64),
) -> Result<(ResolveOutput, ResolveReport), ResolveError> {
    let items: Vec<ResolveItem> = input
        .catalogue
        .into_iter()
        .map(|(track_key, track_meta)| ResolveItem {
            track_key,
            artist: track_meta.artist,
            track: track_meta.track,
        })
        .collect();

    if items.is_empty() {
        return Ok((
            ResolveOutput {
                deezer_matches: HashMap::new(),
            },
            ResolveReport::default(),
        ));
    }

    let concurrency = client.concurrency();
    let mut deezer_matches = HashMap::new();
    let mut resolved = 0usize;
    let mut missed = 0usize;
    let mut errors = 0usize;
    let mut done = 0u64;

    let mut stream = stream::iter(items)
        .map(|item| {
            let client = Arc::clone(&client);
            async move { resolve_track(&client, item).await }
        })
        .buffer_unordered(concurrency);

    while let Some(outcome) = stream.next().await {
        done += 1;
        match outcome {
            TrackOutcome::Matched {
                track_key,
                deezer_id,
            } => {
                deezer_matches.insert(track_key, deezer_id);
                resolved += 1;
            }
            TrackOutcome::Missed => missed += 1,
            TrackOutcome::Error => errors += 1,
        }
        on_item(done, errors as u64);
    }

    Ok((
        ResolveOutput { deezer_matches },
        ResolveReport {
            resolved,
            missed,
            errors,
        },
    ))
}
