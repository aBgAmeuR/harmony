//! `POST /api/v1/packages`.

use domain::observe::Progress;
use domain::package;
use domain::source::{Empty, NonEmpty, Selection, Source};

use crate::error::HttpError;

/// Extra room for the multipart envelope around the ZIP.
const OVERHEAD: u64 = 1024 * 1024;

const ATTEMPTS: u8 = 8;

/// Parsed upload. `files` is the raw `selected_files` field, absent when the user kept everything.
pub struct Upload {
    name: String,
    bytes: Vec<u8>,
    files: Option<String>,
}

impl Upload {
    #[must_use]
    pub fn new(name: String, bytes: Vec<u8>, files: Option<String>) -> Self {
        Self { name, bytes, files }
    }
}

/// Accepted job. The snapshot is already `idle` on `Progress`.
#[derive(Debug)]
#[must_use]
pub struct Opened {
    id: package::Id,
    source: Source,
}

impl Opened {
    #[must_use]
    pub const fn id(&self) -> package::Id {
        self.id
    }

    #[must_use]
    pub fn source(&self) -> &Source {
        &self.source
    }

    /// `{ "public_id", "status": "pending" }`.
    #[must_use]
    pub fn accepted(&self) -> Accepted<'_> {
        Accepted {
            public_id: self.id.as_str(),
            status: package::State::Queued.as_str(),
        }
    }

    /// `POST /api/v1/packages` answers `202`.
    #[must_use]
    pub const fn status(&self) -> u16 {
        202
    }
}

/// Body of the `202` response.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
pub struct Accepted<'a> {
    public_id: &'a str,
    status: &'static str,
}

/// Byte cap of the whole request: the ZIP limit plus one megabyte of multipart.
#[must_use]
pub const fn body_limit(max_upload_bytes: u64) -> u64 {
    max_upload_bytes.saturating_add(OVERHEAD)
}

/// Validates the ZIP, picks an id `taken` rejects, and publishes the idle snapshot.
///
/// # Errors
///
/// [`HttpError::NoFile`] when the name is empty.
/// [`HttpError::Files`] when `selected_files` is not a non-empty JSON list.
/// [`HttpError::Zip`] when the bytes are over the limit or not a ZIP.
/// [`HttpError::Taken`] when every generated id is already in use.
pub fn open(
    progress: &Progress,
    upload: Upload,
    max_bytes: u64,
    taken: impl Fn(package::Id) -> bool,
) -> Result<Opened, HttpError> {
    let source = source(upload, max_bytes)?;
    let id = allocate(&taken)?;
    progress.open(id);
    Ok(Opened { id, source })
}

/// Validate the upload without reserving an id or publishing a snapshot.
///
/// # Errors
///
/// [`HttpError::NoFile`] when the name is empty.
/// [`HttpError::Files`] when `selected_files` is not a non-empty JSON list.
/// [`HttpError::Zip`] when the bytes are over the limit or not a ZIP.
pub fn source(upload: Upload, max_bytes: u64) -> Result<Source, HttpError> {
    if upload.name.is_empty() {
        return Err(HttpError::NoFile);
    }
    let files = selection(upload.files.as_deref())?;
    Ok(Source::open(upload.name, upload.bytes, files, max_bytes)?)
}

fn selection(raw: Option<&str>) -> Result<Selection, HttpError> {
    let Some(raw) = raw else {
        return Ok(Selection::All);
    };
    let names = serde_json::from_str::<Vec<String>>(raw)
        .map_err(|err| HttpError::Files(err.to_string()))?;
    match NonEmpty::new(names) {
        Ok(list) => Ok(Selection::Only(list)),
        Err(Empty) => Err(HttpError::Files(
            "selected_files must not be empty".to_owned(),
        )),
    }
}

fn allocate(taken: &impl Fn(package::Id) -> bool) -> Result<package::Id, HttpError> {
    for _ in 0..ATTEMPTS {
        let id = package::Id::generate();
        if !taken(id) {
            return Ok(id);
        }
    }
    Err(HttpError::Taken)
}

