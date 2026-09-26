use std::path::{Path, PathBuf};

use super::{ObjectStore, StorageError};

const OBJECTS_DIR: &str = "harmony";
const STAGING_DIR: &str = ".staging";
const WRITE_TEST_FILE: &str = ".write-test";

/// Object storage backed by a directory on disk (`DATA_DIR`).
pub struct LocalObjectStore {
    root: PathBuf,
}

impl LocalObjectStore {
    /// Create the storage layout and check that the directory is writable.
    pub fn new(root: PathBuf) -> Result<Self, StorageError> {
        let data_dir_error = |err: std::io::Error| StorageError::DataDir {
            path: root.clone(),
            reason: err.to_string(),
        };

        std::fs::create_dir_all(root.join(OBJECTS_DIR)).map_err(data_dir_error)?;
        let staging = root.join(STAGING_DIR);
        std::fs::create_dir_all(&staging).map_err(data_dir_error)?;
        let write_test = staging.join(WRITE_TEST_FILE);
        std::fs::write(&write_test, b"").map_err(data_dir_error)?;
        std::fs::remove_file(&write_test).map_err(data_dir_error)?;

        Ok(Self { root })
    }

    /// Resolve an object key to a path under the root, rejecting traversal.
    pub fn object_path(&self, key: &str) -> Result<PathBuf, StorageError> {
        let mut path = self.root.clone();
        for segment in key.split('/') {
            if !is_safe_segment(segment) {
                return Err(StorageError::Local(format!("invalid object key '{key}'")));
            }
            path.push(segment);
        }
        Ok(path)
    }
}

fn is_safe_segment(segment: &str) -> bool {
    !segment.is_empty()
        && segment != "."
        && segment != ".."
        && segment
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-'))
}

impl ObjectStore for LocalObjectStore {
    async fn put_file(&self, key: &str, path: &Path) -> Result<(), StorageError> {
        let target = self.object_path(key)?;
        let staged = self
            .root
            .join(STAGING_DIR)
            .join(format!("{:016x}.part", rand::random::<u64>()));

        if let Err(err) = tokio::fs::copy(path, &staged).await {
            let _ = tokio::fs::remove_file(&staged).await;
            return Err(StorageError::Local(format!(
                "failed to stage '{}': {err}",
                staged.display()
            )));
        }

        let published = async {
            if let Some(parent) = target.parent() {
                tokio::fs::create_dir_all(parent).await?;
            }
            tokio::fs::rename(&staged, &target).await
        }
        .await;

        if let Err(err) = published {
            let _ = tokio::fs::remove_file(&staged).await;
            return Err(StorageError::Local(format!(
                "failed to move object to '{}': {err}",
                target.display()
            )));
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use tempfile::TempDir;

    use super::*;

    #[tokio::test]
    async fn put_file_writes_object_and_leaves_staging_empty() {
        let root = TempDir::new().unwrap();
        let store = LocalObjectStore::new(root.path().to_path_buf()).unwrap();

        let source_dir = TempDir::new().unwrap();
        let source = source_dir.path().join("package.duckdb");
        std::fs::write(&source, b"duckdb bytes").unwrap();

        store.put_file("harmony/abc.duckdb", &source).await.unwrap();

        let written = std::fs::read(root.path().join("harmony/abc.duckdb")).unwrap();
        assert_eq!(written, b"duckdb bytes");
        let staged = std::fs::read_dir(root.path().join(STAGING_DIR))
            .unwrap()
            .count();
        assert_eq!(staged, 0);
    }

    #[tokio::test]
    async fn put_file_rejects_invalid_key() {
        let root = TempDir::new().unwrap();
        let store = LocalObjectStore::new(root.path().to_path_buf()).unwrap();
        let source = root.path().join("source");
        std::fs::write(&source, b"x").unwrap();

        let result = store.put_file("../escape", &source).await;
        assert!(matches!(result, Err(StorageError::Local(_))));
    }

    #[test]
    fn object_path_rejects_traversal_and_empty_keys() {
        let root = TempDir::new().unwrap();
        let store = LocalObjectStore::new(root.path().to_path_buf()).unwrap();

        for key in [
            "../x",
            "harmony/../x",
            "",
            "harmony//x",
            "./x",
            "harmony/a b",
            "/etc/passwd",
        ] {
            assert!(store.object_path(key).is_err(), "{key}");
        }
        assert_eq!(
            store.object_path("harmony/abc.duckdb").unwrap(),
            root.path().join("harmony").join("abc.duckdb")
        );
    }

    #[test]
    fn new_reports_data_dir_under_a_file() {
        let root = TempDir::new().unwrap();
        let file = root.path().join("file");
        std::fs::write(&file, b"").unwrap();

        let result = LocalObjectStore::new(file.join("sub-dir"));
        assert!(matches!(result, Err(StorageError::DataDir { .. })));
    }
}
