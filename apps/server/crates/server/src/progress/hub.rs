use std::sync::{Arc, Mutex};

use chrono::Utc;
use dashmap::DashMap;
use tokio::sync::broadcast;

use super::events::{
    PipelineEvent, PipelineRunStatus, PipelineStep, ProgressEvent, StepId, StepStatus,
};
use super::steps::{STEP_ORDER, step_label};

const BROADCAST_CAPACITY: usize = 256;

struct RunState {
    seq: u64,
    run_status: PipelineRunStatus,
    steps: Vec<PipelineStep>,
    started_at: Option<String>,
    ended_at: Option<String>,
}

impl RunState {
    fn new() -> Self {
        let steps = STEP_ORDER
            .iter()
            .map(|&id| PipelineStep {
                id,
                label: step_label(id).to_string(),
                status: StepStatus::Pending,
                started_at: None,
                ended_at: None,
                error: None,
                progress: None,
                output: None,
            })
            .collect();

        Self {
            seq: 0,
            run_status: PipelineRunStatus::Running,
            steps,
            started_at: Some(now_iso()),
            ended_at: None,
        }
    }

    fn step_index(step_id: StepId) -> usize {
        STEP_ORDER
            .iter()
            .position(|id| *id == step_id)
            .expect("unknown step id")
    }

    fn next_seq(&mut self) -> u64 {
        self.seq += 1;
        self.seq
    }

    fn snapshot_event(&self) -> PipelineEvent {
        PipelineEvent::Snapshot {
            seq: self.seq,
            steps: self.steps.clone(),
            run_status: self.run_status,
            started_at: self.started_at.clone(),
            ended_at: self.ended_at.clone(),
        }
    }

    fn apply_event(&mut self, event: ProgressEvent) -> PipelineEvent {
        let seq = self.next_seq();
        match event {
            ProgressEvent::StepStarted { step_id, label, at } => {
                let index = Self::step_index(step_id);
                if self.started_at.is_none() {
                    self.started_at = Some(at.clone());
                }
                self.steps[index].status = StepStatus::Running;
                self.steps[index].label = label.clone();
                self.steps[index].started_at = Some(at.clone());
                self.steps[index].progress = None;
                PipelineEvent::StepStarted {
                    seq,
                    step_id,
                    label,
                    at,
                }
            }
            ProgressEvent::StepProgress {
                step_id, progress, ..
            } => {
                let index = Self::step_index(step_id);
                self.steps[index].progress = Some(progress.clone());
                PipelineEvent::StepProgress {
                    seq,
                    step_id,
                    progress,
                }
            }
            ProgressEvent::StepCompleted {
                step_id,
                at,
                duration_ms,
                output,
            } => {
                let index = Self::step_index(step_id);
                self.steps[index].status = StepStatus::Done;
                self.steps[index].ended_at = Some(at.clone());
                self.steps[index].progress = None;
                self.steps[index].output = output.clone();
                PipelineEvent::StepCompleted {
                    seq,
                    step_id,
                    at,
                    duration_ms,
                    output,
                }
            }
            ProgressEvent::StepFailed { step_id, at, error } => {
                let index = Self::step_index(step_id);
                self.steps[index].status = StepStatus::Error;
                self.steps[index].ended_at = Some(at.clone());
                self.steps[index].error = Some(error.clone());
                self.steps[index].progress = None;
                self.run_status = PipelineRunStatus::Error;
                PipelineEvent::StepFailed {
                    seq,
                    step_id,
                    at,
                    error,
                }
            }
            ProgressEvent::RunCompleted { at, stats } => {
                self.run_status = PipelineRunStatus::Done;
                self.ended_at = Some(at.clone());
                PipelineEvent::RunCompleted { seq, at, stats }
            }
            ProgressEvent::RunFailed { step_id, at, error } => {
                self.run_status = PipelineRunStatus::Error;
                self.ended_at = Some(at.clone());
                PipelineEvent::RunFailed {
                    seq,
                    step_id,
                    at,
                    error,
                }
            }
        }
    }

    fn to_persisted_json(&self, total_duration_ms: u64) -> serde_json::Value {
        let steps: Vec<serde_json::Value> = self
            .steps
            .iter()
            .map(|step| {
                let duration_ms = match (&step.started_at, &step.ended_at) {
                    (Some(start), Some(end)) => chrono::DateTime::parse_from_rfc3339(end)
                        .ok()
                        .and_then(|ended| {
                            chrono::DateTime::parse_from_rfc3339(start)
                                .ok()
                                .map(|started| (ended - started).num_milliseconds().max(0) as u64)
                        })
                        .unwrap_or(0),
                    _ => 0,
                };

                serde_json::json!({
                    "id": step.id,
                    "label": step.label,
                    "status": step.status,
                    "startedAt": step.started_at,
                    "endedAt": step.ended_at,
                    "durationMs": duration_ms,
                    "error": step.error,
                    "output": step.output,
                })
            })
            .collect();

        serde_json::json!({
            "totalDurationMs": total_duration_ms,
            "startedAt": self.started_at,
            "endedAt": self.ended_at,
            "steps": steps,
        })
    }
}

struct ProgressRun {
    state: Mutex<RunState>,
    tx: broadcast::Sender<PipelineEvent>,
}

pub struct ProgressHub {
    runs: DashMap<String, Arc<ProgressRun>>,
}

impl Default for ProgressHub {
    fn default() -> Self {
        Self {
            runs: DashMap::new(),
        }
    }
}

impl ProgressHub {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn register(&self, public_id: &str) {
        let (tx, _) = broadcast::channel(BROADCAST_CAPACITY);
        let run = Arc::new(ProgressRun {
            state: Mutex::new(RunState::new()),
            tx,
        });
        self.runs.insert(public_id.to_string(), run);
    }

    pub fn unregister(&self, public_id: &str) {
        self.runs.remove(public_id);
    }

    pub fn subscribe(&self, public_id: &str) -> Option<broadcast::Receiver<PipelineEvent>> {
        self.runs.get(public_id).map(|run| run.tx.subscribe())
    }

    pub fn snapshot_event(&self, public_id: &str) -> Option<PipelineEvent> {
        self.runs.get(public_id).map(|run| {
            let state = run.state.lock().expect("progress state lock poisoned");
            state.snapshot_event()
        })
    }

    pub fn emit(&self, public_id: &str, event: ProgressEvent) {
        let Some(run) = self.runs.get(public_id) else {
            return;
        };

        let event = {
            let mut state = run.state.lock().expect("progress state lock poisoned");
            state.apply_event(event)
        };

        let _ = run.tx.send(event);
    }

    pub fn finalize_json(
        &self,
        public_id: &str,
        total_duration_ms: u64,
    ) -> Option<serde_json::Value> {
        self.runs.get(public_id).map(|run| {
            let state = run.state.lock().expect("progress state lock poisoned");
            state.to_persisted_json(total_duration_ms)
        })
    }
}

pub fn now_iso() -> String {
    Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true)
}
