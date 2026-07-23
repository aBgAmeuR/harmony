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
            Self::Aggregate | Self::Verify | Self::Persist => StepId::PersistInteractions,
        }
    }
}

#[derive(Debug, thiserror::Error)]
pub enum ExtractError {
    #[error("invalid zip archive")]
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
    #[error("file '{name}' is not valid JSON")]
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

    #[error("failed to build HTTP client")]
    HttpClient(#[from] reqwest::Error),
}

#[derive(Debug, thiserror::Error)]
pub enum EnrichError {
    #[error("failed to build HTTP client")]
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

    #[error("polars error: {0}")]
    Polars(#[from] polars::error::PolarsError),

    #[error("duckdb error: {0}")]
    DuckDb(#[from] duckdb::Error),

    #[error("object storage error: {0}")]
    Storage(#[from] crate::storage::StorageError),
}

#[derive(Debug, thiserror::Error)]
pub enum PipelineError {
    #[error("extract stage failed")]
    Extract(#[from] ExtractError),

    #[error("parse stage failed")]
    Parse(#[from] ParseError),

    #[error("normalize stage failed")]
    Normalize(#[from] NormalizeError),

    #[error("resolve stage failed")]
    Resolve(#[from] ResolveError),

    #[error("enrich stage failed")]
    Enrich(#[from] EnrichError),

    #[error("aggregate stage failed")]
    Aggregate(#[from] AggregateError),

    #[error("verify stage failed")]
    Verify(#[from] VerifyError),

    #[error("persist stage failed")]
    Persist(#[from] PersistError),

    #[error("pipeline task panicked")]
    Join(#[from] tokio::task::JoinError),
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
            Self::Join(_) => Stage::Extract,
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
    }
}
