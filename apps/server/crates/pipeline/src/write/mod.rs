//! `Catalog` to a local `DuckDB` [`Artifact`](domain::artifact::Artifact).

mod insert;
mod meta;
mod schema;

use std::path::Path;

use chrono::{DateTime, Utc};
use domain::artifact::Artifact;
use domain::catalog::Catalog;
use domain::fail::Fail;
use domain::package::Package;
use domain::stage::Stage;

/// `write` could not build the database file.
#[derive(Debug, thiserror::Error)]
pub enum WriteError {
    #[error("duckdb: {0}")]
    Duck(#[from] duckdb::Error),
    #[error("value does not fit an integer column")]
    Fit,
}

impl WriteError {
    #[must_use]
    pub const fn stage(&self) -> Stage {
        match self {
            Self::Duck(_) | Self::Fit => Stage::Persist,
        }
    }
}

impl From<WriteError> for Fail {
    fn from(err: WriteError) -> Self {
        Fail::new(err.stage(), err.to_string())
    }
}

/// Create the file, apply the schema, insert rows, then write `package_meta`.
///
/// # Errors
///
/// [`WriteError::Duck`] when `DuckDB` rejects the file, the schema, or a row.
/// [`WriteError::Fit`] when a number does not fit the integer column.
/// Apply the schema and insert rows. `note` writes `package_meta` afterwards.
///
/// # Errors
///
/// [`WriteError::Duck`] when `DuckDB` rejects the file, the schema, or a row.
/// [`WriteError::Fit`] when a number does not fit the integer column.
pub fn fill(catalog: &Catalog, path: &Path) -> Result<(), WriteError> {
    let conn = duckdb::Connection::open(path)?;
    schema::apply(&conn)?;
    insert::rows(&conn, catalog)?;
    Ok(())
}

/// Write `package_meta` into an existing file.
///
/// # Errors
///
/// [`WriteError::Duck`] when `DuckDB` rejects the file or the row.
/// [`WriteError::Fit`] when a number does not fit the integer column.
pub fn note(
    path: &Path,
    package: &Package,
    started: DateTime<Utc>,
    duration_ms: u64,
    steps: &str,
) -> Result<(), WriteError> {
    let conn = duckdb::Connection::open(path)?;
    meta::row(&conn, package, started, duration_ms, steps)
}

/// Create the file, apply the schema, insert rows, then write `package_meta`.
///
/// # Errors
///
/// [`WriteError::Duck`] when `DuckDB` rejects the file, the schema, or a row.
/// [`WriteError::Fit`] when a number does not fit the integer column.
pub fn run(
    catalog: &Catalog,
    package: &Package,
    started: DateTime<Utc>,
    duration_ms: u64,
    steps: &str,
    path: &Path,
) -> Result<Artifact, WriteError> {
    let _entered = tracing::info_span!("persist_interactions").entered();
    fill(catalog, path)?;
    note(path, package, started, duration_ms, steps)?;
    Ok(Artifact::new(path.to_path_buf()))
}
