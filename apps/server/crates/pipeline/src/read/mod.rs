//! ZIP bytes to [`History`](domain::play::History).

mod clean;
mod extract;
mod normalize;
mod parse;

use std::time::Instant;

use domain::fail::Fail;
use domain::play::History;
use domain::source::{NonEmpty, Source};
use domain::stage::Stage;

use crate::live::{self, Live};

/// `read` could not turn the archive into plays.
#[derive(Debug, thiserror::Error)]
pub enum ReadError {
    #[error("unreadable archive: {0}")]
    Extract(#[from] zip::result::ZipError),
    #[error("invalid JSON: {0}")]
    Parse(#[from] serde_json::Error),
    #[error("no valid play")]
    Empty,
    #[error("no history file")]
    NoFiles,
}

impl ReadError {
    #[must_use]
    pub const fn stage(&self) -> Stage {
        match self {
            Self::Extract(_) | Self::NoFiles => Stage::Extract,
            Self::Parse(_) => Stage::Parse,
            Self::Empty => Stage::Normalize,
        }
    }
}

impl From<ReadError> for Fail {
    fn from(err: ReadError) -> Self {
        Fail::new(err.stage(), err.to_string())
    }
}

/// Read the archive, keep valid plays, and reject an empty result.
///
/// # Errors
///
/// [`ReadError::NoFiles`] when no streaming-history entry is kept.
/// [`ReadError::Extract`] when the ZIP cannot be read.
/// [`ReadError::Parse`] when a kept file is not a JSON array of plays.
/// [`ReadError::Empty`] when every play is dropped.
pub fn run(source: Source, live: &mut Live<'_>) -> Result<History, ReadError> {
    let (_name, bytes, files) = source.into_parts();

    live.begin(Stage::Extract);
    let started = Instant::now();
    let (entries, scanned) = {
        let _entered = tracing::info_span!("extract_archive").entered();
        match extract::files(&bytes, &files) {
            Ok(pair) => pair,
            Err(err) => return Err(refuse(live, err)),
        }
    };
    let found = live::count(entries.len());
    live.end(
        Stage::Extract,
        started,
        scanned,
        found,
        scanned.saturating_sub(found),
    );

    live.begin(Stage::Parse);
    let started = Instant::now();
    let raw = {
        let _entered = tracing::info_span!("parse_interactions").entered();
        match parse::plays(&entries) {
            Ok(raw) => raw,
            Err(err) => return Err(refuse(live, err)),
        }
    };
    let parsed = live::count(raw.len());
    live.end(Stage::Parse, started, found, parsed, 0);

    live.begin(Stage::Normalize);
    let started = Instant::now();
    let plays = {
        let _entered = tracing::info_span!("normalize_interactions").entered();
        normalize::plays(raw)
    };
    let kept = live::count(plays.len());
    let Ok(plays) = NonEmpty::new(plays) else {
        return Err(refuse(live, ReadError::Empty));
    };
    live.end(
        Stage::Normalize,
        started,
        parsed,
        kept,
        parsed.saturating_sub(kept),
    );
    Ok(History::from_plays(plays))
}

fn refuse(live: &Live<'_>, err: ReadError) -> ReadError {
    live.fail(&Fail::new(err.stage(), err.to_string()));
    err
}
