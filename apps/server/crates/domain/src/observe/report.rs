//! Metrics gathered across one package, plus the Deezer counters.

use super::Metric;

/// Filled by `push` as each step ends. `Done` carries it.
#[derive(Debug, Clone, PartialEq, Eq)]
#[must_use]
pub struct Report {
    metrics: Vec<Metric>,
    calls: u64,
    retries: u64,
    misses: u64,
}

impl Report {
    pub const fn new() -> Self {
        Self {
            metrics: Vec::new(),
            calls: 0,
            retries: 0,
            misses: 0,
        }
    }

    pub fn push(&mut self, metric: Metric) {
        self.metrics.push(metric);
    }

    pub const fn tally(&mut self, calls: u64, retries: u64, misses: u64) {
        self.calls = calls;
        self.retries = retries;
        self.misses = misses;
    }

    pub const fn set_misses(&mut self, misses: u64) {
        self.misses = misses;
    }

    #[must_use]
    pub fn metrics(&self) -> &[Metric] {
        &self.metrics
    }

    #[must_use]
    pub const fn calls(&self) -> u64 {
        self.calls
    }

    #[must_use]
    pub const fn retries(&self) -> u64 {
        self.retries
    }

    #[must_use]
    pub const fn misses(&self) -> u64 {
        self.misses
    }

    #[must_use]
    pub fn ms(&self) -> u64 {
        self.metrics
            .iter()
            .fold(0, |sum, metric| sum.saturating_add(metric.ms()))
    }
}

impl Default for Report {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::Report;
    use crate::observe::Metric;
    use crate::stage::Stage;

    #[test]
    fn ms_is_the_sum_of_the_steps() {
        let mut report = Report::new();
        report.push(Metric::new(Stage::Extract, 10, 2, 2, 0));
        report.push(Metric::new(Stage::Parse, 5, 2, 1, 1));
        report.tally(4, 1, 3);

        assert_eq!(report.ms(), 15);
        assert_eq!(report.calls(), 4);
        assert_eq!(report.retries(), 1);
        assert_eq!(report.misses(), 3);
    }
}
