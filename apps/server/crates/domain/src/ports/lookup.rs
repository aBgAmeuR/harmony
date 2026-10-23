use crate::catalog::{self, Catalog};

/// Resolve a title, then load the tracks behind the chosen ids.
pub trait Lookup {
    /// # Errors
    ///
    /// [`LookupError`] when the search cannot be completed.
    fn find(&self, artist: &str, title: &str) -> Result<Option<catalog::Id>, LookupError>;

    /// # Errors
    ///
    /// [`LookupError`] when the catalog cannot be loaded.
    fn load(&self, ids: &[catalog::Id]) -> Result<Catalog, LookupError>;
}

/// A search or a load failed. The caller picks the pipeline stage.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("{0}")]
pub struct LookupError(String);

impl LookupError {
    #[must_use]
    pub fn new(message: impl Into<String>) -> Self {
        Self(message.into())
    }
}
