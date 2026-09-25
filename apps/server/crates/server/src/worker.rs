use std::sync::Arc;
use std::time::Instant;

use crate::pipeline::{self, PipelineError, PipelineRequest};
use crate::progress::{ProgressReporter, stage_to_step_id};
use opentelemetry::Context;
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

    #[error("pipeline failed")]
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
    if let Err(err) = span.set_parent(parent_cx) {
        tracing::warn!(?err, "failed to attach upload trace as worker span parent");
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
        })
        .await;

        let duration_ms = started.elapsed().as_millis() as u64;

        match pipeline_result {
            Ok(_stats) => {
                reporter.run_completed(duration_ms);
                let data = state
                    .progress
                    .finalize_json(&public_id, duration_ms)
                    .unwrap_or_else(|| empty_progress_json(duration_ms));

                state.packages.set_completed(package_id, data);
                worker_span.record("duration_ms", duration_ms);
                tracing::info!(package_id, duration_ms, "pipeline completed");
            }
            Err(err) => {
                let stage = err.stage();
                worker_span.record("failed_stage", stage.as_str());
                tracing::error!(
                    package_id,
                    stage = stage.as_str(),
                    ?err,
                    "pipeline failed - cancelled"
                );

                let step_id = stage_to_step_id(stage);
                reporter.run_failed(step_id, &err.to_string());

                let data = state
                    .progress
                    .finalize_json(&public_id, duration_ms)
                    .unwrap_or_else(|| empty_progress_json(duration_ms));

                state.packages.set_failed_with_data(
                    package_id,
                    stage.as_str(),
                    &err.to_string(),
                    data,
                );
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
