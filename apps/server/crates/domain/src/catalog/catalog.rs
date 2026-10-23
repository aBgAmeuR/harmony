use super::{Album, Artist, Track};
use crate::play::Listen;

/// Artists, albums, tracks, and the listens that point at a track.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Catalog {
    artists: Vec<Artist>,
    albums: Vec<Album>,
    tracks: Vec<Track>,
    listens: Vec<Listen>,
}

impl Catalog {
    #[must_use]
    pub fn new(
        artists: Vec<Artist>,
        albums: Vec<Album>,
        tracks: Vec<Track>,
        listens: Vec<Listen>,
    ) -> Self {
        Self {
            artists,
            albums,
            tracks,
            listens,
        }
    }

    #[must_use]
    pub fn artists(&self) -> &[Artist] {
        &self.artists
    }

    #[must_use]
    pub fn albums(&self) -> &[Album] {
        &self.albums
    }

    #[must_use]
    pub fn tracks(&self) -> &[Track] {
        &self.tracks
    }

    #[must_use]
    pub fn listens(&self) -> &[Listen] {
        &self.listens
    }

    #[must_use]
    pub fn into_parts(self) -> (Vec<Artist>, Vec<Album>, Vec<Track>, Vec<Listen>) {
        (self.artists, self.albums, self.tracks, self.listens)
    }
}
