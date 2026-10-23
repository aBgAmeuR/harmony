//! Deezer [`Lookup`](domain::ports::Lookup), direct or through proxies.

mod client;
mod payload;
mod retry;

use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};

use domain::catalog::{self, Artist, Catalog};
use domain::matching::pick;
use domain::ports::{Lookup, LookupError};

pub use client::Mode;

use client::Reply;

/// Deezer search and catalog load. `find` and `load` block until the gate lets them through.
#[must_use]
pub struct Deezer {
    http: client::Http,
}

impl Deezer {
    /// # Errors
    ///
    /// [`LookupError`] when the mode or the HTTP client is unusable.
    pub fn open(mode: Mode) -> Result<Self, LookupError> {
        Ok(Self {
            http: client::Http::open(mode)?,
        })
    }

    #[must_use]
    pub fn calls(&self) -> u64 {
        self.http.calls()
    }

    #[must_use]
    pub fn retries(&self) -> u64 {
        self.http.retries()
    }
}

impl Lookup for Deezer {
    fn find(&self, artist: &str, title: &str) -> Result<Option<catalog::Id>, LookupError> {
        let url = payload::search_url(artist, title)?;
        match self.http.get_json(&url)? {
            Reply::Empty => Ok(None),
            Reply::Json(value) => {
                let guesses = payload::guesses(value)?;
                Ok(pick(artist, title, &guesses))
            }
        }
    }

    fn load(&self, ids: &[catalog::Id]) -> Result<Catalog, LookupError> {
        let track_rows = fan(ids.len(), |index| {
            let Some(id) = ids.get(index) else {
                return Err(LookupError::new("track index missing"));
            };
            match self.http.get_json(&payload::track_url(id.get()))? {
                Reply::Empty => Ok(None),
                Reply::Json(value) => payload::track(value).map(Some),
            }
        })?;

        let mut tracks = Vec::new();
        let mut artists = Vec::new();
        let mut album_ids = Vec::new();
        let mut small = Vec::new();
        for row in track_rows.into_iter().flatten() {
            if !album_ids.contains(&row.album) {
                album_ids.push(row.album);
            }
            for artist in row.artists {
                upsert(&mut artists, artist);
            }
            small.extend(row.artist_small);
            tracks.push(row.track);
        }

        let albums = load_albums(self, &album_ids, &mut artists, &mut small)?;
        apply_pictures(self, &small, &mut artists);
        Ok(Catalog::new(artists, albums, tracks, Vec::new()))
    }
}

fn load_albums(
    deezer: &Deezer,
    album_ids: &[catalog::Id],
    artists: &mut Vec<Artist>,
    small: &mut Vec<(catalog::Id, String)>,
) -> Result<Vec<domain::catalog::Album>, LookupError> {
    let rows = fan(album_ids.len(), |index| {
        let Some(id) = album_ids.get(index) else {
            return Err(LookupError::new("album index missing"));
        };
        match deezer.http.get_json(&payload::album_url(id.get()))? {
            Reply::Empty => Ok(None),
            Reply::Json(value) => {
                let mut draft = payload::album(value)?;
                let pictures = std::mem::take(&mut draft.artist_small);
                let people = std::mem::take(&mut draft.artists);
                let image = deezer.http.thumbnail(&draft.cover_small);
                Ok(Some((payload::finish(draft, image), people, pictures)))
            }
        }
    })?;

    let mut albums = Vec::new();
    for row in rows.into_iter().flatten() {
        let (album, people, pictures) = row;
        for artist in people {
            upsert(artists, artist);
        }
        small.extend(pictures);
        albums.push(album);
    }
    Ok(albums)
}

fn apply_pictures(deezer: &Deezer, small: &[(catalog::Id, String)], artists: &mut [Artist]) {
    let pending = unique_pictures(small, artists);
    let Ok(pictures) = fan(pending.len(), |index| {
        let Some((id, url)) = pending.get(index) else {
            return Err(LookupError::new("picture index missing"));
        };
        Ok((*id, deezer.http.thumbnail(url)))
    }) else {
        return;
    };
    for (id, image) in pictures {
        let Some(image) = image else {
            continue;
        };
        if let Some(artist) = artists.iter_mut().find(|artist| artist.id() == id) {
            *artist = Artist::new(
                artist.id(),
                artist.name().to_owned(),
                Some(image),
                artist.uri().to_owned(),
            );
        }
    }
}

fn unique_pictures(
    small: &[(catalog::Id, String)],
    artists: &[Artist],
) -> Vec<(catalog::Id, String)> {
    let mut pending = Vec::new();
    for (id, url) in small {
        if pending.iter().any(|(have, _)| have == id) {
            continue;
        }
        let needs = artists
            .iter()
            .find(|artist| artist.id() == *id)
            .is_some_and(|artist| artist.image().is_none());
        if needs {
            pending.push((*id, url.clone()));
        }
    }
    pending
}

fn upsert(artists: &mut Vec<Artist>, incoming: Artist) {
    if let Some(slot) = artists
        .iter_mut()
        .find(|artist| artist.id() == incoming.id())
    {
        if slot.image().is_none() && incoming.image().is_some() {
            *slot = incoming;
        }
        return;
    }
    artists.push(incoming);
}

fn fan<T, F>(count: usize, work: F) -> Result<Vec<T>, LookupError>
where
    T: Send,
    F: Fn(usize) -> Result<T, LookupError> + Sync,
{
    if count == 0 {
        return Ok(Vec::new());
    }
    let workers = count.min(32);
    let next = AtomicUsize::new(0);
    let stop = AtomicBool::new(false);
    let output = Mutex::new(Vec::new());
    let failed = Mutex::new(None);
    std::thread::scope(|scope| {
        for _ in 0..workers {
            scope.spawn(|| {
                loop {
                    if stop.load(Ordering::Relaxed) {
                        break;
                    }
                    let index = next.fetch_add(1, Ordering::Relaxed);
                    if index >= count {
                        break;
                    }
                    match work(index) {
                        Ok(value) => {
                            if let Ok(mut rows) = output.lock() {
                                rows.push((index, value));
                            }
                        }
                        Err(err) => {
                            stop.store(true, Ordering::Relaxed);
                            if let Ok(mut slot) = failed.lock()
                                && slot.is_none()
                            {
                                *slot = Some(err);
                            }
                            break;
                        }
                    }
                }
            });
        }
    });
    let error = failed
        .lock()
        .map_err(|_| LookupError::new("deezer fan poisoned"))?
        .clone();
    if let Some(err) = error {
        return Err(err);
    }
    let mut rows = output
        .into_inner()
        .map_err(|_| LookupError::new("deezer fan poisoned"))?;
    rows.sort_by_key(|(index, _value)| *index);
    Ok(rows.into_iter().map(|(_index, value)| value).collect())
}
