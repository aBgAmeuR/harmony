use super::events::{PipelineStep, StepId, StepStatus};
use crate::pipeline::Stage;

pub const STEP_ORDER: [StepId; 7] = [
    StepId::ExtractArchive,
    StepId::ParseInteractions,
    StepId::NormalizeInteractions,
    StepId::ResolveTracks,
    StepId::EnrichTracks,
    StepId::EnrichAlbums,
    StepId::PersistInteractions,
];

pub fn step_label(step_id: StepId) -> &'static str {
    match step_id {
        StepId::ExtractArchive => "Extract archive",
        StepId::ParseInteractions => "Parse interactions",
        StepId::NormalizeInteractions => "Normalize interactions",
        StepId::ResolveTracks => "Resolve tracks",
        StepId::EnrichTracks => "Enrich tracks",
        StepId::EnrichAlbums => "Enrich albums",
        StepId::AggregateInteractions => "Aggregate interactions",
        StepId::VerifyData => "Verify data",
        StepId::PersistInteractions => "Save interactions",
    }
}

/// Maps a domain stage onto the SSE-facing step (save-bundle stages fold into persist).
pub fn stage_to_step_id(stage: Stage) -> StepId {
    stage.to_step_id()
}

pub fn blame_step(steps: &[PipelineStep]) -> StepId {
    steps
        .iter()
        .rev()
        .find(|step| step.status == StepStatus::Running)
        .or_else(|| steps.iter().find(|step| step.status == StepStatus::Pending))
        .map(|step| step.id)
        .unwrap_or(StepId::PersistInteractions)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn step(id: StepId, status: StepStatus) -> PipelineStep {
        PipelineStep {
            id,
            label: String::new(),
            status,
            started_at: None,
            ended_at: None,
            error: None,
            progress: None,
            output: None,
        }
    }

    #[test]
    fn blame_step_prefers_the_running_step() {
        let steps = vec![
            step(StepId::ResolveTracks, StepStatus::Running),
            step(StepId::EnrichTracks, StepStatus::Pending),
        ];
        assert_eq!(blame_step(&steps), StepId::ResolveTracks);
    }

    #[test]
    fn blame_step_uses_the_first_pending_step_when_none_are_running() {
        let steps = vec![step(StepId::ExtractArchive, StepStatus::Pending)];
        assert_eq!(blame_step(&steps), StepId::ExtractArchive);
    }

    #[test]
    fn blame_step_falls_back_to_persist_when_every_step_is_done() {
        let steps = STEP_ORDER
            .iter()
            .copied()
            .map(|id| step(id, StepStatus::Done))
            .collect::<Vec<_>>();
        assert_eq!(blame_step(&steps), StepId::PersistInteractions);
    }
}
