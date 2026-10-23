//! In-memory jobs. The slot is an enum so a queued job and a running job can share one map.

use std::collections::{HashMap, VecDeque};
use std::sync::Mutex;

use chrono::Utc;

use crate::artifact::Artifact;
use crate::fail::Fail;
use crate::job::{Job, Pending, Queued};
use crate::observe::Report;
use crate::package::{self, Package, State};
use crate::source::Source;

const ATTEMPTS: u8 = 8;

/// `Store::open` could not reserve an id.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
pub enum OpenError {
    #[error("could not allocate a package id")]
    Taken,
}

/// `Store::get` found no slot for this id.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
#[error("not found")]
pub struct Missing;

#[derive(Debug)]
enum Slot {
    Queued(Job<Queued>),
    Running(Package),
    Settled(Package),
}

#[derive(Debug)]
struct Inner {
    slots: HashMap<package::Id, Slot>,
    queue: VecDeque<package::Id>,
}

/// The only place a [`Job`](crate::job::Job) is created, claimed, finished, or failed.
#[derive(Debug)]
#[must_use]
pub struct Store {
    inner: Mutex<Inner>,
}

impl Store {
    pub fn new() -> Self {
        Self {
            inner: Mutex::new(Inner {
                slots: HashMap::new(),
                queue: VecDeque::new(),
            }),
        }
    }

    /// Reserve a free id, store a queued job, and return the package view.
    ///
    /// # Errors
    ///
    /// [`OpenError::Taken`] when every generated id is already stored.
    pub fn open(&self, source: Source) -> Result<Package, OpenError> {
        let Ok(mut inner) = self.inner.lock() else {
            return Err(OpenError::Taken);
        };
        for _ in 0..ATTEMPTS {
            let id = package::Id::generate();
            if inner.slots.contains_key(&id) {
                continue;
            }
            let name = source.name().to_owned();
            let size = width(source.bytes().len());
            let at = Utc::now();
            let package = Package::new(id, name.clone(), size, at);
            inner
                .slots
                .insert(id, Slot::Queued(Job::queue(id, name, size, at, source)));
            inner.queue.push_back(id);
            return Ok(package);
        }
        Err(OpenError::Taken)
    }

    /// # Errors
    ///
    /// [`Missing`] when the id was never opened.
    pub fn get(&self, id: package::Id) -> Result<Package, Missing> {
        let Ok(inner) = self.inner.lock() else {
            return Err(Missing);
        };
        match inner.slots.get(&id) {
            Some(Slot::Queued(job)) => Ok(Package::new(
                job.id(),
                job.name().to_owned(),
                job.size(),
                job.at(),
            )),
            Some(Slot::Running(package) | Slot::Settled(package)) => Ok(package.clone()),
            None => Err(Missing),
        }
    }

    #[must_use]
    pub fn contains(&self, id: package::Id) -> bool {
        self.inner
            .lock()
            .is_ok_and(|inner| inner.slots.contains_key(&id))
    }

    /// Take the oldest queued job and mark its slot running.
    #[must_use]
    pub fn claim(&self) -> Option<Job<crate::job::Running>> {
        let Ok(mut inner) = self.inner.lock() else {
            return None;
        };
        while let Some(id) = inner.queue.pop_front() {
            let Some(Slot::Queued(job)) = inner.slots.remove(&id) else {
                continue;
            };
            let running = Package::new(job.id(), job.name().to_owned(), job.size(), job.at())
                .mark(State::Running, None);
            let job = job.claim();
            inner.slots.insert(id, Slot::Running(running));
            return Some(job);
        }
        None
    }

    pub fn done(&self, pending: Pending, artifact: Artifact, report: Report) {
        let id = pending.id();
        let package = pending.done(artifact, report);
        let Ok(mut inner) = self.inner.lock() else {
            return;
        };
        inner.slots.insert(id, Slot::Settled(package));
    }

