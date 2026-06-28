use std::sync::{Arc, Mutex};

use super::events::{PipelineEvent, StepId, StepProgress};
use super::hub::{now_iso, ProgressHub};
use super::steps::step_label;

#[derive(Clone)]
pub struct ProgressReporter {
    hub: Arc<ProgressHub>,
    public_id: String,
    active_step: Arc<Mutex<Option<StepId>>>,
}

impl ProgressReporter {
    pub fn new(hub: Arc<ProgressHub>, public_id: String) -> Self {
        Self {
            hub,
            public_id,
            active_step: Arc::new(Mutex::new(None)),
        }
    }

    pub fn step_started(&self, step_id: StepId) {
        let label = step_label(step_id).to_string();
        *self.active_step.lock().expect("active step lock poisoned") = Some(step_id);
        self.hub.emit(
            &self.public_id,
            PipelineEvent::StepStarted {
                seq: 0,
                step_id,
                label,
                at: now_iso(),
            },
        );
    }

    pub fn step_progress(&self, step_id: StepId, progress: StepProgress) {
        self.hub.emit(
            &self.public_id,
            PipelineEvent::StepProgress {
                seq: 0,
                step_id,
                progress,
            },
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
            PipelineEvent::StepCompleted {
                seq: 0,
                step_id,
                at: now_iso(),
                duration_ms,
                output,
            },
        );
    }

    pub fn run_completed(&self, total_duration_ms: u64) {
        let stats = self
            .hub
            .finalize_json(&self.public_id, total_duration_ms)
            .unwrap_or_else(|| serde_json::json!({ "totalDurationMs": total_duration_ms }));

        self.hub.emit(
            &self.public_id,
            PipelineEvent::RunCompleted {
                seq: 0,
                at: now_iso(),
                stats,
            },
        );
    }

    pub fn run_failed(&self, step_id: StepId, error: &str) {
        self.hub.emit(
            &self.public_id,
            PipelineEvent::StepFailed {
                seq: 0,
                step_id,
                at: now_iso(),
                error: error.to_string(),
            },
        );
        self.hub.emit(
            &self.public_id,
            PipelineEvent::RunFailed {
                seq: 0,
                step_id,
                at: now_iso(),
                error: error.to_string(),
            },
        );
    }

    pub fn active_step(&self) -> Option<StepId> {
        *self.active_step.lock().expect("active step lock poisoned")
    }
}
