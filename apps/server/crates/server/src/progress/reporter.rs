use std::sync::Arc;

use super::events::{ProgressEvent, StepId, StepProgress};
use super::hub::{ProgressHub, now_iso};
use super::steps::{blame_step, step_label};

#[derive(Clone)]
pub struct ProgressReporter {
    hub: Arc<ProgressHub>,
    public_id: String,
}

impl ProgressReporter {
    pub fn new(hub: Arc<ProgressHub>, public_id: String) -> Self {
        Self { hub, public_id }
    }

    pub fn step_started(&self, step_id: StepId) {
        self.hub.emit(
            &self.public_id,
            ProgressEvent::StepStarted {
                step_id,
                label: step_label(step_id).to_string(),
                at: now_iso(),
            },
        );
    }

    pub fn step_progress(&self, step_id: StepId, progress: StepProgress) {
        self.hub.emit(
            &self.public_id,
            ProgressEvent::StepProgress { step_id, progress },
        );
    }

    pub fn step_completed(
        &self,
        step_id: StepId,
        duration_ms: u64,
        output: Option<serde_json::Value>,
    ) {
        self.hub.emit(
            &self.public_id,
            ProgressEvent::StepCompleted {
                step_id,
                at: now_iso(),
                duration_ms,
                output,
            },
        );
    }

    /// Steps JSON in the shape persisted for the package page.
    pub fn steps_json(&self) -> Option<serde_json::Value> {
        self.hub
            .finalize_json(&self.public_id, 0)
            .and_then(|json| json.get("steps").cloned())
    }

    pub fn run_completed(&self, total_duration_ms: u64) {
        let stats = self
            .hub
            .finalize_json(&self.public_id, total_duration_ms)
            .unwrap_or_else(|| serde_json::json!({ "totalDurationMs": total_duration_ms }));

        self.hub.emit(
            &self.public_id,
            ProgressEvent::RunCompleted {
                at: now_iso(),
                stats,
            },
        );
    }

    pub fn fail_running_step(&self, error: &str) {
        let steps = self.hub.steps(&self.public_id);
        self.run_failed(blame_step(&steps), error);
    }

    pub fn run_failed(&self, step_id: StepId, error: &str) {
        let at = now_iso();
        self.hub.emit(
            &self.public_id,
            ProgressEvent::StepFailed {
                step_id,
                at: at.clone(),
                error: error.to_string(),
            },
        );
        self.hub.emit(
            &self.public_id,
            ProgressEvent::RunFailed {
                step_id,
                at,
                error: error.to_string(),
            },
        );
    }
}
