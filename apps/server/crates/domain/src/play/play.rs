//! A play that passed artist, title, and duration checks.

use chrono::{DateTime, NaiveDateTime, Utc};

use super::platform::Platform;
use super::raw::RawPlay;

const MIN_MS: i64 = 30_000;

/// One kept listen, before it is tied to a catalog track.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Play {
    at: DateTime<Utc>,
    platform: Platform,
    ms: u32,
    artist: String,
    title: String,
    shuffle: bool,
    skip: bool,
    offline: bool,
}

/// `Play::try_from` rejected a [`RawPlay`].
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
pub enum PlayError {
    #[error("artist is empty")]
    Artist,
    #[error("title is empty")]
    Title,
    #[error("play is 30s or shorter")]
    Duration,
    #[error("timestamp is not a date")]
    Clock,
}

impl Play {
    #[must_use]
    pub const fn at(&self) -> DateTime<Utc> {
        self.at
    }

    #[must_use]
    pub const fn platform(&self) -> Platform {
        self.platform
    }

    #[must_use]
    pub const fn ms(&self) -> u32 {
        self.ms
    }

    #[must_use]
    pub fn artist(&self) -> &str {
        &self.artist
    }

    #[must_use]
    pub fn title(&self) -> &str {
        &self.title
    }

    #[must_use]
    pub const fn shuffle(&self) -> bool {
        self.shuffle
    }

    #[must_use]
    pub const fn skip(&self) -> bool {
        self.skip
    }

    #[must_use]
    pub const fn offline(&self) -> bool {
        self.offline
    }
}

impl TryFrom<RawPlay> for Play {
    type Error = PlayError;

    fn try_from(raw: RawPlay) -> Result<Self, Self::Error> {
        let artist = required(raw.artist, PlayError::Artist)?;
        let title = required(raw.title, PlayError::Title)?;
        if raw.ms <= MIN_MS {
            return Err(PlayError::Duration);
        }
        let Ok(ms) = u32::try_from(raw.ms) else {
            return Err(PlayError::Duration);
        };
        let at = clock(&raw.at)?;

        Ok(Self {
            at,
            platform: Platform::from(raw.platform.as_str()),
            ms,
            artist,
            title,
            shuffle: raw.shuffle,
            skip: raw.skip,
            offline: raw.offline,
        })
    }
}

fn required(value: Option<String>, error: PlayError) -> Result<String, PlayError> {
    let Some(text) = value else {
        return Err(error);
    };
    let trimmed = text.trim();
    if trimmed.is_empty() {
        return Err(error);
    }
    if trimmed.len() == text.len() {
        return Ok(text);
    }
    Ok(trimmed.to_owned())
}

const NAIVE_CLOCKS: [&str; 4] = [
    "%Y-%m-%dT%H:%M:%S%.f",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%d %H:%M:%S%.f",
    "%Y-%m-%d %H:%M:%S",
];

fn clock(value: &str) -> Result<DateTime<Utc>, PlayError> {
    let text = value.trim();
    if let Ok(parsed) = DateTime::parse_from_rfc3339(text) {
        return Ok(parsed.with_timezone(&Utc));
    }

    for format in NAIVE_CLOCKS {
        if let Ok(parsed) = NaiveDateTime::parse_from_str(text, format) {
            return Ok(parsed.and_utc());
        }
    }
    Err(PlayError::Clock)
}

#[cfg(test)]
mod tests {
    use super::{Play, PlayError};
    use crate::play::Platform;
    use crate::play::raw::RawPlay;

    fn raw() -> RawPlay {
        RawPlay {
            at: "2020-01-02T03:04:05Z".to_owned(),
            platform: "windows".to_owned(),
            ms: 30_001,
            artist: Some("Artist".to_owned()),
            title: Some(" Song ".to_owned()),
            shuffle: false,
            skip: true,
            offline: false,
        }
    }

    #[test]
    fn try_from_keeps_a_play_over_thirty_seconds() {
        let play = Play::try_from(raw());

        assert!(matches!(
            play,
            Ok(play)
                if play.at().to_rfc3339() == "2020-01-02T03:04:05+00:00"
                    && play.platform() == Platform::Windows
                    && play.ms() == 30_001
                    && play.artist() == "Artist"
                    && play.title() == "Song"
                    && play.skip()
                    && !play.shuffle()
                    && !play.offline()
        ));
    }

    #[test]
    fn try_from_rejects_a_missing_artist() {
        let mut value = raw();
        value.artist = None;

        assert_eq!(Play::try_from(value), Err(PlayError::Artist));
    }

    #[test]
    fn try_from_rejects_a_blank_title() {
        let value = raw().with_title("  ".to_owned());

        assert_eq!(Play::try_from(value), Err(PlayError::Title));
    }

    #[test]
    fn try_from_rejects_thirty_seconds() {
        let mut value = raw();
        value.ms = 30_000;

        assert_eq!(Play::try_from(value), Err(PlayError::Duration));
    }

    #[test]
    fn try_from_rejects_a_bad_clock() {
        let mut value = raw();
        value.at = "yesterday".to_owned();

        assert_eq!(Play::try_from(value), Err(PlayError::Clock));
    }
}
