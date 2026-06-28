use super::events::StepId;

pub const STEP_ORDER: [StepId; 9] = [
    StepId::ExtractArchive,
    StepId::ParseInteractions,
    StepId::NormalizeInteractions,
    StepId::ResolveTracks,
    StepId::EnrichTracks,
    StepId::EnrichAlbums,
    StepId::AggregateInteractions,
    StepId::VerifyData,
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

pub fn stage_to_step_id(stage: &str) -> StepId {
    match stage {
        "extract" => StepId::ExtractArchive,
        "parse" => StepId::ParseInteractions,
        "normalize" => StepId::NormalizeInteractions,
        "resolve" => StepId::ResolveTracks,
        "enrich" => StepId::EnrichTracks,
        "aggregate" => StepId::AggregateInteractions,
        "verify" => StepId::VerifyData,
        "persist" => StepId::PersistInteractions,
        _ => StepId::ExtractArchive,
    }
}
