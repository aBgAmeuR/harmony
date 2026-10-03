//! Upload bytes before they are read as a Spotify archive.

/// Local file header of a ZIP archive.
const ZIP_MAGIC: &[u8] = b"PK\x03\x04";

/// Which archive entries `read` keeps.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Selection {
    All,
    Only(NonEmpty<String>),
}

/// A list that cannot be built empty.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NonEmpty<T> {
    items: Vec<T>,
}

/// `NonEmpty::new` was given no items.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
#[error("list is empty")]
pub struct Empty;

impl<T> NonEmpty<T> {
    /// # Errors
    ///
    /// [`Empty`] when `items` has no element.
    pub fn new(items: Vec<T>) -> Result<Self, Empty> {
        if items.is_empty() {
            return Err(Empty);
        }
        Ok(Self { items })
    }

    #[must_use]
    pub fn as_slice(&self) -> &[T] {
        self.items.as_slice()
    }

    #[must_use]
    pub fn into_vec(self) -> Vec<T> {
        self.items
    }
}

/// Raw upload: file name, bytes, and the entries the user kept.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Source {
    name: String,
    bytes: Vec<u8>,
    files: Selection,
}

/// `Source::open` rejected the upload.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum SourceError {
    #[error("upload is {len} bytes, limit is {max}")]
    Size { len: usize, max: u64 },
    #[error("file is not a zip archive")]
    Magic,
}

impl Source {
    /// Checks the size limit, then the ZIP magic.
    ///
    /// A limit that does not fit in `usize` cannot be exceeded by a `Vec`.
    ///
    /// # Errors
    ///
    /// [`SourceError::Size`] when the byte length is over `max_bytes`.
    /// [`SourceError::Magic`] when the bytes do not start with `PK\x03\x04`.
    pub fn open(
        name: String,
        bytes: Vec<u8>,
        files: Selection,
        max_bytes: u64,
    ) -> Result<Self, SourceError> {
        if let Ok(max) = usize::try_from(max_bytes)
            && bytes.len() > max
        {
            return Err(SourceError::Size {
                len: bytes.len(),
                max: max_bytes,
            });
        }
        if !bytes.starts_with(ZIP_MAGIC) {
            return Err(SourceError::Magic);
        }
        Ok(Self { name, bytes, files })
    }

    #[must_use]
    pub fn name(&self) -> &str {
        &self.name
    }

    #[must_use]
    pub fn bytes(&self) -> &[u8] {
        &self.bytes
    }

    #[must_use]
    pub fn files(&self) -> &Selection {
        &self.files
    }

    #[must_use]
    pub fn into_parts(self) -> (String, Vec<u8>, Selection) {
        (self.name, self.bytes, self.files)
    }
}

#[cfg(test)]
mod tests {
    use super::{Empty, NonEmpty, Selection, Source, SourceError};

    #[test]
    fn open_accepts_a_zip_under_the_limit() -> Result<(), SourceError> {
        let source = Source::open(
            "history.zip".to_owned(),
            b"PK\x03\x04rest".to_vec(),
            Selection::All,
            50,
        )?;

        assert_eq!(source.name(), "history.zip");
        assert_eq!(source.bytes().len(), 8);
        assert_eq!(source.files(), &Selection::All);
        Ok(())
    }

    #[test]
    fn open_rejects_a_file_over_the_limit() {
        let error = Source::open(String::new(), b"PK\x03\x04".to_vec(), Selection::All, 3);

        assert_eq!(error, Err(SourceError::Size { len: 4, max: 3 }));
    }

    #[test]
    fn open_rejects_bytes_without_zip_magic() {
        let error = Source::open(String::new(), b"not-a-zip".to_vec(), Selection::All, 50);

        assert_eq!(error, Err(SourceError::Magic));
    }

    #[test]
    fn only_rejects_an_empty_list() {
        let empty: Result<NonEmpty<String>, Empty> = NonEmpty::new(Vec::new());

        assert_eq!(empty, Err(Empty));
    }

    #[test]
    fn only_keeps_a_non_empty_list() -> Result<(), Empty> {
        let files = NonEmpty::new(vec!["a.json".to_owned()])?;

        assert_eq!(files.as_slice(), ["a.json"]);
        Ok(())
    }
}
