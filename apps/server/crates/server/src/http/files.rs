use std::path::PathBuf;
use std::str::FromStr;

use axum::{
    body::Body,
    extract::{Path, Request, State},
    response::{IntoResponse, Redirect, Response},
};
use tower_http::services::ServeFile;

use crate::AppState;
use crate::error::{ApiError, PackageId};
use crate::storage::{Storage, package_object_key};

#[derive(Debug, PartialEq, Eq)]
pub enum FileTarget {
    Local(PathBuf),
    Redirect(String),
    NotFound,
}

/// Map a requested `<public_id>.duckdb` file name to where it can be read.
pub fn package_file_target(storage: &Storage, file_name: &str) -> FileTarget {
    let Some(stem) = file_name.strip_suffix(".duckdb") else {
        return FileTarget::NotFound;
    };
    let Ok(package_id) = PackageId::from_str(stem) else {
        return FileTarget::NotFound;
    };

    match storage {
        Storage::Local(store) => {
            match store.object_path(&package_object_key(package_id.as_str())) {
                Ok(path) => FileTarget::Local(path),
                Err(_) => FileTarget::NotFound,
            }
        }
        Storage::S3 {
            public_url: Some(public_url),
            ..
        } => FileTarget::Redirect(format!(
            "{}/{}.duckdb",
            public_url.as_str().trim_end_matches('/'),
            package_id.as_str()
        )),
        Storage::S3 {
            public_url: None, ..
        } => FileTarget::NotFound,
    }
}

pub async fn get_package_file(
    State(state): State<AppState>,
    Path(file_name): Path<String>,
    request: Request,
) -> Response {
    match package_file_target(&state.object_store, &file_name) {
        FileTarget::Local(path) => match ServeFile::new(path).try_call(request).await {
            Ok(response) => response.map(Body::new).into_response(),
            Err(err) => {
                ApiError::internal(format!("failed to read package file: {err}")).into_response()
            }
        },
        FileTarget::Redirect(url) => Redirect::temporary(&url).into_response(),
        FileTarget::NotFound => ApiError::not_found("package file not found").into_response(),
    }
}

#[cfg(test)]
mod tests {
    use tempfile::TempDir;

    use super::*;
    use crate::config::{S3Config, StorageConfig};

    fn s3_storage(public_url: Option<&str>) -> Storage {
        Storage::from_config(&StorageConfig::S3(Box::new(S3Config {
            endpoint: reqwest::Url::parse("https://s3.example").unwrap(),
            bucket: "harmony".to_string(),
            region: "auto".to_string(),
            access_key_id: "access".to_string(),
            secret_access_key: "secret".to_string(),
            public_url: public_url.map(|url| reqwest::Url::parse(url).unwrap()),
        })))
        .unwrap()
    }

    #[test]
    fn local_storage_serves_valid_names_from_disk() {
        let root = TempDir::new().unwrap();
        let storage = Storage::from_config(&StorageConfig::Local {
            data_dir: root.path().to_path_buf(),
        })
        .unwrap();

        assert_eq!(
            package_file_target(&storage, "abc123.duckdb"),
            FileTarget::Local(root.path().join("harmony").join("abc123.duckdb"))
        );
        for name in [
            "abc.txt",
            "abc",
            "a b.duckdb",
            "../x.duckdb",
            ".duckdb",
            "a.b.duckdb",
        ] {
            assert_eq!(
                package_file_target(&storage, name),
                FileTarget::NotFound,
                "{name}"
            );
        }
    }

    #[test]
    fn s3_with_public_url_redirects_without_double_slash() {
        let storage = s3_storage(Some("https://cdn.example/harmony/"));
        assert_eq!(
            package_file_target(&storage, "abc123.duckdb"),
            FileTarget::Redirect("https://cdn.example/harmony/abc123.duckdb".to_string())
        );
        assert_eq!(
            package_file_target(&storage, "../x.duckdb"),
            FileTarget::NotFound
        );
    }

    #[test]
    fn s3_without_public_url_is_not_found() {
        let storage = s3_storage(None);
        assert_eq!(
            package_file_target(&storage, "abc123.duckdb"),
            FileTarget::NotFound
        );
    }
}
