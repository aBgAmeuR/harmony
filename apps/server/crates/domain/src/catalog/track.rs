use chrono::NaiveDate;

use super::Id;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Track {
    id: Id,
    title: String,
    ms: u32,
    position: u16,
    disk: u16,
    release: Option<NaiveDate>,
    album: Id,
    artists: Vec<Id>,
}

impl Track {
    #[expect(
        clippy::too_many_arguments,
        reason = "one constructor lists every track field"
    )]
    #[must_use]
    pub fn new(
        id: Id,
        title: String,
        ms: u32,
        position: u16,
        disk: u16,
        release: Option<NaiveDate>,
        album: Id,
        artists: Vec<Id>,
    ) -> Self {
        Self {
            id,
            title,
            ms,
            position,
            disk,
            release,
            album,
            artists,
        }
    }

    #[must_use]
    pub const fn id(&self) -> Id {
        self.id
    }

    #[must_use]
    pub fn title(&self) -> &str {
        &self.title
    }

    #[must_use]
    pub const fn ms(&self) -> u32 {
        self.ms
    }

    #[must_use]
    pub const fn position(&self) -> u16 {
        self.position
    }

    #[must_use]
    pub const fn disk(&self) -> u16 {
        self.disk
    }

    #[must_use]
    pub const fn release(&self) -> Option<NaiveDate> {
        self.release
    }

    #[must_use]
    pub const fn album(&self) -> Id {
        self.album
    }

    #[must_use]
    pub fn artists(&self) -> &[Id] {
        &self.artists
    }
}
