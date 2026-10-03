//! Deposit and read an [`Artifact`](crate::artifact::Artifact).

use crate::artifact::Artifact;
use crate::fail::Fail;
use crate::package;
use crate::stage::Stage;

/// `put` stores the file. `get` returns the stored path, or [`GetError`] when it is absent.
pub trait Blob {
    /// # Errors
    ///
    /// [`PutError`] when the file cannot be stored.
    fn put(&self, id: package::Id, artifact: &Artifact) -> Result<(), PutError>;

    /// # Errors
    ///
    /// [`GetError`] when the file is absent or cannot be read.
    fn get(&self, id: package::Id) -> Result<Artifact, GetError>;
}

/// `Blob::put` failed. This becomes a [`Fail`] at [`Stage::Persist`].
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("{0}")]
pub struct PutError(String);

impl PutError {
    #[must_use]
    pub fn new(message: impl Into<String>) -> Self {
        Self(message.into())
    }
}

impl From<PutError> for Fail {
    fn from(err: PutError) -> Self {
        Fail::new(Stage::Persist, err.to_string())
    }
}

/// `Blob::get` failed. Stays out of the pipeline and becomes a 404.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("{0}")]
pub struct GetError(String);

impl GetError {
    #[must_use]
    pub fn new(message: impl Into<String>) -> Self {
        Self(message.into())
    }
}

#[cfg(test)]
mod tests {
    use super::PutError;
    use crate::fail::Fail;
    use crate::stage::Stage;

    #[test]
    fn put_error_lands_on_persist() {
        let fail = Fail::from(PutError::new("disk full"));

        assert_eq!(fail.stage(), Stage::Persist);
        assert_eq!(fail.message(), "disk full");
    }
}