#[cfg(test)]
mod tests {
    use super::{Upload, body_limit, open};
    use crate::error::HttpError;
    use domain::observe::Progress;
    use domain::source::Selection;

    fn zip() -> Vec<u8> {
        b"PK\x03\x04history".to_vec()
    }

    #[test]
    fn open_accepts_a_zip_and_publishes_idle() -> Result<(), Fixture> {
        let progress = Progress::new();
        let opened = open(
            &progress,
            Upload::new("history.zip".to_owned(), zip(), None),
            50,
            |_| false,
        )?;
        let value = serde_json::to_value(opened.accepted())?;

        assert_eq!(
            value.get("public_id").and_then(serde_json::Value::as_str),
            Some(opened.id().as_str())
        );
        assert_eq!(
            value.get("status").and_then(serde_json::Value::as_str),
            Some("pending")
        );
        assert_eq!(opened.source().name(), "history.zip");
        assert!(matches!(opened.source().files(), Selection::All));
        assert_eq!(opened.status(), 202);
        let snapshot = progress.get(opened.id()).ok_or(Fixture::Missing)?;
        let event = serde_json::to_value(snapshot)?;
        assert_eq!(
            event.get("runStatus").and_then(serde_json::Value::as_str),
            Some("idle")
        );
        Ok(())
    }

    #[test]
    fn open_skips_an_id_that_is_taken() -> Result<(), Fixture> {
        let progress = Progress::new();
        let rejected = std::sync::Mutex::new(None);
        let opened = open(
            &progress,
            Upload::new(
                "history.zip".to_owned(),
                zip(),
                Some("[\"a.json\"]".to_owned()),
            ),
            50,
            |id| {
                let Ok(mut slot) = rejected.lock() else {
                    return true;
                };
                if slot.is_none() {
                    *slot = Some(id);
                    return true;
                }
                false
            },
        )?;

        let Ok(slot) = rejected.lock() else {
            return Err(Fixture::Missing);
        };
        let skipped = slot.ok_or(Fixture::Missing)?;
        assert_ne!(opened.id(), skipped);
        let Selection::Only(list) = opened.source().files() else {
            return Err(Fixture::Missing);
        };
        let name = list.as_slice().first().ok_or(Fixture::Missing)?;
        assert_eq!(name, "a.json");
        Ok(())
    }

    #[test]
    fn open_rejects_when_every_id_is_taken() {
        let progress = Progress::new();
        let err = open(
            &progress,
            Upload::new("history.zip".to_owned(), zip(), None),
            50,
            |_| true,
        );

        assert!(matches!(err, Err(HttpError::Taken)));
        assert_eq!(HttpError::Taken.status(), 400);
    }

    #[test]
    fn open_rejects_an_empty_name_a_bad_list_and_a_non_zip() {
        let progress = Progress::new();
        assert!(matches!(
            open(
                &progress,
                Upload::new(String::new(), zip(), None),
                50,
                |_| false
            ),
            Err(HttpError::NoFile)
        ));
        assert!(matches!(
            open(
                &progress,
                Upload::new("history.zip".to_owned(), zip(), Some("[]".to_owned())),
                50,
                |_| false,
            ),
            Err(HttpError::Files(_))
        ));
        assert!(matches!(
            open(
                &progress,
                Upload::new("history.zip".to_owned(), b"nope".to_vec(), None),
                50,
                |_| false,
            ),
            Err(HttpError::Zip(_))
        ));
        assert_eq!(HttpError::NoFile.status(), 400);
    }

    #[test]
    fn body_limit_adds_one_megabyte() {
        assert_eq!(body_limit(50), 50 + 1024 * 1024);
    }

    #[derive(Debug)]
    #[allow(dead_code, reason = "the test harness reads the error through Debug")]
    enum Fixture {
        Http(HttpError),
        Json(serde_json::Error),
        Missing,
    }

    impl From<HttpError> for Fixture {
        fn from(err: HttpError) -> Self {
            Self::Http(err)
        }
    }

    impl From<serde_json::Error> for Fixture {
        fn from(err: serde_json::Error) -> Self {
            Self::Json(err)
        }
    }
}
