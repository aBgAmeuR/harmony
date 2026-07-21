mod s3;

pub use s3::{S3ObjectStore, StorageError};

use std::path::Path;

/// Write-only object storage used to persist package DuckDB artifacts.
pub trait ObjectStore: Send + Sync {
    fn put_file(
        &self,
        key: &str,
        path: &Path,
    ) -> impl std::future::Future<Output = Result<(), StorageError>> + Send;
}
