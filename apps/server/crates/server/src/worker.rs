use std::time::Instant;

use crate::pipeline::{self, PipelineContext, PipelineError, PipelineStats};
use harmony_db::{mark_running, set_completed, set_failed};
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

    #[error("database error")]
    Db(#[from] diesel::result::Error),

    #[error("database pool error: {0}")]
    Pool(String),

    #[error("pipeline failed")]
    Pipeline(#[from] PipelineError),

    #[error("pipeline task panicked")]
    Join(#[from] tokio::task::JoinError),
}

pub async fn run(state: AppState, mut jobs: mpsc::Receiver<Job>) {
    while let Some(job) = jobs.recv().await {
        let package_id = job.package_id;
        if let Err(err) = process(&state, job).await {
            tracing::error!(package_id, ?err, "worker failed");
        }
    }
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
        let Some((_, zip_bytes)) = state.ram_store.remove(&package_id) else {
            set_failed_best_effort(state, package_id, "worker", "zip bytes missing from ram store")
                .await;
            return Err(WorkerError::BytesMissing { package_id });
        };

        let started = Instant::now();
        let worker_span = tracing::Span::current();
        let pipeline_span = worker_span.clone();

        let zip_size_bytes = zip_bytes.len();
        worker_span.record("zip_size_bytes", zip_size_bytes as i64);

        {
            let mut conn = state
                .pool
                .get()
                .await
                .map_err(|e| WorkerError::Pool(e.to_string()))?;
            mark_running(&mut conn, package_id).await?;
        }

        let public_id_for_pipeline = public_id.clone();
        let pipeline_result = tokio::task::spawn_blocking(move || -> Result<PipelineStats, PipelineError> {
            let _guard = pipeline_span.enter();

            let mut ctx =
                PipelineContext::new(package_id, public_id_for_pipeline, zip_bytes);
            pipeline::run(&mut ctx)?;
            Ok(ctx.stats)
        })
        .await
        .map_err(WorkerError::Join)?;

        match pipeline_result {
            Ok(stats) => {
                let duration_ms = started.elapsed().as_millis() as u64;
                let data = stats.to_json(duration_ms);
                let mut conn = state
                    .pool
                    .get()
                    .await
                    .map_err(|e| WorkerError::Pool(e.to_string()))?;
                set_completed(&mut conn, package_id, data).await?;
                worker_span.record("duration_ms", duration_ms);
                tracing::info!(package_id, duration_ms, "pipeline completed");
            }
            Err(err) => {
                worker_span.record("failed_stage", err.stage());
                tracing::error!(
                    package_id,
                    stage = err.stage(),
                    ?err,
                    "pipeline failed - cancelled"
                );
                let mut conn = state
                    .pool
                    .get()
                    .await
                    .map_err(|e| WorkerError::Pool(e.to_string()))?;
                set_failed(&mut conn, package_id, err.stage(), &err.to_string()).await?;
                return Err(WorkerError::Pipeline(err));
            }
        }

        Ok(())
    }
    .instrument(span)
    .await
}

async fn set_failed_best_effort(state: &AppState, package_id: i32, stage: &str, message: &str) {
    let stage = stage.to_string();
    let message = message.to_string();

    match state.pool.get().await {
        Ok(mut conn) => {
            if let Err(err) = set_failed(&mut conn, package_id, &stage, &message).await {
                tracing::error!(package_id, ?err, "failed to mark package as failed");
            }
        }
        Err(err) => {
            tracing::error!(package_id, ?err, "failed to mark package as failed");
        }
    }
}
