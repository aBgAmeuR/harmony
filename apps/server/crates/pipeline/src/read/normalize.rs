//! Drop plays that fail artist, title, or duration checks.

use domain::play::{Play, RawPlay};

use super::clean;

pub fn plays(raws: Vec<RawPlay<'_>>) -> Vec<Play> {
    let mut kept = Vec::new();
    for raw in raws {
        let cleaned = match raw.title() {
            Some(title) => clean::title(title),
            None => String::new(),
        };
        let Ok(play) = Play::try_from(raw.with_title(cleaned)) else {
            continue;
        };
        kept.push(play);
    }
    kept
}
