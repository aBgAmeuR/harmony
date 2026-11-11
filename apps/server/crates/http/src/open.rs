//! `POST /api/v1/packages`.

use domain::source::{Empty, NonEmpty, Selection, Source};

use crate::error::HttpError;

/// Extra room for the multipart envelope around the ZIP.
const OVERHEAD: u64 = 1024 * 1024;

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

/// Byte cap of the whole request: the ZIP limit plus one megabyte of multipart.
#[must_use]
pub const fn body_limit(max_upload_bytes: u64) -> u64 {
    max_upload_bytes.saturating_add(OVERHEAD)
}

/// Validate the upload. The store picks the id.
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

#[cfg(test)]
mod tests {
    use super::{Upload, body_limit, source};
    use crate::error::HttpError;
    use domain::source::Selection;

    fn zip() -> Vec<u8> {
        b"PK\x03\x04history".to_vec()
    }

    #[test]
    fn source_keeps_every_file_without_a_list() -> Result<(), HttpError> {
        let source = source(Upload::new("history.zip".to_owned(), zip(), None), 50)?;
        let (name, _, files) = source.into_parts();
        assert_eq!(name, "history.zip");
        assert!(matches!(files, Selection::All));
        Ok(())
    }

    #[test]
    fn source_keeps_the_listed_files() -> Result<(), HttpError> {
        let upload = Upload::new(
            "history.zip".to_owned(),
            zip(),
            Some("[\"a.json\"]".to_owned()),
        );
        let (_, _, files) = source(upload, 50)?.into_parts();
        assert!(matches!(files, Selection::Only(list) if list.as_slice() == ["a.json".to_owned()]));
        Ok(())
    }

    #[test]
    fn source_rejects_an_empty_name_a_bad_list_and_a_non_zip() {
        assert!(matches!(
            source(Upload::new(String::new(), zip(), None), 50),
            Err(HttpError::NoFile)
        ));
        assert!(matches!(
            source(
                Upload::new("history.zip".to_owned(), zip(), Some("[]".to_owned())),
                50
            ),
            Err(HttpError::Files(_))
        ));
        assert!(matches!(
            source(
                Upload::new("history.zip".to_owned(), b"nope".to_vec(), None),
                50
            ),
            Err(HttpError::Zip(_))
        ));
        assert_eq!(HttpError::NoFile.status(), 400);
    }

    #[test]
    fn body_limit_adds_one_megabyte() {
        assert_eq!(body_limit(50), 50 + 1024 * 1024);
    }
}
