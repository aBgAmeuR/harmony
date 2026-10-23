//! A job the worker has taken.

use chrono::{DateTime, Utc};
use std::time::Instant;

#[derive(Debug)]
pub struct Running {
    began: Instant,
    wall: DateTime<Utc>,
}

impl Running {
    pub(crate) fn start() -> Self {
        Self {
            began: Instant::now(),
            wall: Utc::now(),
        }
    }

    #[must_use]
    pub const fn began(&self) -> Instant {
        self.began
    }

    #[must_use]
    pub const fn wall(&self) -> DateTime<Utc> {
        self.wall
    }
}
