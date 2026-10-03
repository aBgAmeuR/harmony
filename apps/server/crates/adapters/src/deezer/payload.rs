//! Frozen Deezer JSON becomes catalog rows. `duration` from Deezer is seconds;
//! the domain stores milliseconds, and `write` divides back to the seconds column.

use chrono::NaiveDate;
use domain::catalog::{self, Album, Artist, Kind, Track};
use domain::matching::Guess;
use domain::ports::LookupError;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct SearchBody {
    #[serde(default)]
    data: Vec<SearchHit>,
}

#[derive(Debug, Deserialize)]
struct SearchHit {
    id: i64,
    title: String,
    artist: Named,
}

#[derive(Debug, Deserialize)]
struct Named {
    name: String,
}

#[derive(Debug, Deserialize)]
struct ApiArtist {
    id: i64,
    name: String,
    #[serde(default)]
    picture: String,
    #[serde(default)]
    picture_small: String,
}

#[derive(Debug, Deserialize)]
struct ApiAlbumRef {
    id: i64,
}

#[derive(Debug, Deserialize)]
struct ApiTrack {
    id: i64,
    title: String,
    duration: i64,
    track_position: i64,
    disk_number: i64,
    #[serde(default)]
    release_date: Option<String>,
    #[serde(default)]
    contributors: Vec<ApiArtist>,
    artist: ApiArtist,
    album: ApiAlbumRef,
}

#[derive(Debug, Deserialize)]
struct ApiGenre {
    name: String,
}

#[derive(Debug, Deserialize)]
struct ApiGenres {
    #[serde(default)]
    data: Vec<ApiGenre>,
}

#[derive(Debug, Deserialize)]
struct ApiAlbum {
    id: i64,
    title: String,
    cover: String,
    #[serde(default)]
    cover_small: String,
    #[serde(default)]
    release_date: Option<String>,
    nb_tracks: i64,
    duration: i64,
    record_type: String,
    genres: ApiGenres,
    artist: ApiArtist,
    #[serde(default)]
    contributors: Vec<ApiArtist>,
}

pub(crate) struct TrackRow {
    pub track: Track,
    pub artists: Vec<Artist>,
    pub album: catalog::Id,
    pub artist_small: Vec<(catalog::Id, String)>,
}

pub(crate) struct AlbumDraft {
    pub id: catalog::Id,
    pub title: String,
    pub uri: String,
    pub release: Option<NaiveDate>,
    pub genres: Vec<String>,
    pub tracks: u16,
    pub ms: u32,
    pub kind: Kind,
    pub artist_ids: Vec<catalog::Id>,
    pub artists: Vec<Artist>,
    pub cover_small: String,
    pub artist_small: Vec<(catalog::Id, String)>,
}

pub(crate) fn guesses(value: serde_json::Value) -> Result<Vec<Guess>, LookupError> {
    let body: SearchBody =
        serde_json::from_value(value).map_err(|err| LookupError::new(err.to_string()))?;
    let mut rows = Vec::new();
    for hit in body.data {
        let Ok(id) = fit_id(hit.id) else {
            continue;
        };
        rows.push(Guess::new(id, hit.artist.name, hit.title));
    }
    Ok(rows)
}

pub(crate) fn track(value: serde_json::Value) -> Result<TrackRow, LookupError> {
    let api: ApiTrack =
        serde_json::from_value(value).map_err(|err| LookupError::new(err.to_string()))?;
    let id = fit_id(api.id)?;
    let album = fit_id(api.album.id)?;
    let people = people(&api.artist, &api.contributors)?;
    Ok(TrackRow {
        track: Track::new(
            id,
            api.title,
            milliseconds(api.duration)?,
            fit_u16(api.track_position, "track position")?,
            fit_u16(api.disk_number, "disk")?,
            date(api.release_date),
            album,
            people.ids,
        ),
        artists: people.artists,
        album,
        artist_small: people.small,
    })
}

pub(crate) fn album(value: serde_json::Value) -> Result<AlbumDraft, LookupError> {
    let api: ApiAlbum =
        serde_json::from_value(value).map_err(|err| LookupError::new(err.to_string()))?;
    let people = people(&api.artist, &api.contributors)?;
    Ok(AlbumDraft {
        id: fit_id(api.id)?,
        title: api.title,
        uri: api.cover,
        release: date(api.release_date),
        genres: api
            .genres
            .data
            .into_iter()
            .map(|genre| genre.name)
            .collect(),
        tracks: fit_u16(api.nb_tracks, "track count")?,
        ms: milliseconds(api.duration)?,
        kind: kind(&api.record_type),
        artist_ids: people.ids,
        artists: people.artists,
        cover_small: api.cover_small,
        artist_small: people.small,
    })
}

pub(crate) fn finish(draft: AlbumDraft, image: Option<String>) -> Album {
    Album::new(
        draft.id,
        draft.title,
        image,
        draft.uri,
        draft.release,
        draft.genres,
        draft.tracks,
        draft.ms,
        draft.kind,
        draft.artist_ids,
    )
}

struct People {
    ids: Vec<catalog::Id>,
    artists: Vec<Artist>,
    small: Vec<(catalog::Id, String)>,
}

