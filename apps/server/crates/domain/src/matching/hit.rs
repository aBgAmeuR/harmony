use crate::catalog::Id;
use crate::play::Play;

/// A play linked to one catalog track.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Hit {
    play: Play,
    track: Id,
}

impl Hit {
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

    #[must_use]
    pub fn into_play(self) -> Play {
        self.play
    }
}
