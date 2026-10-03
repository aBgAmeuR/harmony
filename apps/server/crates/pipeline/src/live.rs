//! The snapshot and the report a stage writes into while it runs.

use std::time::Instant;

use domain::fail::Fail;
use domain::observe::{Metric, Note, Progress, Report};
use domain::package;
use domain::stage::Stage;

/// Borrowed observe state for one job.
pub struct Live<'a> {
    id: package::Id,
    progress: &'a Progress,
    report: &'a mut Report,
}

impl<'a> Live<'a> {
    #[must_use]
    pub fn new(id: package::Id, progress: &'a Progress, report: &'a mut Report) -> Self {
        Self {
            id,
            progress,
            report,
        }
    }

    #[must_use]
    pub const fn id(&self) -> package::Id {
        self.id
    }

    pub const fn progress(&self) -> &'a Progress {
        self.progress
    }

    pub fn begin(&self, stage: Stage) {
        self.progress.push(self.id, Note::Start(stage));
    }

    pub fn end(&mut self, stage: Stage, started: Instant, read: u64, keep: u64, dropped: u64) {
        let metric = Metric::new(stage, millis(started), read, keep, dropped);
        self.report.push(metric.clone());
        self.progress.push(self.id, Note::End(metric));
    }

    pub fn fail(&self, fail: &Fail) {
        self.progress.push(self.id, Note::Fail(fail.clone()));
    }

    pub fn set_misses(&mut self, misses: u64) {
        self.report.set_misses(misses);
    }

    #[must_use]
    pub const fn calls(&self) -> u64 {
        self.report.calls()
    }

    #[must_use]
    pub const fn retries(&self) -> u64 {
        self.report.retries()
    }

    #[must_use]
    pub const fn misses(&self) -> u64 {
        self.report.misses()
    }

    #[must_use]
    pub fn ms(&self) -> u64 {
        self.report.ms()
    }
}

pub(crate) fn millis(started: Instant) -> u64 {
    u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX)
}

pub(crate) fn count(len: usize) -> u64 {
    u64::try_from(len).unwrap_or(u64::MAX)
}
