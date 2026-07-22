mod deezer;
mod error;
mod image_encode;
mod stages;
mod types;

pub use error::PipelineError;
pub use types::{
    ArchiveFile, DeezerAlbum, DeezerArtist, DeezerTrack, Interaction,
    NormalizedInteraction, RawInteraction, TrackKey,
};

use std::collections::HashMap;
use std::sync::Arc;
use std::time::Instant;

use crate::progress::{ProgressReporter, StepId};
use crate::storage::S3ObjectStore;

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

pub struct PipelineContext {
    pub package_id: i32,
    pub public_id: String,
    pub zip_bytes: Vec<u8>,
    pub selected_files: Option<Vec<String>>,
    pub files: Vec<ArchiveFile>,
    pub raw: Vec<RawInteraction>,
    pub normalized: Vec<NormalizedInteraction>,
    pub catalogue: HashMap<String, TrackKey>,
    pub deezer_matches: HashMap<String, i64>,
    pub deezer_tracks: HashMap<i64, DeezerTrack>,
    pub deezer_artists: HashMap<i64, DeezerArtist>,
    pub deezer_albums: HashMap<i64, DeezerAlbum>,
    pub interactions: Vec<Interaction>,
    pub stats: PipelineStats,
    pub reporter: Option<ProgressReporter>,
    pub object_store: Arc<S3ObjectStore>,
}

impl PipelineContext {
    pub fn new(
        package_id: i32,
        public_id: String,
        zip_bytes: Vec<u8>,
        selected_files: Option<Vec<String>>,
        reporter: Option<ProgressReporter>,
        object_store: Arc<S3ObjectStore>,
    ) -> Self {
        Self {
            package_id,
            public_id,
            zip_bytes,
            selected_files,
            files: Vec::new(),
            raw: Vec::new(),
            normalized: Vec::new(),
            catalogue: HashMap::new(),
            deezer_matches: HashMap::new(),
            deezer_tracks: HashMap::new(),
            deezer_artists: HashMap::new(),
            deezer_albums: HashMap::new(),
            interactions: Vec::new(),
            stats: PipelineStats {
                files_taken_count: 0,
                parse_validated_count: 0,
                parse_invalid_count: 0,
                normalize_kept_count: 0,
                normalize_rejected_count: 0,
                deezer_resolved_count: 0,
                deezer_missed_count: 0,
                deezer_error_count: 0,
                deezer_tracks_fetched_count: 0,
                deezer_albums_fetched_count: 0,
                interactions_skipped_count: 0,
                verify_tracks_skipped_count: 0,
                verify_interactions_skipped_count: 0,
            },
            reporter,
            object_store,
        }
    }
}

fn run_reported_stage<F>(
    ctx: &mut PipelineContext,
    step_id: StepId,
    output: impl FnOnce(&PipelineContext) -> serde_json::Value,
    stage: F,
) -> Result<(), PipelineError>
where
    F: FnOnce(&mut PipelineContext) -> Result<(), PipelineError>,
{
    let started = Instant::now();
    if let Some(reporter) = ctx.reporter.as_ref() {
        reporter.step_started(step_id);
    }

    stage(ctx)?;

    if let Some(reporter) = ctx.reporter.as_ref() {
        reporter.step_completed(
            step_id,
            started.elapsed().as_millis() as u64,
            Some(output(ctx)),
        );
    }

    Ok(())
}

fn merged_save_output(ctx: &PipelineContext) -> serde_json::Value {
    serde_json::json!({
        "interactions": ctx.interactions.len(),
        "tracks": ctx.deezer_tracks.len(),
        "albums": ctx.deezer_albums.len(),
        "artists": ctx.deezer_artists.len(),
    })
}

fn run_save_bundle(ctx: &mut PipelineContext) -> Result<(), PipelineError> {
    let started = Instant::now();
    if let Some(reporter) = ctx.reporter.as_ref() {
        reporter.step_started(StepId::PersistInteractions);
    }

    stages::aggregate::run(ctx).map_err(PipelineError::Aggregate)?;
    stages::verify::run(ctx).map_err(PipelineError::Verify)?;
    stages::persist::run(ctx).map_err(PipelineError::Persist)?;

    if let Some(reporter) = ctx.reporter.as_ref() {
        reporter.step_completed(
            StepId::PersistInteractions,
            started.elapsed().as_millis() as u64,
            Some(merged_save_output(ctx)),
        );
    }

    Ok(())
}

#[tracing::instrument(
    skip(ctx),
    name = "pipeline.run",
    fields(
        package_id = ctx.package_id,
        zip_size_bytes = ctx.zip_bytes.len(),
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
pub fn run(ctx: &mut PipelineContext) -> Result<(), PipelineError> {
    run_reported_stage(
        ctx,
        StepId::ExtractArchive,
        |ctx| {
            serde_json::json!({
                "filesCount": ctx.stats.files_taken_count,
            })
        },
        |ctx| stages::extract::run(ctx).map_err(PipelineError::Extract),
    )?;

    run_reported_stage(
        ctx,
        StepId::ParseInteractions,
        |ctx| {
            serde_json::json!({
                "validated": ctx.stats.parse_validated_count,
                "invalid": ctx.stats.parse_invalid_count,
            })
        },
        |ctx| stages::parse::run(ctx).map_err(PipelineError::Parse),
    )?;

    run_reported_stage(
        ctx,
        StepId::NormalizeInteractions,
        |ctx| {
            serde_json::json!({
                "kept": ctx.stats.normalize_kept_count,
                "rejected": ctx.stats.normalize_rejected_count,
            })
        },
        |ctx| stages::normalize::run(ctx).map_err(PipelineError::Normalize),
    )?;

    stages::resolve::run(ctx).map_err(PipelineError::Resolve)?;
    stages::enrich::run(ctx).map_err(PipelineError::Enrich)?;

    run_save_bundle(ctx)?;

    record_stats(ctx);

    Ok(())
}

fn record_stats(ctx: &PipelineContext) {
    let span = tracing::Span::current();
    let stats = &ctx.stats;
    span.record("files_taken_count", stats.files_taken_count as i64);
    span.record("parse_validated_count", stats.parse_validated_count as i64);
    span.record("parse_invalid_count", stats.parse_invalid_count as i64);
    span.record("normalize_kept_count", stats.normalize_kept_count as i64);
    span.record(
        "normalize_rejected_count",
        stats.normalize_rejected_count as i64,
    );
    span.record("catalogue_size", ctx.catalogue.len() as i64);
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
