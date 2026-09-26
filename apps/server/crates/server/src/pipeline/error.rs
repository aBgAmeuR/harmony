use crate::progress::StepId;

/// Pipeline stage identity. Maps 1:1 to [`PipelineError`] variants.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Stage {
    Extract,
    Parse,
    Normalize,
    Resolve,
    Enrich,
    Aggregate,
    Verify,
    Persist,
    Task,
}

impl Stage {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Extract => "extract",
            Self::Parse => "parse",
            Self::Normalize => "normalize",
            Self::Resolve => "resolve",
            Self::Enrich => "enrich",
            Self::Aggregate => "aggregate",
            Self::Verify => "verify",
            Self::Persist => "persist",
            Self::Task => "task",
        }
    }

    /// Maps a domain stage onto the SSE-facing step id (aggregate/verify fold into persist).
    pub fn to_step_id(self) -> StepId {
        match self {
            Self::Extract => StepId::ExtractArchive,
            Self::Parse => StepId::ParseInteractions,
            Self::Normalize => StepId::NormalizeInteractions,
            Self::Resolve => StepId::ResolveTracks,
            Self::Enrich => StepId::EnrichTracks,
            Self::Aggregate | Self::Verify | Self::Persist | Self::Task => {
                StepId::PersistInteractions
            }
        }
    }
}

#[derive(Debug, thiserror::Error)]
pub enum ExtractError {
    #[error("invalid zip archive: {0}")]
    InvalidZip(#[from] zip::result::ZipError),

    #[error("no streaming history files found in archive")]
    NoMatchingFiles,

    #[error("failed to read archive entry '{name}'")]
    ReadEntry {
        name: String,
        #[source]
        source: zip::result::ZipError,
    },
}

#[derive(Debug, thiserror::Error)]
pub enum ParseError {
    #[error("file '{name}' is not valid JSON: {source}")]
    InvalidJson {
        name: String,
        #[source]
        source: serde_json::Error,
    },

    #[error("file '{name}' parsed to an empty array")]
    EmptyFile { name: String },
}

#[derive(Debug, thiserror::Error)]
pub enum NormalizeError {
    #[error("no interactions kept after filtering (all rejected or empty input)")]
    NoInteractionsKept,
}

#[derive(Debug, thiserror::Error)]
pub enum ResolveError {
    #[error("missing required Deezer configuration: {0}")]
    MissingConfig(String),
}

#[derive(Debug, thiserror::Error)]
pub enum EnrichError {
    #[error("failed to build HTTP client: {0}")]
    HttpClient(#[from] reqwest::Error),
}

#[derive(Debug, thiserror::Error)]
pub enum AggregateError {}

#[derive(Debug, thiserror::Error)]
pub enum VerifyError {}

#[derive(Debug, thiserror::Error)]
pub enum PersistError {
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    #[error("duckdb error: {0}")]
    DuckDb(#[from] duckdb::Error),

    #[error("object storage error: {0}")]
    Storage(#[from] crate::storage::StorageError),
}

#[derive(Debug, thiserror::Error)]
pub enum PipelineError {
    #[error("extract stage failed: {0}")]
    Extract(#[from] ExtractError),

    #[error("parse stage failed: {0}")]
    Parse(#[from] ParseError),

    #[error("normalize stage failed: {0}")]
    Normalize(#[from] NormalizeError),

    #[error("resolve stage failed: {0}")]
    Resolve(#[from] ResolveError),

    #[error("enrich stage failed: {0}")]
    Enrich(#[from] EnrichError),

    #[error("aggregate stage failed: {0}")]
    Aggregate(#[from] AggregateError),

    #[error("verify stage failed: {0}")]
    Verify(#[from] VerifyError),

    #[error("persist stage failed: {0}")]
    Persist(#[from] PersistError),

    #[error(transparent)]
    Join(#[from] TaskJoinError),
}

#[derive(Debug)]
pub struct TaskJoinError(tokio::task::JoinError);

impl std::fmt::Display for TaskJoinError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if self.0.is_cancelled() {
            formatter.write_str("pipeline task was cancelled")
        } else {
            formatter.write_str("pipeline task panicked")
        }
    }
}

impl std::error::Error for TaskJoinError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        Some(&self.0)
    }
}

impl From<tokio::task::JoinError> for PipelineError {
    fn from(err: tokio::task::JoinError) -> Self {
        Self::Join(TaskJoinError(err))
    }
}

impl PipelineError {
    pub fn stage(&self) -> Stage {
        match self {
            Self::Extract(_) => Stage::Extract,
            Self::Parse(_) => Stage::Parse,
            Self::Normalize(_) => Stage::Normalize,
            Self::Resolve(_) => Stage::Resolve,
            Self::Enrich(_) => Stage::Enrich,
            Self::Aggregate(_) => Stage::Aggregate,
            Self::Verify(_) => Stage::Verify,
            Self::Persist(_) => Stage::Persist,
            Self::Join(_) => Stage::Task,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn stage_to_step_id_folds_save_bundle() {
        assert_eq!(Stage::Aggregate.to_step_id(), StepId::PersistInteractions);
        assert_eq!(Stage::Verify.to_step_id(), StepId::PersistInteractions);
        assert_eq!(Stage::Persist.to_step_id(), StepId::PersistInteractions);
        assert_eq!(Stage::Resolve.to_step_id(), StepId::ResolveTracks);
    }

    #[test]
    fn pipeline_error_maps_to_stage() {
        let err = PipelineError::Normalize(NormalizeError::NoInteractionsKept);
        assert_eq!(err.stage(), Stage::Normalize);
        assert_eq!(err.stage().as_str(), "normalize");
        assert_eq!(
            err.to_string(),
            "normalize stage failed: no interactions kept after filtering (all rejected or empty input)"
        );
    }

    #[test]
    fn task_stage_uses_a_known_sse_step() {
        assert_eq!(Stage::Task.as_str(), "task");
        assert_eq!(Stage::Task.to_step_id(), StepId::PersistInteractions);
    }

    #[tokio::test]
    async fn join_panic_is_task_stage() {
        let join = tokio::spawn(async { panic!("boom") }).await.unwrap_err();
        let err = PipelineError::from(join);
        assert_eq!(err.stage(), Stage::Task);
        let message = err.to_string();
        assert!(message.contains("panicked"), "{message}");
        assert!(!message.contains("extract"), "{message}");
    }

    #[tokio::test]
    async fn join_cancel_is_task_stage() {
        let handle = tokio::spawn(std::future::pending::<()>());
        handle.abort();
        let join = handle.await.unwrap_err();
        let err = PipelineError::from(join);
        assert_eq!(err.stage(), Stage::Task);
        let message = err.to_string();
        assert!(message.contains("cancelled"), "{message}");
    }
}
