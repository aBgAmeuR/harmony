use std::time::{Duration, Instant};

use super::events::{StepId, StepProgress};
use super::reporter::ProgressReporter;

const MIN_INTERVAL: Duration = Duration::from_millis(500);

pub struct ProgressAggregator {
    step_id: StepId,
    reporter: ProgressReporter,
    last_emit: Instant,
    last_current: u64,
    total: u64,
}

impl ProgressAggregator {
    pub fn new(step_id: StepId, reporter: ProgressReporter, total: u64) -> Self {
        Self {
            step_id,
            reporter,
            last_emit: Instant::now() - MIN_INTERVAL,
            last_current: 0,
            total,
        }
    }

    pub fn on_item_done(&mut self, current: u64, failed: u64) {
        let is_last = current >= self.total;
        let should_emit = self.last_emit.elapsed() >= MIN_INTERVAL
            || is_last
            || (current > self.last_current && self.total > 0);

        if !should_emit {
            return;
        }

        self.reporter.step_progress(
            self.step_id,
            StepProgress {
                phase: None,
                current,
                total: self.total,
                failed: if failed > 0 { Some(failed) } else { None },
            },
        );

        self.last_emit = Instant::now();
        self.last_current = current;
    }
}
