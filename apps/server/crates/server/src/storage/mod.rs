mod local;
mod s3;

pub use local::LocalObjectStore;
pub use s3::{S3ObjectStore, StorageError};

use std::path::Path;

use crate::config::StorageConfig;

/// Write-only object storage used to persist package DuckDB artifacts.
pub trait ObjectStore: Send + Sync {
    fn put_file(
        &self,
        key: &str,
        path: &Path,
    ) -> impl std::future::Future<Output = Result<(), StorageError>> + Send;
}

/// Object key of a package DuckDB artifact.
pub fn package_object_key(public_id: &str) -> String {
    format!("harmony/{public_id}.duckdb")
}

/// Recreate the artifact scratch directory empty. Anything left in it belongs
/// to an import that a previous process never finished.
pub fn reset_temp_dir(dir: &Path) -> Result<(), StorageError> {
    let data_dir_error = |err: std::io::Error| StorageError::DataDir {
        path: dir.to_path_buf(),
        reason: err.to_string(),
    };
    match std::fs::remove_dir_all(dir) {
        Ok(()) => {}
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => {}
        Err(err) => return Err(data_dir_error(err)),
    }
    std::fs::create_dir_all(dir).map_err(data_dir_error)
}

/// Storage backend selected by the configuration.
pub enum Storage {
    Local(LocalObjectStore),
    S3 {
        store: Box<S3ObjectStore>,
        public_url: Option<reqwest::Url>,
    },
}

impl Storage {
    pub fn from_config(config: &StorageConfig) -> Result<Self, StorageError> {
        match config {
            StorageConfig::Local { data_dir } => {
                Ok(Self::Local(LocalObjectStore::new(data_dir.clone())?))
            }
            StorageConfig::S3(s3) => Ok(Self::S3 {
                store: Box::new(S3ObjectStore::new(
                    s3.endpoint.clone(),
                    s3.bucket.clone(),
                    s3.region.clone(),
                    s3.access_key_id.clone(),
                    s3.secret_access_key.clone(),
                )),
                public_url: s3.public_url.clone(),
            }),
        }
    }

    pub fn kind(&self) -> &'static str {
        match self {
            Self::Local(_) => "local",
            Self::S3 { .. } => "s3",
        }
    }
}

impl ObjectStore for Storage {
    #[tracing::instrument(
        name = "storage.put_file",
        skip_all,
        fields(storage.backend = self.kind(), object.key = key),
    )]
    async fn put_file(&self, key: &str, path: &Path) -> Result<(), StorageError> {
        match self {
            Self::Local(store) => store.put_file(key, path).await,
            Self::S3 { store, .. } => store.put_file(key, path).await,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn reset_temp_dir_creates_a_missing_directory() {
        let root = TempDir::new().unwrap();
        let dir = root.path().join(".tmp");

        reset_temp_dir(&dir).unwrap();

        assert!(dir.is_dir());
    }

    #[test]
    fn reset_temp_dir_removes_leftovers() {
        let root = TempDir::new().unwrap();
        let dir = root.path().join(".tmp");
        std::fs::create_dir_all(dir.join(".tmpabc")).unwrap();
        std::fs::write(dir.join(".tmpabc").join("package.duckdb"), b"stale").unwrap();

        reset_temp_dir(&dir).unwrap();

        assert!(dir.is_dir());
        assert_eq!(std::fs::read_dir(&dir).unwrap().count(), 0);
    }
}
