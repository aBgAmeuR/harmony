//! Drop plays that fail artist, title, or duration checks.

use std::borrow::Cow;
use std::convert::Infallible;

use domain::play::{Play, RawPlay};

use super::{clean, pool};

/// Normalizes each batch on the read pool and joins them in archive order.
pub fn plays(batches: Vec<Vec<RawPlay<'_>>>) -> Vec<Play> {
    let Ok(kept) = pool::map(batches, |raws| Ok::<_, Infallible>(batch(raws)));
    let mut plays = Vec::with_capacity(kept.iter().map(Vec::len).sum());
    for batch in kept {
        plays.extend(batch);
    }
    plays
}

fn batch(raws: Vec<RawPlay<'_>>) -> Vec<Play> {
    let mut kept = Vec::with_capacity(raws.len());
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
