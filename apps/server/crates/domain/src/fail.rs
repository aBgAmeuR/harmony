//! Terminal pipeline error. Built only from `impl From` of a stage error.

use crate::stage::Stage;

/// One failed step. Logged once, then copied onto the package.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("{stage}: {message}")]
pub struct Fail {
    stage: Stage,
    message: String,
}

impl Fail {
    /// Single constructor. Stage errors call this from `From`, never with a struct literal.
    #[must_use]
    pub fn new(stage: Stage, message: String) -> Self {
        Self { stage, message }
    }

    #[must_use]
    pub const fn stage(&self) -> Stage {
        self.stage
    }

    #[must_use]
    pub fn message(&self) -> &str {
        &self.message
    }
}

#[cfg(test)]
mod tests {
    use super::Fail;
    use crate::stage::Stage;

    #[test]
    fn display_joins_stage_and_message() {
        let fail = Fail::new(Stage::Parse, "invalid JSON".to_owned());

        assert_eq!(fail.stage(), Stage::Parse);
        assert_eq!(fail.message(), "invalid JSON");
        assert_eq!(fail.to_string(), "parse_interactions: invalid JSON");
    }
}
