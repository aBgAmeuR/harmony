use std::env;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;

use futures::stream::{self, StreamExt};
use opentelemetry::trace::Status;
use reqwest::Client;
use serde::Deserialize;
use strsim::jaro_winkler;
use tokio::runtime::Handle;
use tokio::time::sleep;
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::pipeline::error::ResolveError;
use crate::pipeline::PipelineContext;

const DEEZER_SEARCH: &str = "https://api.deezer.com/search";
const PROXY_SECRET_HEADER: &str = "X-Harmony-Secret";

struct ResolveConfig {
    proxy_urls: Vec<String>,
    proxy_secret: String,
    request_gap_ms: u64,
    max_retries: u32,
    retry_delay_ms: u64,
    match_threshold: f64,
}

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
struct DeezerResponse {
    #[serde(default)]
    data: Vec<DeezerTrack>,
    error: Option<DeezerError>,
}

#[derive(Debug, Deserialize)]
struct DeezerTrack {
    id: i64,
    title: String,
}

#[derive(Debug, Deserialize)]
struct DeezerError {
    message: String,
}

fn load_config() -> Result<ResolveConfig, ResolveError> {
    let proxy_urls_raw = env::var("DEEZER_PROXY_URLS").map_err(|_| {
        ResolveError::MissingConfig("DEEZER_PROXY_URLS is not set".to_string())
    })?;

    let proxy_urls: Vec<String> = proxy_urls_raw
        .split(',')
        .map(str::trim)
        .filter(|url| !url.is_empty())
        .map(str::to_string)
        .collect();

    if proxy_urls.is_empty() {
        return Err(ResolveError::MissingConfig(
            "DEEZER_PROXY_URLS is empty".to_string(),
        ));
    }

    for proxy_url in &proxy_urls {
        reqwest::Url::parse(proxy_url).map_err(|err| {
            ResolveError::MissingConfig(format!("invalid proxy URL '{proxy_url}': {err}"))
        })?;
    }

    let proxy_secret = env::var("DEEZER_PROXY_SECRET").map_err(|_| {
        ResolveError::MissingConfig("DEEZER_PROXY_SECRET is not set".to_string())
    })?;

    if proxy_secret.trim().is_empty() {
        return Err(ResolveError::MissingConfig(
            "DEEZER_PROXY_SECRET is empty".to_string(),
        ));
    }

    let request_gap_ms = env::var("DEEZER_REQUEST_GAP_MS")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(50);

    let max_retries = env::var("DEEZER_MAX_RETRIES")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(3);

    let retry_delay_ms = env::var("DEEZER_RETRY_DELAY_MS")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(1000);

    let match_threshold = env::var("DEEZER_MATCH_THRESHOLD")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(0.8);

    Ok(ResolveConfig {
        proxy_urls,
        proxy_secret,
        request_gap_ms,
        max_retries,
        retry_delay_ms,
        match_threshold,
    })
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

fn next_proxy_url(
    proxy_urls: &[String],
    proxy_round: &AtomicUsize,
    target_url: &str,
) -> String {
    let index = proxy_round.fetch_add(1, Ordering::Relaxed) % proxy_urls.len();
    let mut url = reqwest::Url::parse(&proxy_urls[index]).expect("proxy URL validated at startup");
    url.query_pairs_mut().append_pair("target", target_url);
    url.to_string()
}

#[derive(Debug)]
enum DeezerFetchError {
    Network(reqwest::Error),
    QuotaExceeded,
}

impl DeezerFetchError {
    fn is_retryable(&self) -> bool {
        match self {
            Self::Network(err) => {
                err.is_timeout()
                    || err.is_connect()
                    || err.is_request()
                    || err
                        .status()
                        .is_some_and(|status| is_retryable_status(status))
            }
            Self::QuotaExceeded => true,
        }
    }
}

fn find_matching_track<'a>(
    results: &'a [DeezerTrack],
    our_track: &str,
    threshold: f64,
) -> Option<&'a DeezerTrack> {
    let our_lower = our_track.to_lowercase();

    for result in results {
        let similarity = jaro_winkler(&result.title.to_lowercase(), &our_lower);
        if similarity >= threshold {
            return Some(result);
        }
    }

    None
}

