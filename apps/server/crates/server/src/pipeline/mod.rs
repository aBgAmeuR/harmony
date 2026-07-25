mod deezer;
mod error;
mod image_encode;
mod report;
mod stages;
mod types;

pub use error::{PipelineError, Stage};

use std::sync::Arc;
use std::time::Instant;

use serde::Serialize;

use crate::progress::{ProgressAggregator, ProgressReporter, StepId};
use crate::storage::S3ObjectStore;

use self::deezer::DeezerClient;
use self::report::ExtractReport;

#[derive(Debug, Default, Clone)]
pub struct PipelineStats {
    pub files_taken_count: usize,
    pub parse_validated_count: usize,
    pub parse_invalid_count: usize,
    pub normalize_kept_count: usize,
    pub normalize_rejected_count: usize,
    pub deezer_resolved_count: usize,
    pub deezer_missed_count: usize,
    pub deezer_error_count: usize,
    pub deezer_tracks_fetched_count: usize,
    pub deezer_albums_fetched_count: usize,
    pub interactions_skipped_count: usize,
    pub verify_tracks_skipped_count: usize,
    pub verify_interactions_skipped_count: usize,
}

pub struct PipelineRequest {
    pub package_id: i32,
    pub public_id: String,
    pub zip_bytes: Vec<u8>,
    pub selected_files: Option<Vec<String>>,
    pub reporter: Option<ProgressReporter>,
    pub object_store: Arc<S3ObjectStore>,
}

fn begin_step(reporter: &Option<ProgressReporter>, step_id: StepId) -> Instant {
    if let Some(reporter) = reporter.as_ref() {
        reporter.step_started(step_id);
    }
    Instant::now()
}

fn complete_step(
    reporter: &Option<ProgressReporter>,
    step_id: StepId,
    started: Instant,
    output: Option<serde_json::Value>,
) {
    if let Some(reporter) = reporter.as_ref() {
        reporter.step_completed(step_id, started.elapsed().as_millis() as u64, output);
    }
}

fn serialize_output(value: &impl Serialize) -> Option<serde_json::Value> {
    serde_json::to_value(value).ok()
}

async fn run_cpu_stage<I, O, R, E, F>(
    reporter: &Option<ProgressReporter>,
    step_id: StepId,
    input: I,
    stage: F,
    apply: impl FnOnce(&R, &mut PipelineStats),
    to_output: impl FnOnce(&R) -> Option<serde_json::Value>,
    stats: &mut PipelineStats,
) -> Result<O, PipelineError>
where
    I: Send + 'static,
    O: Send + 'static,
    R: Send + 'static,
    E: Into<PipelineError> + Send + 'static,
    F: FnOnce(I) -> Result<(O, R), E> + Send + 'static,
{
    let started = begin_step(reporter, step_id);
    let (output, report) = tokio::task::spawn_blocking(move || stage(input))
        .await?
        .map_err(Into::into)?;
    apply(&report, stats);
    complete_step(reporter, step_id, started, to_output(&report));
    Ok(output)
}

