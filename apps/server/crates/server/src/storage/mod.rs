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
    async fn put_file(&self, key: &str, path: &Path) -> Result<(), StorageError> {
        match self {
            Self::Local(store) => store.put_file(key, path).await,
            Self::S3 { store, .. } => store.put_file(key, path).await,
        }
    }
}
