use crate::catalog::Id;
use crate::play::Play;

/// A play tied to a catalog track. The id is required.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Listen {
    play: Play,
    track: Id,
}

impl Listen {
    #[must_use]
    pub fn new(play: Play, track: Id) -> Self {
        Self { play, track }
    }

    #[must_use]
    pub const fn play(&self) -> &Play {
        &self.play
    }

    #[must_use]
    pub const fn track(&self) -> Id {
        self.track
    }
}
