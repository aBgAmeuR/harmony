use std::env;
use std::path::Path;

use aws_config::BehaviorVersion;
use aws_sdk_s3::config::Region;
use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::Client;

use super::ObjectStore;

#[derive(Debug, thiserror::Error)]
pub enum StorageConfigError {
    #[error("env var {0} not set")]
    MissingEnv(&'static str),
}

#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("failed to upload object to S3: {0}")]
    Upload(String),
}

pub struct S3ObjectStore {
    client: Client,
    bucket: String,
}

impl S3ObjectStore {
    pub async fn from_env() -> Result<Self, StorageConfigError> {
        let endpoint = env::var("S3_ENDPOINT")
            .map_err(|_| StorageConfigError::MissingEnv("S3_ENDPOINT"))?;
        let bucket =
            env::var("S3_BUCKET").map_err(|_| StorageConfigError::MissingEnv("S3_BUCKET"))?;
        let region = env::var("S3_REGION").unwrap_or_else(|_| "auto".to_string());

        let shared = aws_config::defaults(BehaviorVersion::latest())
            .endpoint_url(endpoint)
            .region(Region::new(region))
            .load()
            .await;

        let s3_config = aws_sdk_s3::config::Builder::from(&shared)
            .force_path_style(true)
            .build();

        Ok(Self {
            client: Client::from_conf(s3_config),
            bucket,
        })
    }
}

impl ObjectStore for S3ObjectStore {
    async fn put_file(&self, key: &str, path: &Path) -> Result<(), StorageError> {
        let body = ByteStream::from_path(path)
            .await
            .map_err(|err| StorageError::Upload(err.to_string()))?;

        self.client
            .put_object()
            .bucket(&self.bucket)
            .key(key)
            .content_type("application/octet-stream")
            .body(body)
            .send()
            .await
            .map_err(|err| StorageError::Upload(err.to_string()))?;

        Ok(())
    }
}
