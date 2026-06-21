use thiserror::Error;

/// Application-level errors using thiserror for custom types.
/// Use `anyhow::Result` in application code for ad-hoc errors,
/// and `AppError` for well-defined domain errors.
#[derive(Debug, Error)]
#[allow(dead_code)]
pub enum AppError {
    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Database error: {0}")]
    Database(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Internal error: {0}")]
    Internal(#[from] anyhow::Error),
}
