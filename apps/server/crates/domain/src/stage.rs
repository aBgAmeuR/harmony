//! Pipeline step names shared by the job, the log, and the browser.

/// One step of `read`, then `matching`, then `enrich`, then `write`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Stage {
    Extract,
    Parse,
    Normalize,
    Resolve,
    Tracks,
    Albums,
    Persist,
}

impl Stage {
    /// Web order. Adding a step changes this length and every `match` on [`Stage`].
    pub const ALL: [Self; 7] = [
        Self::Extract,
        Self::Parse,
        Self::Normalize,
        Self::Resolve,
        Self::Tracks,
        Self::Albums,
        Self::Persist,
    ];

    /// `stepId` already stored in package snapshots.
    #[must_use]
    pub const fn step_id(self) -> &'static str {
        match self {
            Self::Extract => "extract_archive",
            Self::Parse => "parse_interactions",
            Self::Normalize => "normalize_interactions",
            Self::Resolve => "resolve_tracks",
            Self::Tracks => "enrich_tracks",
            Self::Albums => "enrich_albums",
            Self::Persist => "persist_interactions",
        }
    }

    /// Label already shown next to `step_id`.
    #[must_use]
    pub const fn label(self) -> &'static str {
        match self {
            Self::Extract => "Extract archive",
            Self::Parse => "Parse interactions",
            Self::Normalize => "Normalize interactions",
            Self::Resolve => "Resolve tracks",
            Self::Tracks => "Enrich tracks",
            Self::Albums => "Enrich albums",
            Self::Persist => "Save interactions",
        }
    }
}

impl std::fmt::Display for Stage {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter.write_str(self.step_id())
    }
}

#[cfg(test)]
mod tests {
    use super::Stage;

    #[test]
    fn all_matches_the_web_table() {
        let steps: Vec<_> = Stage::ALL
            .into_iter()
            .map(|stage| (stage.step_id(), stage.label()))
            .collect();

        assert_eq!(
            steps,
            vec![
                ("extract_archive", "Extract archive"),
                ("parse_interactions", "Parse interactions"),
                ("normalize_interactions", "Normalize interactions"),
                ("resolve_tracks", "Resolve tracks"),
                ("enrich_tracks", "Enrich tracks"),
                ("enrich_albums", "Enrich albums"),
                ("persist_interactions", "Save interactions"),
            ]
        );
    }
}
