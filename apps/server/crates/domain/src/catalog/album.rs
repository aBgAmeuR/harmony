use chrono::NaiveDate;

use super::Id;

/// Deezer `record_type`, stored as `Album` or `Single`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Kind {
    Album,
    Single,
}

impl Kind {
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Album => "Album",
            Self::Single => "Single",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Album {
    id: Id,
    title: String,
    image: Option<String>,
    uri: String,
    release: Option<NaiveDate>,
    genres: Vec<String>,
    tracks: u16,
    ms: u32,
    kind: Kind,
    artists: Vec<Id>,
}

impl Album {
    #[expect(
        clippy::too_many_arguments,
        reason = "one constructor lists every album field"
    )]
    #[must_use]
    pub fn new(
        id: Id,
        title: String,
        image: Option<String>,
        uri: String,
        release: Option<NaiveDate>,
        genres: Vec<String>,
        tracks: u16,
        ms: u32,
        kind: Kind,
        artists: Vec<Id>,
    ) -> Self {
        Self {
            id,
            title,
            image,
            uri,
            release,
            genres,
            tracks,
            ms,
            kind,
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
    pub fn image(&self) -> Option<&str> {
        self.image.as_deref()
    }

    #[must_use]
    pub fn uri(&self) -> &str {
        &self.uri
    }

    #[must_use]
    pub const fn release(&self) -> Option<NaiveDate> {
        self.release
    }

    #[must_use]
    pub fn genres(&self) -> &[String] {
        &self.genres
    }

    #[must_use]
    pub const fn tracks(&self) -> u16 {
        self.tracks
    }

    #[must_use]
    pub const fn ms(&self) -> u32 {
        self.ms
    }

    #[must_use]
    pub const fn kind(&self) -> Kind {
        self.kind
    }

    #[must_use]
    pub fn artists(&self) -> &[Id] {
        &self.artists
    }
}
