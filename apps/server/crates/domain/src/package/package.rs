//! The user-facing package: id, file, and lifecycle.

use chrono::{DateTime, Utc};

use super::{Id, State};
use crate::fail::Fail;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Package {
    id: Id,
    name: String,
    size: u64,
    state: State,
    at: DateTime<Utc>,
    fail: Option<Fail>,
}

impl Package {
    #[must_use]
    pub fn new(id: Id, name: String, size: u64, at: DateTime<Utc>) -> Self {
        Self {
            id,
            name,
            size,
            state: State::Queued,
            at,
            fail: None,
        }
    }

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
    pub const fn state(&self) -> State {
        self.state
    }

    #[must_use]
    pub const fn at(&self) -> DateTime<Utc> {
        self.at
    }

    #[must_use]
    pub const fn fail(&self) -> Option<&Fail> {
        self.fail.as_ref()
    }

    pub(crate) fn mark(mut self, state: State, fail: Option<Fail>) -> Self {
        self.state = state;
        self.fail = fail;
        self
    }
}
