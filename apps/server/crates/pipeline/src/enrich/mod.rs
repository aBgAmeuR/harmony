//! Turn hits into a catalog of listens. A missing album or image does not fail the job.

mod albums;
mod thumbnail;
mod tracks;

use std::time::Instant;

use domain::catalog::{Artist, Catalog};
use domain::fail::Fail;
use domain::matching::Match;
use domain::play::Listen;
use domain::ports::{Lookup, LookupError};
use domain::stage::Stage;

use crate::live::{self, Live};

pub use thumbnail::data_url;

/// `load` failed while filling tracks or albums.
#[derive(Debug, thiserror::Error)]
pub enum EnrichError {
    #[error("tracks: {0}")]
    Tracks(LookupError),
    #[error("albums: {0}")]
    Albums(LookupError),
}

impl EnrichError {
    #[must_use]
    pub const fn stage(&self) -> Stage {
        match self {
            Self::Tracks(_) => Stage::Tracks,
            Self::Albums(_) => Stage::Albums,
        }
    }
}

impl From<EnrichError> for Fail {
    fn from(err: EnrichError) -> Self {
        Fail::new(err.stage(), err.to_string())
    }
}

/// Load the hit ids, drop tracks with no album, and drop listens whose track is gone.
///
/// # Errors
///
/// [`EnrichError::Tracks`] when `load` fails.
pub fn run(
    matched: Match,
    lookup: &impl Lookup,
    live: &mut Live<'_>,
) -> Result<Catalog, EnrichError> {
    let (hits, _missed) = matched.into_hits();
    let mut ids = Vec::new();
    for hit in &hits {
        let id = hit.track();
        if !ids.contains(&id) {
            ids.push(id);
        }
    }

    live.begin(Stage::Tracks);
    let started = Instant::now();
    let loaded = {
        let _entered = tracing::info_span!("enrich_tracks").entered();
        match lookup.load(&ids) {
            Ok(catalog) => catalog,
            Err(err) => return Err(refuse(live, EnrichError::Tracks(err))),
        }
    };
    let (artists, albums, tracks, _listens) = loaded.into_parts();
    let read_tracks = live::count(tracks.len());
    let tracks = tracks::keep(tracks, &albums);
    let keep_tracks = live::count(tracks.len());
    live.end(
        Stage::Tracks,
        started,
        read_tracks,
        keep_tracks,
        read_tracks.saturating_sub(keep_tracks),
    );

    live.begin(Stage::Albums);
    let started = Instant::now();
    let read_albums = live::count(albums.len());
    let albums = {
        let _entered = tracing::info_span!("enrich_albums").entered();
        albums::keep(albums, &tracks)
    };
    let keep_albums = live::count(albums.len());
    live.end(
        Stage::Albums,
        started,
        read_albums,
        keep_albums,
        read_albums.saturating_sub(keep_albums),
    );
    let artists = keep_artists(artists, &tracks, &albums);

    let mut listens = Vec::new();
    for hit in hits {
        let id = hit.track();
        if tracks.iter().any(|track| track.id() == id) {
            listens.push(Listen::new(hit.into_play(), id));
        }
    }

    Ok(Catalog::new(artists, albums, tracks, listens))
}

fn refuse(live: &Live<'_>, err: EnrichError) -> EnrichError {
    live.fail(&Fail::new(err.stage(), err.to_string()));
    err
}

fn keep_artists(
    artists: Vec<Artist>,
    tracks: &[domain::catalog::Track],
    albums: &[domain::catalog::Album],
) -> Vec<Artist> {
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
    let mut kept = Vec::new();
    for artist in artists {
        if ids.contains(&artist.id()) {
            kept.push(artist);
        }
    }
    kept
}
