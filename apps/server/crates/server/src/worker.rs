use std::sync::Arc;
use std::time::Instant;

use crate::pipeline::{self, PipelineError, PipelineRequest, Stage};
use crate::progress::{ProgressReporter, stage_to_step_id};
use opentelemetry::Context;
use opentelemetry::trace::{Status, TraceContextExt};
use tokio::sync::mpsc;
use tracing::Instrument;
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::AppState;

pub struct Job {
    pub package_id: i32,
    pub public_id: String,
    pub parent_cx: Context,
}

#[derive(Debug, thiserror::Error)]
pub enum WorkerError {
    #[error("zip bytes missing from ram store for package {package_id}")]
    BytesMissing { package_id: i32 },

    #[error("package {package_id} missing from store")]
    PackageMissing { package_id: i32 },

    #[error("pipeline failed: {0}")]
    Pipeline(#[from] PipelineError),
}

pub async fn run(state: AppState, mut jobs: mpsc::Receiver<Job>) {
    while let Some(job) = jobs.recv().await {
        let package_id = job.package_id;
        if let Err(err) = process(&state, job).await {
            tracing::error!(package_id, ?err, "worker failed");
        }
    }
}

fn empty_progress_json(total_duration_ms: u64) -> serde_json::Value {
    serde_json::json!({
        "totalDurationMs": total_duration_ms,
        "steps": [],
    })
}

async fn process(state: &AppState, job: Job) -> Result<(), WorkerError> {
    let Job {
        package_id,
        public_id,
        parent_cx,
    } = job;

    let span = tracing::info_span!(
        "worker.process_package",
        package_id = package_id,
        zip_size_bytes = tracing::field::Empty,
        duration_ms = tracing::field::Empty,
        failed_stage = tracing::field::Empty,
    );
    let upload_span = parent_cx.span().span_context().clone();
    if upload_span.is_valid() {
        span.add_link(upload_span);
    }

    async {
        let Some((_, upload)) = state.ram_store.remove(&package_id) else {
            set_failed_best_effort(
                state,
                package_id,
                "worker",
                "zip bytes missing from ram store",
            );
            return Err(WorkerError::BytesMissing { package_id });
        };

        let started = Instant::now();
        let worker_span = tracing::Span::current();

        let zip_size_bytes = upload.zip_bytes.len();
        worker_span.record("zip_size_bytes", zip_size_bytes as i64);

        state.packages.mark_running(package_id);
        let package = state
            .packages
            .get_by_public_id(&public_id)
            .map_err(|_| WorkerError::PackageMissing { package_id })?;
        let started_at = package.started_at.unwrap_or(package.created_at);

        state.progress.register(&public_id);
        let reporter = ProgressReporter::new(Arc::clone(&state.progress), public_id.clone());

        let pipeline_result = pipeline::run(PipelineRequest {
            package_id,
            public_id: public_id.clone(),
            file_name: package.file_name,
            file_size: package.file_size,
            created_at: package.created_at,
            started_at,
            zip_bytes: upload.zip_bytes,
            selected_files: upload.selected_files,
            reporter: Some(reporter.clone()),
            object_store: Arc::clone(&state.object_store),
            deezer: Arc::clone(&state.deezer),
        })
        .await;

        let duration_ms = started.elapsed().as_millis() as u64;

        match pipeline_result {
            Ok(stats) => {
                reporter.run_completed(duration_ms);
                let data = state
                    .progress
                    .finalize_json(&public_id, duration_ms)
                    .unwrap_or_else(|| empty_progress_json(duration_ms));

                state.packages.set_completed(package_id, data);
                worker_span.record("duration_ms", duration_ms);

                let deezer_failed = stats.deezer_error_count as u64
                    + stats.deezer_tracks_failed_count
                    + stats.deezer_albums_failed_count;
                tracing::info!(
                    package_id,
                    duration_ms,
                    interactions = stats.normalize_kept_count,
                    tracks_resolved = stats.deezer_resolved_count,
                    tracks_missed = stats.deezer_missed_count,
                    deezer_requests = stats.deezer_requests_count,
                    deezer_failed,
                    "pipeline completed"
                );
                if deezer_failed > 0 {
                    tracing::warn!(
                        package_id,
                        deezer_failed,
                        deezer_quota_exceeded = stats.deezer_quota_exceeded_count,
                        "some Deezer lookups failed, so this package is missing metadata; lower DEEZER_RATE_LIMIT or set DEEZER_PROXY_URLS"
                    );
                }
            }
            Err(err) => {
                let stage = err.stage();
                let message = err.to_string();
                worker_span.record("failed_stage", stage.as_str());
                worker_span.set_status(Status::error(message.clone()));
                tracing::error!(
                    package_id,
                    stage = stage.as_str(),
                    ?err,
                    "pipeline failed - cancelled"
                );

                if stage == Stage::Task {
                    reporter.fail_running_step(&message);
                } else {
                    reporter.run_failed(stage_to_step_id(stage), &message);
                }

                let data = state
                    .progress
                    .finalize_json(&public_id, duration_ms)
                    .unwrap_or_else(|| empty_progress_json(duration_ms));

                state
                    .packages
                    .set_failed_with_data(package_id, stage.as_str(), &message, data);
                state.progress.unregister(&public_id);
                return Err(WorkerError::Pipeline(err));
            }
        }

        state.progress.unregister(&public_id);

        Ok(())
    }
    .instrument(span)
    .await
}

fn set_failed_best_effort(state: &AppState, package_id: i32, stage: &str, message: &str) {
    state.packages.set_failed(package_id, stage, message);
}
