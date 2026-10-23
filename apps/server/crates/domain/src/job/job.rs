//! `Job<Queued>` becomes `Job<Running>`, then `Pending`. `done` and `fail` consume `Pending`.

use chrono::{DateTime, Utc};
use std::time::Instant;

use super::{Queued, Running};
use crate::artifact::Artifact;
use crate::fail::Fail;
use crate::observe::Report;
use crate::package::{Id, Package, State};
use crate::source::Source;

/// One upload moving through the worker. The state parameter is the only way to `claim` or `split`.
#[derive(Debug)]
#[must_use]
pub struct Job<S> {
    id: Id,
    name: String,
    size: u64,
    at: DateTime<Utc>,
    source: Source,
    state: S,
}

impl Job<Queued> {
    pub(crate) fn queue(
        id: Id,
        name: String,
        size: u64,
        at: DateTime<Utc>,
        source: Source,
    ) -> Self {
        Self {
            id,
            name,
            size,
            at,
            source,
            state: Queued,
        }
    }

    pub fn claim(self) -> Job<Running> {
        Job {
            id: self.id,
            name: self.name,
            size: self.size,
            at: self.at,
            source: self.source,
            state: Running::start(),
        }
    }
}

impl Job<Running> {
    pub fn split(self) -> (Source, Pending) {
        let pending = Pending {
            id: self.id,
            name: self.name,
            size: self.size,
            at: self.at,
            began: self.state.began(),
            wall: self.state.wall(),
        };
        (self.source, pending)
    }
}

impl<S> Job<S> {
    #[must_use]
    pub const fn id(&self) -> Id {
        self.id
    }

    #[must_use]
    pub fn name(&self) -> &str {
        &self.name
    }

    #[must_use]
    pub const fn size(&self) -> u64 {
        self.size
    }

    #[must_use]
    pub const fn at(&self) -> DateTime<Utc> {
        self.at
    }
}

/// What remains after `read` takes the [`Source`](crate::source::Source).
#[derive(Debug)]
#[must_use]
pub struct Pending {
    id: Id,
    name: String,
    size: u64,
    at: DateTime<Utc>,
    began: Instant,
    wall: DateTime<Utc>,
}

impl Pending {
    #[must_use]
    pub const fn id(&self) -> Id {
        self.id
    }

    #[must_use]
    pub const fn began(&self) -> Instant {
        self.began
    }

    #[must_use]
    pub const fn wall(&self) -> DateTime<Utc> {
        self.wall
    }

    /// Fields `package_meta` stores. The SQL writes `completed` itself.
    #[must_use]
    pub fn package(&self) -> Package {
        Package::new(self.id, self.name.clone(), self.size, self.at)
    }

    #[must_use]
    pub fn done(self, artifact: Artifact, report: Report) -> Package {
        let ms = report.ms();
        let path = artifact.path().display().to_string();
        drop(report);
        drop(artifact);
        tracing::info!(id = %self.id, ms, path, "package ready");
        Package::new(self.id, self.name, self.size, self.at).mark(State::Ready, None)
    }

    #[must_use]
    pub fn fail(self, fail: Fail) -> Package {
        tracing::error!(
            id = %self.id,
            stage = %fail.stage(),
            message = fail.message(),
            "package failed"
        );
        Package::new(self.id, self.name, self.size, self.at).mark(State::Failed, Some(fail))
    }
}
