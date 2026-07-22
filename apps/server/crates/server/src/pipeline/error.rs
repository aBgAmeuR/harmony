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
    #[error("missing required Deezer configuration: {0}")]
    MissingConfig(String),

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

    #[error("no tokio runtime available for object storage upload")]
    RuntimeUnavailable,
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
}

impl PipelineError {
    pub fn stage(&self) -> &'static str {
        match self {
            Self::Extract(_) => "extract",
            Self::Parse(_) => "parse",
            Self::Normalize(_) => "normalize",
            Self::Resolve(_) => "resolve",
            Self::Enrich(_) => "enrich",
            Self::Aggregate(_) => "aggregate",
            Self::Verify(_) => "verify",
            Self::Persist(_) => "persist",
        }
    }
}
