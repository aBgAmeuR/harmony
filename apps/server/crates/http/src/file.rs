//! `GET /files/{id}.duckdb`.

use crate::error::HttpError;
use domain::artifact::Artifact;
use domain::package::IdError;
use domain::ports::Blob;

/// The file itself, or a redirect when a public URL is configured.
#[derive(Debug, Clone, PartialEq, Eq)]
#[must_use]
pub enum Body {
    File(Artifact),
    Redirect(String),
}

/// Reserved public package. It is shorter than a generated id, and the file lives on the bucket.
const DEMO: &str = "demo";

/// Sends the stored file, or redirects to `{public_url}/{id}.duckdb` when that URL is set.
///
/// `demo.duckdb` is the same redirect. Generated ids stay six alphanumeric characters.
///
/// # Errors
///
/// [`HttpError::Missing`] when the name is not `{id}.duckdb` or `demo.duckdb`, or the file is absent.
pub fn file(blob: &impl Blob, name: &str, public_url: Option<&str>) -> Result<Body, HttpError> {
    let Some(stem) = name.strip_suffix(".duckdb") else {
        return Err(HttpError::Missing);
    };
    if stem == DEMO {
        let Some(root) = public_root(public_url) else {
            return Err(HttpError::Missing);
        };
        return Ok(Body::Redirect(format!("{root}/{DEMO}.duckdb")));
    }
    let id = match domain::package::Id::parse(stem) {
        Ok(id) => id,
        Err(IdError::Length | IdError::Alphabet) => return Err(HttpError::Missing),
    };
    if let Some(root) = public_root(public_url) {
        return Ok(Body::Redirect(format!("{root}/{}.duckdb", id.as_str())));
    }
    match blob.get(id) {
        Ok(artifact) => Ok(Body::File(artifact)),
        Err(_err) => Err(HttpError::Missing),
    }
}

fn public_root(public_url: Option<&str>) -> Option<&str> {
    let base = public_url?.trim();
    if base.is_empty() {
        return None;
    }
    Some(base.trim_end_matches('/'))
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use super::{Body, file};
    use crate::error::HttpError;
    use domain::artifact::Artifact;
    use domain::package::Id;
    use domain::ports::{Blob, GetError, PutError};

    struct Shelf {
        path: PathBuf,
        miss: bool,
    }

    impl Blob for Shelf {
        fn put(&self, _id: Id, _artifact: &Artifact) -> Result<(), PutError> {
            let _ = &self.path;
            Ok(())
        }

        fn get(&self, _id: Id) -> Result<Artifact, GetError> {
            if self.miss {
                return Err(GetError::new("missing"));
            }
            Ok(Artifact::new(self.path.clone()))
        }
    }

    #[test]
    fn file_redirects_the_demo_package() {
        let shelf = Shelf {
            path: PathBuf::from("unused"),
            miss: true,
        };

        let body = file(&shelf, "demo.duckdb", Some("https://cdn.example/harmony/"));

        assert_eq!(
            body,
            Ok(Body::Redirect(
                "https://cdn.example/harmony/demo.duckdb".to_owned()
            ))
        );
    }

    #[test]
    fn file_misses_the_demo_package_without_a_public_url() {
        let shelf = Shelf {
            path: PathBuf::from("unused"),
            miss: false,
        };

        assert!(matches!(
            file(&shelf, "demo.duckdb", None),
            Err(HttpError::Missing)
        ));
    }

    #[test]
    fn file_redirects_without_reading_the_blob() {
        let shelf = Shelf {
            path: PathBuf::from("unused"),
            miss: true,
        };

        let body = file(
            &shelf,
            "Ab3xYz.duckdb",
            Some("https://cdn.example/harmony/"),
        );

        assert_eq!(
            body,
            Ok(Body::Redirect(
                "https://cdn.example/harmony/Ab3xYz.duckdb".to_owned()
            ))
        );
    }

    #[test]
    fn file_returns_the_stored_artifact() -> Result<(), HttpError> {
        let shelf = Shelf {
            path: PathBuf::from("harmony/Ab3xYz.duckdb"),
            miss: false,
        };
        let Body::File(artifact) = file(&shelf, "Ab3xYz.duckdb", None)? else {
            return Err(HttpError::Missing);
        };

        assert_eq!(artifact.path(), PathBuf::from("harmony/Ab3xYz.duckdb"));
        Ok(())
    }

    #[test]
    fn file_misses_a_bad_name_or_an_absent_file() {
        let shelf = Shelf {
            path: PathBuf::from("harmony/Ab3xYz.duckdb"),
            miss: true,
        };

        assert!(matches!(
            file(&shelf, "Ab3xYz.duckdb", None),
            Err(HttpError::Missing)
        ));
        assert!(matches!(
            file(&shelf, "nope.duckdb", None),
            Err(HttpError::Missing)
        ));
        assert!(matches!(
            file(&shelf, "Ab3xYz", None),
            Err(HttpError::Missing)
        ));
        assert!(matches!(
            file(&shelf, "Ab3xYz.duckdb", Some("  ")),
            Err(HttpError::Missing)
        ));
    }
}
