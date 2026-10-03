//! `read`, then `matching`, then `enrich`, then `write`. Each step pushes its notes.

use std::path::Path;
use std::time::Instant;

use chrono::{DateTime, Utc};
use domain::artifact::Artifact;
use domain::fail::Fail;
use domain::package::Package;
use domain::ports::Lookup;
use domain::source::Source;
use domain::stage::Stage;

use crate::enrich;
use crate::live::{self, Live};
use crate::matching;
use crate::read;
use crate::write::{self, WriteError};

/// When the worker claimed the job, both as a clock and as a monotonic start.
pub struct Stamp {
    wall: DateTime<Utc>,
    began: Instant,
}

impl Stamp {
    #[must_use]
    pub const fn new(wall: DateTime<Utc>, began: Instant) -> Self {
        Self { wall, began }
    }
}

/// Run the four steps. The worker pushes `Done` after `Blob::put`.
///
/// # Errors
///
/// A [`Fail`] whose stage is the step that stopped. That step has already pushed `Note::Fail`.
pub fn run(
    source: Source,
    package: &Package,
    stamp: &Stamp,
    live: &mut Live<'_>,
    lookup: &(impl Lookup + Sync),
    path: &Path,
) -> Result<Artifact, Fail> {
    let _entered = tracing::info_span!("job", id = %live.id()).entered();
    let history = read::run(source, live).map_err(Fail::from)?;
    let matched = matching::run(history, lookup, live).map_err(Fail::from)?;
    let catalog = enrich::run(matched, lookup, live).map_err(Fail::from)?;

    live.begin(Stage::Persist);
    let started = Instant::now();
    if let Err(err) = write::fill(&catalog, path) {
        return Err(refuse(live, err));
    }
    let kept = live::count(catalog.listens().len());
    live.end(Stage::Persist, started, kept, kept, 0);

    let steps = snapshot(live)?;
    let duration = live::millis(stamp.began);
    if let Err(err) = write::note(path, package, stamp.wall, duration, &steps) {
        return Err(refuse(live, err));
    }
    Ok(Artifact::new(path.to_path_buf()))
}

fn snapshot(live: &Live<'_>) -> Result<String, Fail> {
    let Some(event) = live.progress().get(live.id()) else {
        return Ok("[]".to_owned());
    };
    match serde_json::to_string(&event) {
        Ok(steps) => Ok(steps),
        Err(err) => Err(refuse_text(live, err.to_string())),
    }
}

fn refuse(live: &Live<'_>, err: WriteError) -> Fail {
    let fail = Fail::from(err);
    live.fail(&fail);
    fail
}

fn refuse_text(live: &Live<'_>, message: String) -> Fail {
    let fail = Fail::new(Stage::Persist, message);
    live.fail(&fail);
    fail
}
