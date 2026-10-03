//! One error for the HTTP verbs. `400` is a bad upload. `404` is a missing package.

use domain::source::SourceError;

/// Why a verb refused the request.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum HttpError {
    #[error("no file")]
    NoFile,
    #[error("invalid selected_files: {0}")]
    Files(String),
    #[error(transparent)]
    Zip(#[from] SourceError),
    #[error("could not allocate a package id")]
    Taken,
    #[error("not found")]
    Missing,
}

impl HttpError {
    /// `400` for a bad upload, `404` when the id or the file is absent.
    #[must_use]
    pub const fn status(&self) -> u16 {
        match self {
            Self::NoFile | Self::Files(_) | Self::Zip(_) | Self::Taken => 400,
            Self::Missing => 404,
        }
    }
}