    pub fn fail(&self, pending: Pending, fail: Fail) {
        let id = pending.id();
        let package = pending.fail(fail);
        let Ok(mut inner) = self.inner.lock() else {
            return;
        };
        inner.slots.insert(id, Slot::Settled(package));
    }

    /// Queued jobs, then running jobs.
    #[must_use]
    pub fn counts(&self) -> (u64, u64) {
        let Ok(inner) = self.inner.lock() else {
            return (0, 0);
        };
        let mut queued = 0_u64;
        let mut running = 0_u64;
        for slot in inner.slots.values() {
            match slot {
                Slot::Queued(_) => queued += 1,
                Slot::Running(_) => running += 1,
                Slot::Settled(_) => {}
            }
        }
        (queued, running)
    }
}

impl Default for Store {
    fn default() -> Self {
        Self::new()
    }
}

fn width(len: usize) -> u64 {
    u64::try_from(len).unwrap_or(u64::MAX)
}

#[cfg(test)]
mod tests {
    use super::{Missing, Store};
    use crate::artifact::Artifact;
    use crate::fail::Fail;
    use crate::observe::Report;
    use crate::package::State;
    use crate::source::{Selection, Source};
    use crate::stage::Stage;

    fn source() -> Result<Source, crate::source::SourceError> {
        Source::open(
            "history.zip".to_owned(),
            b"PK\x03\x04".to_vec(),
            Selection::All,
            100,
        )
    }

    #[test]
    fn claim_then_done_settles_a_ready_package() -> Result<(), Fixture> {
        let store = Store::new();
        let opened = store.open(source()?)?;
        assert_eq!(store.counts(), (1, 0));
        assert_eq!(store.get(opened.id())?.state(), State::Queued);

        let job = store.claim().ok_or(Fixture::Missing(super::Missing))?;
        assert_eq!(job.id(), opened.id());
        assert_eq!(store.counts(), (0, 1));
        assert_eq!(store.get(opened.id())?.state(), State::Running);
        assert!(store.claim().is_none());

        let (_source, pending) = job.split();
        store.done(
            pending,
            Artifact::new("harmony/file.duckdb".into()),
            Report::new(),
        );
        let settled = store.get(opened.id())?;
        assert_eq!(settled.state(), State::Ready);
        assert_eq!(store.counts(), (0, 0));
        Ok(())
    }

    #[test]
    fn fail_records_the_stage_message() -> Result<(), Fixture> {
        let store = Store::new();
        let opened = store.open(source()?)?;
        let job = store.claim().ok_or(Fixture::Missing(super::Missing))?;
        let (_source, pending) = job.split();
        store.fail(
            pending,
            Fail::new(Stage::Extract, "no history file".to_owned()),
        );

        let settled = store.get(opened.id())?;
        assert_eq!(settled.state(), State::Failed);
        let fail = settled.fail().ok_or(Fixture::Missing(super::Missing))?;
        assert_eq!(fail.stage(), Stage::Extract);
        assert_eq!(fail.message(), "no history file");
        Ok(())
    }

    #[test]
    fn get_misses_an_unknown_id() {
        let store = Store::new();
        let id = crate::package::Id::generate();
        assert!(matches!(store.get(id), Err(Missing)));
    }

    #[derive(Debug)]
    #[allow(
        dead_code,
        reason = "the harness prints this only when a fixture fails"
    )]
    enum Fixture {
        Open(super::OpenError),
        Source(crate::source::SourceError),
        Missing(super::Missing),
    }

    impl From<super::Missing> for Fixture {
        fn from(err: super::Missing) -> Self {
            Self::Missing(err)
        }
    }

    impl From<super::OpenError> for Fixture {
        fn from(err: super::OpenError) -> Self {
            Self::Open(err)
        }
    }

    impl From<crate::source::SourceError> for Fixture {
        fn from(err: crate::source::SourceError) -> Self {
            Self::Source(err)
        }
    }
}
