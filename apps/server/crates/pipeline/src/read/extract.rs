//! Keep Spotify extended streaming history entries from a ZIP.

use std::io::{Cursor, Read};
use std::sync::LazyLock;

use domain::source::Selection;
use regex::Regex;
use zip::ZipArchive;

use super::ReadError;

const HISTORY_PATH: &str =
    r"Spotify Extended Streaming History/Streaming_History_Audio_(\d{4}(-\d{4})?)(?:_(\d+))?\.json";

/// Entry size taken from the ZIP header on trust. A Spotify history file is about 12 MB.
/// The archive length is not a bound: JSON deflates about 14 to 1, so an entry outgrows its archive.
const TRUSTED_ENTRY: usize = 64 << 20;

pub struct Entry {
    pub bytes: Vec<u8>,
}

pub fn files(bytes: &[u8], selection: &Selection) -> Result<(Vec<Entry>, u64), ReadError> {
    let Some(pattern) = history_pattern() else {
        return Err(ReadError::NoFiles);
    };

    let mut archive = ZipArchive::new(Cursor::new(bytes))?;
    let mut kept = Vec::new();
    let total = archive.len();

    for index in 0..total {
        let mut file = archive.by_index(index)?;
        let name = zip_path(file.name());
        if !pattern.is_match(&name) || !chosen(selection, &name) {
            continue;
        }

        let mut body = Vec::new();
        if let Ok(declared) = usize::try_from(file.size()) {
            let _ = body.try_reserve_exact(declared.min(TRUSTED_ENTRY));
        }
        file.read_to_end(&mut body)
            .map_err(zip::result::ZipError::from)?;
        // A header that declared more than the entry holds leaves capacity behind. Give it back.
        if body.capacity() > body.len() {
            body.shrink_to_fit();
        }
        kept.push(Entry { bytes: body });
    }

    if kept.is_empty() {
        return Err(ReadError::NoFiles);
    }
    Ok((kept, crate::live::count(total)))
}

fn history_pattern() -> Option<&'static Regex> {
    static PATTERN: LazyLock<Option<Regex>> = LazyLock::new(|| Regex::new(HISTORY_PATH).ok());
    PATTERN.as_ref()
}

fn zip_path(name: &str) -> String {
    let slashed = name.replace('\\', "/");
    let trimmed = slashed.trim_start_matches("./");
    trimmed.trim_start_matches('/').to_owned()
}

fn chosen(selection: &Selection, name: &str) -> bool {
    match selection {
        Selection::All => true,
        Selection::Only(files) => files.as_slice().iter().any(|file| file == name),
    }
}
