use std::time::Instant;

use harmony_rs::pipeline::{self, PipelineContext, PipelineError};
use harmony_rs::{mark_running, set_completed, set_failed};
use opentelemetry::Context;
use tokio::sync::mpsc;
use tracing::Instrument;
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::AppState;

pub struct Job {
    pub package_id: i32,
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

        let pool = state.db_pool.clone();
        let started = Instant::now();
        let worker_span = tracing::Span::current();

        let zip_size_bytes = zip_bytes.len();
        worker_span.record("zip_size_bytes", zip_size_bytes as i64);

        tokio::task::spawn_blocking(move || -> Result<(), WorkerError> {
            let _guard = worker_span.enter();

            let mut conn = pool
                .get()
                .map_err(|e| WorkerError::Pool(e.to_string()))?;
            mark_running(&mut conn, package_id)?;

            let mut ctx = PipelineContext::new(package_id, zip_bytes);
            let result = pipeline::run(&mut ctx);

            match &result {
                Ok(()) => {
                    let duration_ms = started.elapsed().as_millis() as u64;
                    let data = ctx.stats.to_json(duration_ms);
                    set_completed(&mut conn, package_id, data)?;
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
                    set_failed(&mut conn, package_id, err.stage(), &err.to_string())?;
                }
            }

            result.map_err(WorkerError::Pipeline)
        })
        .await??;

        Ok(())
    }
    .instrument(span)
    .await
}

async fn set_failed_best_effort(state: &AppState, package_id: i32, stage: &str, message: &str) {
    let pool = state.db_pool.clone();
    let stage = stage.to_string();
    let message = message.to_string();

    match tokio::task::spawn_blocking(move || {
        let mut conn = pool.get().map_err(|e| e.to_string())?;
        set_failed(&mut conn, package_id, &stage, &message).map_err(|e| e.to_string())
    })
    .await
    {
        Ok(Ok(_)) => {}
        Ok(Err(err)) => {
            tracing::error!(package_id, err, "failed to mark package as failed");
        }
        Err(err) => {
            tracing::error!(package_id, ?err, "failed to mark package as failed");
        }
    }
}
