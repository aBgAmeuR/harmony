//! Local `DuckDB` file produced by `write`.

use std::path::{Path, PathBuf};

/// Path of the database file. `Blob::put` uploads it later.
#[derive(Debug, Clone, PartialEq, Eq)]
#[must_use]
pub struct Artifact {
    path: PathBuf,
}

impl Artifact {
    pub fn new(path: PathBuf) -> Self {
        Self { path }
    }

    #[must_use]
    pub fn path(&self) -> &Path {
        &self.path
    }
}
