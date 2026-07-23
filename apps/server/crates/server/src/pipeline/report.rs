use serde::Serialize;

use crate::pipeline::PipelineStats;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtractOutput {
    pub files_count: usize,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ParseOutput {
    pub validated: usize,
    pub invalid: usize,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NormalizeOutput {
    pub kept: usize,
    pub rejected: usize,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResolveOutput {
    pub resolved: usize,
    pub missed: usize,
    pub errors: usize,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EnrichRequestOutput {
    pub total: u64,
    pub completed: u64,
    pub fetched: usize,
    pub failed: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PersistOutput {
    pub interactions: usize,
    pub tracks: usize,
    pub albums: usize,
    pub artists: usize,
}

#[derive(Debug, Default, Clone)]
pub struct ExtractReport {
    pub files_taken_count: usize,
}

impl ExtractReport {
    pub fn to_output(&self) -> ExtractOutput {
        ExtractOutput {
            files_count: self.files_taken_count,
        }
    }

    pub fn apply_to_stats(&self, stats: &mut PipelineStats) {
        stats.files_taken_count = self.files_taken_count;
    }
}

#[derive(Debug, Default, Clone)]
pub struct ParseReport {
    pub validated: usize,
    pub invalid: usize,
}

impl ParseReport {
    pub fn to_output(&self) -> ParseOutput {
        ParseOutput {
            validated: self.validated,
            invalid: self.invalid,
        }
    }

    pub fn apply_to_stats(&self, stats: &mut PipelineStats) {
        stats.parse_validated_count = self.validated;
        stats.parse_invalid_count = self.invalid;
    }
}

#[derive(Debug, Default, Clone)]
pub struct NormalizeReport {
    pub kept: usize,
    pub rejected: usize,
}

impl NormalizeReport {
    pub fn to_output(&self) -> NormalizeOutput {
        NormalizeOutput {
            kept: self.kept,
            rejected: self.rejected,
        }
    }

    pub fn apply_to_stats(&self, stats: &mut PipelineStats) {
        stats.normalize_kept_count = self.kept;
        stats.normalize_rejected_count = self.rejected;
    }
}

#[derive(Debug, Default, Clone)]
pub struct ResolveReport {
    pub resolved: usize,
    pub missed: usize,
    pub errors: usize,
}

impl ResolveReport {
    pub fn to_output(&self) -> ResolveOutput {
        ResolveOutput {
            resolved: self.resolved,
            missed: self.missed,
            errors: self.errors,
        }
    }

    pub fn apply_to_stats(&self, stats: &mut PipelineStats) {
        stats.deezer_resolved_count = self.resolved;
        stats.deezer_missed_count = self.missed;
        stats.deezer_error_count = self.errors;
    }
}

#[derive(Debug, Default, Clone)]
pub struct EnrichTracksReport {
    pub total: u64,
    pub completed: u64,
    pub fetched: usize,
    pub failed: u64,
}

impl EnrichTracksReport {
    pub fn to_output(&self) -> EnrichRequestOutput {
        EnrichRequestOutput {
            total: self.total,
            completed: self.completed,
            fetched: self.fetched,
            failed: self.failed,
        }
    }

    pub fn apply_to_stats(&self, stats: &mut PipelineStats) {
        stats.deezer_tracks_fetched_count = self.fetched;
    }
}

#[derive(Debug, Default, Clone)]
pub struct EnrichAlbumsReport {
    pub total: u64,
    pub completed: u64,
    pub fetched: usize,
    pub failed: u64,
}

impl EnrichAlbumsReport {
    pub fn to_output(&self) -> EnrichRequestOutput {
        EnrichRequestOutput {
            total: self.total,
            completed: self.completed,
            fetched: self.fetched,
            failed: self.failed,
        }
    }

    pub fn apply_to_stats(&self, stats: &mut PipelineStats) {
        stats.deezer_albums_fetched_count = self.fetched;
    }
}

#[derive(Debug, Default, Clone)]
pub struct AggregateReport {
    pub skipped: usize,
}

impl AggregateReport {
    pub fn apply_to_stats(&self, stats: &mut PipelineStats) {
        stats.interactions_skipped_count = self.skipped;
    }
}

#[derive(Debug, Default, Clone)]
pub struct VerifyReport {
    pub tracks_skipped: usize,
    pub interactions_skipped: usize,
}

impl VerifyReport {
    pub fn apply_to_stats(&self, stats: &mut PipelineStats) {
        stats.verify_tracks_skipped_count = self.tracks_skipped;
        stats.verify_interactions_skipped_count = self.interactions_skipped;
    }
}
