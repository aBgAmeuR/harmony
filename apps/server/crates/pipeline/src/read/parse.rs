//! JSON arrays of Spotify plays.

use domain::play::RawPlay;

use super::extract::Entry;
use super::{ReadError, pool};

/// One batch per entry, parsed on the read pool. Plays borrow the entry bytes.
pub fn plays(entries: &[Entry]) -> Result<Vec<Vec<RawPlay<'_>>>, ReadError> {
    pool::map(entries.iter().collect(), |entry| {
        serde_json::from_slice(&entry.bytes).map_err(ReadError::from)
    })
}
