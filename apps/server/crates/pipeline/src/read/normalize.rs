//! Drop plays that fail artist, title, or duration checks.

use std::borrow::Cow;

use domain::play::{Play, RawPlay};

use super::clean;

pub fn plays(raws: Vec<RawPlay<'_>>) -> Vec<Play> {
    let mut kept = Vec::new();
    for mut raw in raws {
        let cleaned = match raw.take_title() {
            Some(Cow::Borrowed(title)) => clean::title(title),
            Some(Cow::Owned(title)) => Cow::Owned(clean::title(&title).into_owned()),
            None => Cow::Borrowed(""),
        };
        let Ok(play) = Play::try_from(raw.with_title(cleaned)) else {
            continue;
        };
        kept.push(play);
    }
    kept
}