#[tracing::instrument(
    skip(request),
    name = "pipeline.run",
    fields(
        package_id = request.package_id,
        zip_size_bytes = request.zip_bytes.len(),
        files_taken_count,
        parse_validated_count,
        parse_invalid_count,
        normalize_kept_count,
        normalize_rejected_count,
        catalogue_size,
        deezer_resolved_count,
        deezer_missed_count,
        deezer_error_count,
        deezer_tracks_fetched_count,
        deezer_albums_fetched_count,
        interactions_skipped_count,
        verify_tracks_skipped_count,
        verify_interactions_skipped_count,
    ),
)]
pub async fn run(request: PipelineRequest) -> Result<PipelineStats, PipelineError> {
    let PipelineRequest {
        package_id: _,
        public_id,
        zip_bytes,
        selected_files,
        reporter,
        object_store,
    } = request;

    let mut stats = PipelineStats::default();

    let extract = run_cpu_stage(
        &reporter,
        StepId::ExtractArchive,
        stages::extract::ExtractInput {
            zip_bytes,
            selected_files,
        },
        stages::extract::run,
        ExtractReport::apply_to_stats,
        |report| serialize_output(&report.to_output()),
        &mut stats,
    )
    .await?;

    let parse = run_cpu_stage(
        &reporter,
        StepId::ParseInteractions,
        stages::parse::ParseInput {
            files: extract.files,
        },
        stages::parse::run,
        |report, stats| report.apply_to_stats(stats),
        |report| serialize_output(&report.to_output()),
        &mut stats,
    )
    .await?;

    let normalize = run_cpu_stage(
        &reporter,
        StepId::NormalizeInteractions,
        stages::normalize::NormalizeInput { raw: parse.raw },
        stages::normalize::run,
        |report, stats| report.apply_to_stats(stats),
        |report| serialize_output(&report.to_output()),
        &mut stats,
    )
    .await?;

    let catalogue_size = normalize.catalogue.len();
    let deezer_client = {
        let config = deezer::load_config().map_err(error::ResolveError::MissingConfig)?;
        Arc::new(DeezerClient::new(config).map_err(error::ResolveError::HttpClient)?)
    };

    let resolve = {
        let started = begin_step(&reporter, StepId::ResolveTracks);
        let total = catalogue_size as u64;
        let mut aggregator = reporter.as_ref().map(|reporter| {
            ProgressAggregator::new(StepId::ResolveTracks, reporter.clone(), total)
        });

        let (output, report) = stages::resolve::run(
            Arc::clone(&deezer_client),
            stages::resolve::ResolveInput {
                catalogue: normalize.catalogue,
            },
            |done, failed| {
                if let Some(aggregator) = aggregator.as_mut() {
                    aggregator.on_item_done(done, failed);
                }
            },
        )
        .await?;

        report.apply_to_stats(&mut stats);
        complete_step(
            &reporter,
            StepId::ResolveTracks,
            started,
            serialize_output(&report.to_output()),
        );
        output
    };

    let enrich_tracks = {
        let started = begin_step(&reporter, StepId::EnrichTracks);
        let total = resolve.deezer_matches.len() as u64;
        let mut aggregator = reporter
            .as_ref()
            .map(|reporter| ProgressAggregator::new(StepId::EnrichTracks, reporter.clone(), total));

        let (output, report) = stages::enrich::fetch_tracks(
            Arc::clone(&deezer_client),
            stages::enrich::EnrichTracksInput {
                deezer_matches: resolve.deezer_matches.clone(),
            },
            |done, failed| {
                if let Some(aggregator) = aggregator.as_mut() {
                    aggregator.on_item_done(done, failed);
                }
            },
        )
        .await?;

        report.apply_to_stats(&mut stats);
        complete_step(
            &reporter,
            StepId::EnrichTracks,
            started,
            serialize_output(&report.to_output()),
        );
        output
    };

    let enrich_albums = {
        let started = begin_step(&reporter, StepId::EnrichAlbums);
        let total = enrich_tracks.album_ids.len() as u64;
        let mut aggregator = reporter
            .as_ref()
            .map(|reporter| ProgressAggregator::new(StepId::EnrichAlbums, reporter.clone(), total));

        let (output, report) = stages::enrich::fetch_albums(
            Arc::clone(&deezer_client),
            stages::enrich::EnrichAlbumsInput {
                album_ids: enrich_tracks.album_ids,
                deezer_artists: enrich_tracks.deezer_artists,
            },
            |done, failed| {
                if let Some(aggregator) = aggregator.as_mut() {
                    aggregator.on_item_done(done, failed);
                }
            },
        )
        .await?;

        report.apply_to_stats(&mut stats);
        complete_step(
            &reporter,
            StepId::EnrichAlbums,
            started,
            serialize_output(&report.to_output()),
        );
        output
    };

    let save_started = begin_step(&reporter, StepId::PersistInteractions);

    let aggregate = {
        let (output, report) = tokio::task::spawn_blocking({
            let normalized = normalize.normalized;
            let deezer_matches = resolve.deezer_matches;
            move || {
                stages::aggregate::run(stages::aggregate::AggregateInput {
                    normalized,
                    deezer_matches,
                })
            }
        })
        .await?
        .map_err(PipelineError::from)?;
        report.apply_to_stats(&mut stats);
        output
    };

    let verify = {
        let (output, report) = tokio::task::spawn_blocking({
            let albums = enrich_albums.deezer_albums;
            let tracks = enrich_tracks.deezer_tracks;
            let interactions = aggregate.interactions;
            move || {
                stages::verify::run(stages::verify::VerifyInput {
                    albums,
                    tracks,
                    interactions,
                })
            }
        })
        .await?
        .map_err(PipelineError::from)?;
        report.apply_to_stats(&mut stats);
        output
    };

    let (artifact, persist_output) = {
        let public_id = public_id.clone();
        let artists = enrich_albums.deezer_artists;
        tokio::task::spawn_blocking(move || {
            stages::persist::build(stages::persist::PersistInput {
                public_id,
                interactions: verify.interactions,
                tracks: verify.tracks,
                artists,
                albums: verify.albums,
            })
        })
        .await?
        .map_err(PipelineError::from)?
    };

    stages::persist::upload(&object_store, &artifact).await?;

    complete_step(
        &reporter,
        StepId::PersistInteractions,
        save_started,
        serialize_output(&persist_output),
    );

    record_stats(&stats, catalogue_size);
    Ok(stats)
}

fn record_stats(stats: &PipelineStats, catalogue_size: usize) {
    let span = tracing::Span::current();
    span.record("files_taken_count", stats.files_taken_count as i64);
    span.record("parse_validated_count", stats.parse_validated_count as i64);
    span.record("parse_invalid_count", stats.parse_invalid_count as i64);
    span.record("normalize_kept_count", stats.normalize_kept_count as i64);
    span.record(
        "normalize_rejected_count",
        stats.normalize_rejected_count as i64,
    );
    span.record("catalogue_size", catalogue_size as i64);
    span.record("deezer_resolved_count", stats.deezer_resolved_count as i64);
    span.record("deezer_missed_count", stats.deezer_missed_count as i64);
    span.record("deezer_error_count", stats.deezer_error_count as i64);
    span.record(
        "deezer_tracks_fetched_count",
        stats.deezer_tracks_fetched_count as i64,
    );
    span.record(
        "deezer_albums_fetched_count",
        stats.deezer_albums_fetched_count as i64,
    );
    span.record(
        "interactions_skipped_count",
        stats.interactions_skipped_count as i64,
    );
    span.record(
        "verify_tracks_skipped_count",
        stats.verify_tracks_skipped_count as i64,
    );
    span.record(
        "verify_interactions_skipped_count",
        stats.verify_interactions_skipped_count as i64,
    );
}