fn people(main: &ApiArtist, contributors: &[ApiArtist]) -> Result<People, LookupError> {
    let source = if contributors.is_empty() {
        std::slice::from_ref(main)
    } else {
        contributors
    };
    let mut ids = Vec::new();
    let mut artists = Vec::new();
    let mut small = Vec::new();
    for artist in source {
        let id = fit_id(artist.id)?;
        ids.push(id);
        artists.push(Artist::new(
            id,
            artist.name.clone(),
            None,
            artist.picture.clone(),
        ));
        let picture = artist.picture_small.trim();
        if !picture.is_empty() {
            small.push((id, picture.to_owned()));
        }
    }
    Ok(People {
        ids,
        artists,
        small,
    })
}

fn kind(record_type: &str) -> Kind {
    if record_type.eq_ignore_ascii_case("single") {
        Kind::Single
    } else {
        Kind::Album
    }
}

fn fit_id(value: i64) -> Result<catalog::Id, LookupError> {
    let raw = u32::try_from(value)
        .map_err(|_| LookupError::new(format!("deezer id {value} does not fit")))?;
    Ok(catalog::Id::new(raw))
}

fn fit_u16(value: i64, field: &str) -> Result<u16, LookupError> {
    u16::try_from(value).map_err(|_| LookupError::new(format!("deezer {field} does not fit")))
}

fn milliseconds(seconds: i64) -> Result<u32, LookupError> {
    let seconds =
        u32::try_from(seconds).map_err(|_| LookupError::new("deezer duration does not fit"))?;
    seconds
        .checked_mul(1_000)
        .ok_or_else(|| LookupError::new("deezer duration does not fit"))
}

fn date(value: Option<String>) -> Option<NaiveDate> {
    let text = value?;
    let trimmed = text.trim();
    if trimmed.is_empty() {
        None
    } else {
        NaiveDate::parse_from_str(trimmed, "%Y-%m-%d").ok()
    }
}

pub(crate) fn search_url(artist: &str, title: &str) -> Result<String, LookupError> {
    let artist = artist.replace('"', "");
    let title = title.replace('"', "");
    let mut url = reqwest::Url::parse("https://api.deezer.com/search")
        .map_err(|err| LookupError::new(err.to_string()))?;
    let query = format!("\"{artist}\" \"{title}\"");
    url.query_pairs_mut()
        .append_pair("q", &query)
        .append_pair("strict", "on");
    Ok(url.to_string())
}

pub(crate) fn track_url(id: u32) -> String {
    format!("https://api.deezer.com/track/{id}")
}

pub(crate) fn album_url(id: u32) -> String {
    format!("https://api.deezer.com/album/{id}")
}

#[cfg(test)]
mod tests {
    use super::{album, guesses, search_url, track};
    use domain::catalog::{Id, Kind};
    use domain::matching::pick;
    use domain::ports::LookupError;

    #[test]
    fn frozen_search_picks_ken_carson() -> Result<(), LookupError> {
        let value = serde_json::json!({
            "data": [
                {"id": 2, "title": "me n my kup (808 mix)", "artist": {"name": "JadonGot556"}},
                {"id": 1, "title": "Me N My Kup", "artist": {"name": "Ken Carson"}},
                {"id": 3, "title": "Me n my kup", "artist": {"name": "LuhMaru"}}
            ]
        });
        let rows = guesses(value)?;
        assert_eq!(pick("Ken Carson", "Me N My Kup", &rows), Some(Id::new(1)));
        Ok(())
    }

    #[test]
    fn search_url_quotes_artist_and_title() -> Result<(), String> {
        let raw = search_url("Ken Carson", "Me N My Kup").map_err(|err| err.to_string())?;
        let url = reqwest::Url::parse(&raw).map_err(|err| err.to_string())?;
        let query: Vec<(String, String)> = url
            .query_pairs()
            .map(|(key, value)| (key.into_owned(), value.into_owned()))
            .collect();
        assert_eq!(
            query,
            vec![
                ("q".to_owned(), "\"Ken Carson\" \"Me N My Kup\"".to_owned()),
                ("strict".to_owned(), "on".to_owned()),
            ]
        );
        Ok(())
    }

    #[test]
    fn track_duration_is_milliseconds() -> Result<(), LookupError> {
        let value = serde_json::json!({
            "id": 30,
            "title": "Song",
            "duration": 200,
            "track_position": 1,
            "disk_number": 1,
            "release_date": "2020-01-02",
            "artist": {"id": 10, "name": "Artist", "picture": "https://artist", "picture_small": "https://small"},
            "contributors": [],
            "album": {"id": 20}
        });
        let row = track(value)?;
        assert_eq!(row.track.ms(), 200_000);
        assert_eq!(row.album, Id::new(20));
        assert_eq!(row.artists.len(), 1);
        Ok(())
    }

    #[test]
    fn album_single_keeps_seconds_as_milliseconds() -> Result<(), LookupError> {
        let value = serde_json::json!({
            "id": 20,
            "title": "Album",
            "cover": "https://cover",
            "cover_small": "https://cover-small",
            "release_date": "2020-01-02",
            "nb_tracks": 1,
            "duration": 180,
            "record_type": "single",
            "genres": {"data": [{"name": "rap"}]},
            "artist": {"id": 10, "name": "Artist", "picture": "https://artist", "picture_small": "https://small"},
            "contributors": []
        });
        let draft = album(value)?;
        assert_eq!(draft.ms, 180_000);
        assert_eq!(draft.kind, Kind::Single);
        assert_eq!(draft.genres, vec!["rap".to_owned()]);
        assert_eq!(draft.cover_small, "https://cover-small");
        Ok(())
    }
}
