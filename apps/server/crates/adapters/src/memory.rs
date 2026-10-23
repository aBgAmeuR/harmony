//! In-memory [`Lookup`](domain::ports::Lookup). `find` uses the same 0.8 rule as Deezer will.

use std::sync::atomic::{AtomicU64, Ordering};

use domain::catalog::{Catalog, Id};
use domain::matching::{Guess, pick};
use domain::ports::{Lookup, LookupError};

/// Scripted search rows and the catalog `load` slices by id.
pub struct Memory {
    guesses: Vec<Guess>,
    catalog: Catalog,
    find_error: Option<String>,
    load_error: Option<String>,
    finds: AtomicU64,
}

impl Memory {
    #[must_use]
    pub fn ready(guesses: Vec<Guess>, catalog: Catalog) -> Self {
        Self {
            guesses,
            catalog,
            find_error: None,
            load_error: None,
            finds: AtomicU64::new(0),
        }
    }

    #[must_use]
    pub fn find_fails(message: impl Into<String>) -> Self {
        Self {
            guesses: Vec::new(),
            catalog: Catalog::new(Vec::new(), Vec::new(), Vec::new(), Vec::new()),
            find_error: Some(message.into()),
            load_error: None,
            finds: AtomicU64::new(0),
        }
    }

    #[must_use]
    pub fn load_fails(message: impl Into<String>, catalog: Catalog) -> Self {
        Self {
            guesses: Vec::new(),
            catalog,
            find_error: None,
            load_error: Some(message.into()),
            finds: AtomicU64::new(0),
        }
    }

    #[must_use]
    pub fn finds(&self) -> u64 {
        self.finds.load(Ordering::Relaxed)
    }
}

impl Lookup for Memory {
    fn find(&self, artist: &str, title: &str) -> Result<Option<Id>, LookupError> {
        self.finds.fetch_add(1, Ordering::Relaxed);
        if let Some(message) = &self.find_error {
            return Err(LookupError::new(message.clone()));
        }
        Ok(pick(artist, title, &self.guesses))
    }

    fn load(&self, ids: &[Id]) -> Result<Catalog, LookupError> {
        if let Some(message) = &self.load_error {
            return Err(LookupError::new(message.clone()));
        }

        let mut tracks = Vec::new();
        for track in self.catalog.tracks() {
            if ids.contains(&track.id()) {
                tracks.push(track.clone());
            }
        }
        let mut albums = Vec::new();
        for album in self.catalog.albums() {
            if tracks.iter().any(|track| track.album() == album.id()) {
                albums.push(album.clone());
            }
        }
        let artists = artists_for(&self.catalog, &tracks, &albums);
        Ok(Catalog::new(artists, albums, tracks, Vec::new()))
    }
}

fn artists_for(
    catalog: &Catalog,
    tracks: &[domain::catalog::Track],
    albums: &[domain::catalog::Album],
) -> Vec<domain::catalog::Artist> {
    let mut ids = Vec::new();
    for track in tracks {
        for id in track.artists() {
            if !ids.contains(id) {
                ids.push(*id);
            }
        }
    }
    for album in albums {
        for id in album.artists() {
            if !ids.contains(id) {
                ids.push(*id);
            }
        }
    }
    let mut artists = Vec::new();
    for artist in catalog.artists() {
        if ids.contains(&artist.id()) {
            artists.push(artist.clone());
        }
    }
    artists
}
