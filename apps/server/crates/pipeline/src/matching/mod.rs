//! One `find` per artist and title. Misses stay out of the hits.
//!
//! Unique pairs run together. The adapter decides how many HTTP calls are in flight.

use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};

use std::sync::atomic::{AtomicU64, Ordering as AtomicOrdering};
use std::time::Instant;

use domain::catalog;
use domain::fail::Fail;
use domain::matching::{Hit, Match};
use domain::observe::Progress;
use domain::package;
use domain::play::{History, Play};
use domain::ports::{Lookup, LookupError};
use domain::stage::Stage;

use crate::live::{self, Live};

/// Enough workers to fill a proxy pool. The adapter gate is the real cap.
const LANES: usize = 32;

/// `find` failed. The stage is always [`Stage::Resolve`].
#[derive(Debug, thiserror::Error)]
pub enum MatchError {
    #[error("lookup failed: {0}")]
    Lookup(#[from] LookupError),
}

impl MatchError {
    #[must_use]
    pub const fn stage(&self) -> Stage {
        match self {
            Self::Lookup(_) => Stage::Resolve,
        }
    }
}

impl From<MatchError> for Fail {
    fn from(err: MatchError) -> Self {
        Fail::new(err.stage(), err.to_string())
    }
}

/// Link each play to a track. The same pair asks `find` once.
///
/// # Errors
///
/// [`MatchError::Lookup`] when `find` fails. A miss is not an error.
pub fn run(
    history: History,
    lookup: &(impl Lookup + Sync),
    live: &mut Live<'_>,
) -> Result<Match, MatchError> {
    let _entered = tracing::info_span!("resolve_tracks").entered();
    live.begin(Stage::Resolve);
    let started = Instant::now();
    let plays = history.into_plays();
    let read = live::count(plays.len());
    let pairs = unique_pairs(&plays);
    let found = match find_pairs(lookup, &pairs, live.progress(), live.id()) {
        Ok(found) => found,
        Err(err) => return Err(refuse(live, err)),
    };

    let mut hits = Vec::new();
    let mut missed = 0_u64;
    for play in plays {
        let id = pairs
            .iter()
            .position(|(artist, title)| artist == play.artist() && title == play.title())
            .and_then(|index| found.get(index).copied().flatten());
        if let Some(id) = id {
            hits.push(Hit::new(play, id));
        } else {
            missed += 1;
        }
    }

    live.end(
        Stage::Resolve,
        started,
        read,
        live::count(hits.len()),
        missed,
    );
    live.set_misses(missed);
    Ok(Match::new(hits, missed))
}

fn refuse(live: &Live<'_>, err: MatchError) -> MatchError {
    live.fail(&Fail::new(err.stage(), err.to_string()));
    err
}

fn unique_pairs(plays: &[Play]) -> Vec<(String, String)> {
    let mut pairs = Vec::new();
    for play in plays {
        if pairs
            .iter()
            .any(|(artist, title)| artist == play.artist() && title == play.title())
        {
            continue;
        }
        pairs.push((play.artist().to_owned(), play.title().to_owned()));
    }
    pairs
}

fn find_pairs(
    lookup: &(impl Lookup + Sync),
    pairs: &[(String, String)],
    progress: &Progress,
    id: package::Id,
) -> Result<Vec<Option<catalog::Id>>, MatchError> {
    if pairs.is_empty() {
        return Ok(Vec::new());
    }

    let workers = pairs.len().min(LANES);
    let total = live::count(pairs.len());
    let next = AtomicUsize::new(0);
    let current = AtomicU64::new(0);
    let stop = AtomicBool::new(false);
    let found = Mutex::new(Vec::new());
    let failed = Mutex::new(None);

    std::thread::scope(|scope| {
        for _ in 0..workers {
            scope.spawn(|| {
                loop {
                    if stop.load(Ordering::Relaxed) {
                        break;
                    }
                    let index = next.fetch_add(1, Ordering::Relaxed);
                    let Some((artist, title)) = pairs.get(index) else {
                        break;
                    };
                    match lookup.find(artist, title) {
                        Ok(track) => {
                            if let Ok(mut rows) = found.lock() {
                                rows.push((index, track));
                            }
                            let done = current.fetch_add(1, AtomicOrdering::Relaxed) + 1;
                            progress.push(
                                id,
                                domain::observe::Note::Tick {
                                    stage: Stage::Resolve,
                                    current: done,
                                    total,
                                    failed: 0,
                                },
                            );
                        }
                        Err(err) => {
                            stop.store(true, Ordering::Relaxed);
                            if let Ok(mut slot) = failed.lock()
                                && slot.is_none()
                            {
                                *slot = Some(err);
                            }
                            break;
                        }
                    }
                }
            });
        }
    });

    let error = lock(&failed)?.clone();
    if let Some(err) = error {
        return Err(err.into());
    }

    let rows = found
        .into_inner()
        .map_err(|_| LookupError::new("match gate poisoned"))?;
    let mut slots = vec![None; pairs.len()];
    for (index, id) in rows {
        if let Some(slot) = slots.get_mut(index) {
            *slot = id;
        }
    }
    Ok(slots)
}

fn lock<T>(mutex: &Mutex<T>) -> Result<std::sync::MutexGuard<'_, T>, MatchError> {
    mutex
        .lock()
        .map_err(|_| LookupError::new("match gate poisoned").into())
}
