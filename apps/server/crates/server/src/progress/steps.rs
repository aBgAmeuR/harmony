use super::events::StepId;
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
