//! Plays kept after `read`. Empty input is not a history.

use crate::play::Play;
use crate::source::NonEmpty;

/// Plays that survived extract, parse, and normalize.
///
/// `from_plays` is public so `pipeline` (another crate) can build it.
/// A `pub(crate)` constructor would be invisible there, and to `http` as well.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct History {
    plays: NonEmpty<Play>,
}

impl History {
    #[must_use]
    pub fn from_plays(plays: NonEmpty<Play>) -> Self {
        Self { plays }
    }

    #[must_use]
    pub fn into_plays(self) -> Vec<Play> {
        self.plays.into_vec()
    }
}
