//! One finished step: how long it took, and how many rows it read, kept, and dropped.

use crate::stage::Stage;

/// Counts for a single [`Stage`]. `Report` stores these.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Metric {
    stage: Stage,
    ms: u64,
    read: u64,
    keep: u64,
    dropped: u64,
}

impl Metric {
    #[must_use]
    pub const fn new(stage: Stage, ms: u64, read: u64, keep: u64, dropped: u64) -> Self {
        Self {
            stage,
            ms,
            read,
            keep,
            dropped,
        }
    }

    #[must_use]
    pub const fn stage(&self) -> Stage {
        self.stage
    }

    #[must_use]
    pub const fn ms(&self) -> u64 {
        self.ms
    }

    #[must_use]
    pub const fn read(&self) -> u64 {
        self.read
    }

    #[must_use]
    pub const fn keep(&self) -> u64 {
        self.keep
    }

    #[must_use]
    pub const fn dropped(&self) -> u64 {
        self.dropped
    }
}
