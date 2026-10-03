use super::Hit;

/// Hits kept by `matching`, plus the plays that had no track.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Match {
    hits: Vec<Hit>,
    missed: u64,
}

impl Match {
    #[must_use]
    pub fn new(hits: Vec<Hit>, missed: u64) -> Self {
        Self { hits, missed }
    }

    #[must_use]
    pub fn hits(&self) -> &[Hit] {
        &self.hits
    }

    #[must_use]
    pub const fn missed(&self) -> u64 {
        self.missed
    }

    #[must_use]
    pub fn into_hits(self) -> (Vec<Hit>, u64) {
        (self.hits, self.missed)
    }
}
