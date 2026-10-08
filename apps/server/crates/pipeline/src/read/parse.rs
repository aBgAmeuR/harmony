//! JSON arrays of Spotify plays.

use domain::play::RawPlay;

use super::ReadError;
use super::extract::Entry;

pub fn plays(entries: &[Entry]) -> Result<Vec<RawPlay<'_>>, ReadError> {
    let mut raw = Vec::new();
    for entry in entries {
        let batch: Vec<RawPlay<'_>> = serde_json::from_slice(&entry.bytes)?;
        for play in batch {
            raw.push(play);
        }
    }
    Ok(raw)
}
