//! Package lifecycle as stored and shown to the client.

/// `Queued` is written `pending`. `Ready` is written `completed`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum State {
    Queued,
    Running,
    Ready,
    Failed,
}

impl State {
    /// Wire value: `pending`, `running`, `completed`, or `failed`.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Queued => "pending",
            Self::Running => "running",
            Self::Ready => "completed",
            Self::Failed => "failed",
        }
    }
}

impl std::fmt::Display for State {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter.write_str(self.as_str())
    }
}

#[cfg(test)]
mod tests {
    use super::State;

    #[test]
    fn wire_names_match_the_client() {
        assert_eq!(State::Queued.as_str(), "pending");
        assert_eq!(State::Running.as_str(), "running");
        assert_eq!(State::Ready.as_str(), "completed");
        assert_eq!(State::Failed.as_str(), "failed");
    }
}
