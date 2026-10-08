use std::path::PathBuf;

use chrono::{DateTime, Utc};
use domain::catalog::{Album, Artist, Catalog, Id as TrackId, Kind, Track};
use domain::package::{Id, Package};
use domain::play::{Listen, Play, PlayError, RawPlay};
use pipeline::write::{self, WriteError};

#[derive(Debug)]
#[allow(
    dead_code,
    reason = "the harness prints this only when a fixture fails"
)]
enum Fixture {
    Io(std::io::Error),
    Json(serde_json::Error),
    Play(PlayError),
    Id(domain::package::IdError),
    Clock,
    Write(WriteError),
    Put(domain::ports::PutError),
    Get(domain::ports::GetError),
    Missing,
}

impl From<std::io::Error> for Fixture {
    fn from(error: std::io::Error) -> Self {
        Self::Io(error)
    }
}

impl From<serde_json::Error> for Fixture {
    fn from(error: serde_json::Error) -> Self {
        Self::Json(error)
    }
}

impl From<PlayError> for Fixture {
    fn from(error: PlayError) -> Self {
        Self::Play(error)
    }
}

impl From<domain::package::IdError> for Fixture {
    fn from(error: domain::package::IdError) -> Self {
        Self::Id(error)
    }
}

impl From<WriteError> for Fixture {
    fn from(error: WriteError) -> Self {
        Self::Write(error)
    }
}

impl From<domain::ports::PutError> for Fixture {
    fn from(error: domain::ports::PutError) -> Self {
        Self::Put(error)
    }
}

impl From<domain::ports::GetError> for Fixture {
    fn from(error: domain::ports::GetError) -> Self {
        Self::Get(error)
    }
}

fn play() -> Result<Play, Fixture> {
    let raw = serde_json::from_str::<RawPlay<'_>>(
        r#"{
            "ts": "2020-01-02T03:04:05Z",
            "platform": "android",
            "ms_played": 45000,
            "master_metadata_track_name": "Song",
            "master_metadata_album_artist_name": "Artist",
            "shuffle": false,
            "skipped": true,
            "offline": false
        }"#,
    )?;
    Ok(Play::try_from(raw)?)
}

fn catalog() -> Result<Catalog, Fixture> {
    let artist = TrackId::new(10);
    let album = TrackId::new(20);
    let track = TrackId::new(30);
    Ok(Catalog::new(
        vec![Artist::new(
            artist,
            "Artist".to_owned(),
            Some("data:image/jpeg;base64,aa".to_owned()),
            "https://artist".to_owned(),
        )],
        vec![Album::new(
            album,
            "Album".to_owned(),
            None,
            "https://cover".to_owned(),
            None,
            vec!["rap".to_owned()],
            1,
            180_000,
            Kind::Album,
            vec![artist],
        )],
        vec![Track::new(
            track,
            "Song".to_owned(),
            200_000,
            1,
            1,
            None,
            album,
            vec![artist],
        )],
        vec![Listen::new(play()?, track)],
    ))
}

fn package() -> Result<(Package, DateTime<Utc>), Fixture> {
    let at = DateTime::parse_from_rfc3339("2020-01-02T03:04:05Z")
        .map(|value| value.with_timezone(&Utc))
        .map_err(|_| Fixture::Clock)?;
    let package = Package::new(Id::parse("Ab3xYz")?, "history.zip".to_owned(), 128, at);
    Ok((package, at))
}

fn database() -> Result<(tempfile::TempDir, PathBuf), Fixture> {
    let dir = tempfile::TempDir::new()?;
    let path = dir.path().join("package.duckdb");
    Ok((dir, path))
}

#[test]
fn apply_and_reread_v_tracks_info() -> Result<(), Fixture> {
    let (catalog, (package, started), (_dir, path)) = (catalog()?, package()?, database()?);
    let artifact = write::run(&catalog, &package, started, 10, "[]", &path)?;
    assert_eq!(artifact.path(), path.as_path());

    let conn = duckdb::Connection::open(&path).map_err(WriteError::from)?;
    let mut stmt = conn
        .prepare(
            "SELECT track_name, album_title, track_artists_description, album_artists_description, image_uri
             FROM v_tracks_info",
        )
        .map_err(WriteError::from)?;
    let mut rows = stmt.query([]).map_err(WriteError::from)?;
    let Some(row) = rows.next().map_err(WriteError::from)? else {
        return Err(Fixture::Missing);
    };
    let track_name: String = row.get(0).map_err(WriteError::from)?;
    let album_title: String = row.get(1).map_err(WriteError::from)?;
    let track_artists: String = row.get(2).map_err(WriteError::from)?;
    let album_artists: String = row.get(3).map_err(WriteError::from)?;
    let image_uri: String = row.get(4).map_err(WriteError::from)?;
    assert_eq!(track_name, "Song");
    assert_eq!(album_title, "Album");
    assert_eq!(track_artists, "Artist");
    assert_eq!(album_artists, "Artist");
    assert_eq!(image_uri, "https://cover");

    let track_seconds: i32 = conn
        .query_row("SELECT duration FROM tracks", [], |row| row.get(0))
        .map_err(WriteError::from)?;
    let album_seconds: i32 = conn
        .query_row("SELECT duration FROM albums", [], |row| row.get(0))
        .map_err(WriteError::from)?;
    assert_eq!(track_seconds, 200);
    assert_eq!(album_seconds, 180);
    Ok(())
}

#[test]
fn blob_get_reads_the_written_file() -> Result<(), Fixture> {
    use domain::ports::Blob;

    let (catalog, (package, started), (dir, path)) = (catalog()?, package()?, database()?);
    let artifact = write::run(&catalog, &package, started, 10, "[]", &path)?;
    let store = adapters::fs::Fs::open(dir.path())?;
    store.put(package.id(), &artifact)?;
    let loaded = store.get(package.id())?;
    assert_eq!(std::fs::read(loaded.path())?, std::fs::read(&path)?);
    Ok(())
}

#[test]
fn inserts_one_row_per_table() -> Result<(), Fixture> {
    let (catalog, (package, started), (_dir, path)) = (catalog()?, package()?, database()?);
    let artifact = write::run(&catalog, &package, started, 10, "[]", &path)?;
    assert_eq!(artifact.path(), path.as_path());

    let conn = duckdb::Connection::open(&path).map_err(WriteError::from)?;
    for table in [
        "artists",
        "albums",
        "tracks",
        "interactions",
        "package_meta",
    ] {
        let mut stmt = conn
            .prepare(&format!("SELECT count(*) FROM {table}"))
            .map_err(WriteError::from)?;
        let count: i64 = stmt
            .query_row([], |row| row.get(0))
            .map_err(WriteError::from)?;
        assert_eq!(count, 1, "{table}");
    }
    Ok(())
}
