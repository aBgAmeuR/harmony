//! Directory [`Blob`](domain::ports::Blob). Files live at `harmony/{id}.duckdb`.

use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};

use domain::artifact::Artifact;
use domain::package;
use domain::ports::{Blob, GetError, PutError};

const OBJECTS: &str = "harmony";
const STAGING: &str = ".staging";

static PART: AtomicU64 = AtomicU64::new(0);

/// Local object store rooted at `DATA_DIR`.
#[derive(Debug)]
#[must_use]
pub struct Fs {
    root: PathBuf,
}

impl Fs {
    /// Create `harmony/` and check that the directory accepts a write.
    ///
    /// # Errors
    ///
    /// [`PutError`] when the directory cannot be created or written.
    pub fn open(root: impl Into<PathBuf>) -> Result<Self, PutError> {
        let root = root.into();
        std::fs::create_dir_all(root.join(OBJECTS))
            .map_err(|err| PutError::new(format!("failed to create {}: {err}", root.display())))?;
        let staging = root.join(STAGING);
        std::fs::create_dir_all(&staging).map_err(|err| {
            PutError::new(format!("failed to create {}: {err}", staging.display()))
        })?;
        let probe = staging.join(".write-test");
        std::fs::write(&probe, b"")
            .map_err(|err| PutError::new(format!("failed to write {}: {err}", probe.display())))?;
        std::fs::remove_file(&probe)
            .map_err(|err| PutError::new(format!("failed to remove {}: {err}", probe.display())))?;
        Ok(Self { root })
    }

    fn object(&self, id: package::Id) -> PathBuf {
        self.root.join(OBJECTS).join(format!("{id}.duckdb"))
    }
}

impl Blob for Fs {
    fn put(&self, id: package::Id, artifact: &Artifact) -> Result<(), PutError> {
        let target = self.object(id);
        let staged = self.root.join(STAGING).join(format!(
            "{:016x}.part",
            PART.fetch_add(1, Ordering::Relaxed)
        ));
        if let Err(err) = std::fs::copy(artifact.path(), &staged) {
            let _ = std::fs::remove_file(&staged);
            return Err(PutError::new(format!(
                "failed to stage {}: {err}",
                staged.display()
            )));
        }
        if let Err(err) = std::fs::rename(&staged, &target) {
            let _ = std::fs::remove_file(&staged);
            return Err(PutError::new(format!(
                "failed to publish {}: {err}",
                target.display()
            )));
        }
        Ok(())
    }

    fn get(&self, id: package::Id) -> Result<Artifact, GetError> {
        let path = self.object(id);
        if path.is_file() {
            Ok(Artifact::new(path))
        } else {
            Err(GetError::new(format!("missing {id}")))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::Fs;
    use domain::artifact::Artifact;
    use domain::package::Id;
    use domain::ports::{Blob, GetError, PutError};

    #[derive(Debug)]
    #[allow(
        dead_code,
        reason = "the harness prints this only when a fixture fails"
    )]
    enum Fixture {
        Io(std::io::Error),
        Id(domain::package::IdError),
        Put(PutError),
        Get(GetError),
        Missing,
    }

    impl From<std::io::Error> for Fixture {
        fn from(error: std::io::Error) -> Self {
            Self::Io(error)
        }
    }

    impl From<domain::package::IdError> for Fixture {
        fn from(error: domain::package::IdError) -> Self {
            Self::Id(error)
        }
    }

    impl From<PutError> for Fixture {
        fn from(error: PutError) -> Self {
            Self::Put(error)
        }
    }

    impl From<GetError> for Fixture {
        fn from(error: GetError) -> Self {
            Self::Get(error)
        }
    }

    #[test]
    fn put_then_get_returns_the_same_bytes() -> Result<(), Fixture> {
        let root = tempfile::TempDir::new()?;
        let store = Fs::open(root.path())?;
        let source = root.path().join("package.duckdb");
        std::fs::write(&source, b"duckdb bytes")?;
        let id = Id::parse("Ab3xYz")?;

        store.put(id, &Artifact::new(source))?;
        let loaded = store.get(id)?;
        assert_eq!(std::fs::read(loaded.path())?, b"duckdb bytes");
        let staged = std::fs::read_dir(root.path().join(".staging"))?.count();
        assert_eq!(staged, 0);
        Ok(())
    }

    #[test]
    fn get_reports_a_missing_file() -> Result<(), Fixture> {
        let root = tempfile::TempDir::new()?;
        let store = Fs::open(root.path())?;
        let id = Id::parse("Ab3xYz")?;

        assert!(store.get(id).is_err());
        Ok(())
    }

    #[test]
    fn open_rejects_a_file_as_root() -> Result<(), Fixture> {
        let root = tempfile::TempDir::new()?;
        let file = root.path().join("not-a-dir");
        std::fs::write(&file, b"")?;

        assert!(Fs::open(file.join("child")).is_err());
        Ok(())
    }
}