fn is_retryable_status(status: reqwest::StatusCode) -> bool {
    status == reqwest::StatusCode::TOO_MANY_REQUESTS || status.is_server_error()
}

async fn fetch_deezer_search(
    client: &Client,
    config: &ResolveConfig,
    proxy_round: &AtomicUsize,
    target_url: &str,
) -> Result<DeezerResponse, DeezerFetchError> {
    let proxy_url = next_proxy_url(&config.proxy_urls, proxy_round, target_url);

    let response = client
        .get(proxy_url)
        .header(PROXY_SECRET_HEADER, &config.proxy_secret)
        .send()
        .await
        .map_err(DeezerFetchError::Network)?;

    sleep(Duration::from_millis(config.request_gap_ms)).await;

    let status = response.status();
    if !status.is_success() {
        return Err(DeezerFetchError::Network(response.error_for_status().unwrap_err()));
    }

    let payload: DeezerResponse = response
        .json()
        .await
        .map_err(DeezerFetchError::Network)?;

    if payload
        .error
        .as_ref()
        .is_some_and(|err| err.message == "Quota limit exceeded")
    {
        return Err(DeezerFetchError::QuotaExceeded);
    }

    Ok(payload)
}

#[tracing::instrument(
    skip(client, config, proxy_round, item),
    name = "pipeline.resolve_track",
    fields(
        track_key = item.track_key,
        track_found,
    ),
)]
async fn resolve_track(
    client: &Client,
    config: &ResolveConfig,
    proxy_round: &AtomicUsize,
    item: ResolveItem,
) -> TrackOutcome {
    let target_url = match build_deezer_search_url(&item.artist, &item.track) {
        Ok(url) => url,
        Err(_) => {
            return TrackOutcome::Error;
        }
    };

    let mut last_error = false;

    for attempt in 0..config.max_retries {
        if attempt > 0 {
            sleep(Duration::from_millis(config.retry_delay_ms)).await;
        }

        match fetch_deezer_search(client, config, proxy_round, &target_url).await {
            Ok(payload) => {
                if let Some(matched) =
                    find_matching_track(&payload.data, &item.track, config.match_threshold)
                {
                    tracing::Span::current().record("track_found", true);

                    return TrackOutcome::Matched {
                        track_key: item.track_key,
                        deezer_id: matched.id,
                    };
                }

                tracing::Span::current().record("track_found", false);
                tracing::Span::current().set_status(Status::error("Deezer track not found"));

                return TrackOutcome::Missed;
            }
            Err(err) => {
                if err.is_retryable() && attempt + 1 < config.max_retries {
                    tracing::info!(
                        track_key = %item.track_key,
                        attempt = attempt + 1,
                        ?err,
                        "retrying Deezer search"
                    );
                    last_error = true;
                    continue;
                }

                tracing::info!(
                    track_key = %item.track_key,
                    ?err,
                    "Deezer search failed"
                );
                return TrackOutcome::Error;
            }
        }
    }

    if last_error {
        TrackOutcome::Error
    } else {
        TrackOutcome::Missed
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
    let config = load_config()?;
    let concurrency = config.proxy_urls.len();

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
        return Ok(());
    }

    let client = Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(ResolveError::HttpClient)?;

    let config = Arc::new(config);
    let proxy_round = Arc::new(AtomicUsize::new(0));
    let handle = Handle::current();

    let outcomes: Vec<TrackOutcome> = handle.block_on(async {
        stream::iter(items)
            .map(|item| {
                let client = client.clone();
                let config = Arc::clone(&config);
                let proxy_round = Arc::clone(&proxy_round);
                async move { resolve_track(&client, &config, &proxy_round, item).await }
            })
            .buffer_unordered(concurrency)
            .collect()
            .await
    });

    let mut resolved = 0usize;
    let mut missed = 0usize;
    let mut errors = 0usize;

    for outcome in outcomes {
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
    }

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

    Ok(())
}
