use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StepId {
    ExtractArchive,
    ParseInteractions,
    NormalizeInteractions,
    ResolveTracks,
    EnrichTracks,
    EnrichAlbums,
    AggregateInteractions,
    VerifyData,
    PersistInteractions,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum StepStatus {
    Pending,
    Running,
    Done,
    Error,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PipelineRunStatus {
    Idle,
    Running,
    Done,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StepProgress {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phase: Option<String>,
    pub current: u64,
    pub total: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub failed: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PipelineStep {
    pub id: StepId,
    pub label: String,
    pub status: StepStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub started_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ended_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub progress: Option<StepProgress>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output: Option<serde_json::Value>,
}

/// Un-sequenced event input. The hub assigns `seq` when applying.
#[derive(Debug, Clone)]
pub enum ProgressEvent {
    StepStarted {
        step_id: StepId,
        label: String,
        at: String,
    },
    StepProgress {
        step_id: StepId,
        progress: StepProgress,
    },
    StepCompleted {
        step_id: StepId,
        at: String,
        duration_ms: u64,
        output: Option<serde_json::Value>,
    },
    StepFailed {
        step_id: StepId,
        at: String,
        error: String,
    },
    RunCompleted {
        at: String,
        stats: serde_json::Value,
    },
    RunFailed {
        step_id: StepId,
        at: String,
        error: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum PipelineEvent {
    #[serde(rename = "snapshot")]
    Snapshot {
        seq: u64,
        steps: Vec<PipelineStep>,
        #[serde(rename = "runStatus")]
        run_status: PipelineRunStatus,
        #[serde(rename = "startedAt", skip_serializing_if = "Option::is_none")]
        started_at: Option<String>,
        #[serde(rename = "endedAt", skip_serializing_if = "Option::is_none")]
        ended_at: Option<String>,
    },
    #[serde(rename = "step.started")]
    StepStarted {
        seq: u64,
        #[serde(rename = "stepId")]
        step_id: StepId,
        label: String,
        at: String,
    },
    #[serde(rename = "step.progress")]
    StepProgress {
        seq: u64,
        #[serde(rename = "stepId")]
        step_id: StepId,
        progress: StepProgress,
    },
    #[serde(rename = "step.completed")]
    StepCompleted {
        seq: u64,
        #[serde(rename = "stepId")]
        step_id: StepId,
        at: String,
        #[serde(rename = "durationMs")]
        duration_ms: u64,
        #[serde(skip_serializing_if = "Option::is_none")]
        output: Option<serde_json::Value>,
    },
    #[serde(rename = "step.failed")]
    StepFailed {
        seq: u64,
        #[serde(rename = "stepId")]
        step_id: StepId,
        at: String,
        error: String,
    },
    #[serde(rename = "run.completed")]
    RunCompleted {
        seq: u64,
        at: String,
        stats: serde_json::Value,
    },
    #[serde(rename = "run.failed")]
    RunFailed {
        seq: u64,
        #[serde(rename = "stepId")]
        step_id: StepId,
        at: String,
        error: String,
    },
}

impl PipelineEvent {
    pub fn seq(&self) -> u64 {
        match self {
            Self::Snapshot { seq, .. }
            | Self::StepStarted { seq, .. }
            | Self::StepProgress { seq, .. }
            | Self::StepCompleted { seq, .. }
            | Self::StepFailed { seq, .. }
            | Self::RunCompleted { seq, .. }
            | Self::RunFailed { seq, .. } => *seq,
        }
    }

    pub fn is_terminal(&self) -> bool {
        matches!(self, Self::RunCompleted { .. } | Self::RunFailed { .. })
    }
}
