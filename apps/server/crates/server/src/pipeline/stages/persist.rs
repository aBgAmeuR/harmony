use std::collections::HashMap;
use std::path::{Path, PathBuf};

use chrono::{DateTime, NaiveDateTime, Utc};
use duckdb::params;
use tempfile::TempDir;

use crate::pipeline::error::PersistError;
use crate::pipeline::report::PersistOutput;
use crate::pipeline::types::{
    DeezerAlbum, DeezerAlbumType, DeezerArtist, DeezerTrack, Interaction,
};
use crate::storage::{ObjectStore, S3ObjectStore};

pub struct PersistInput {
    pub public_id: String,
    pub interactions: Vec<Interaction>,
    pub tracks: HashMap<i64, DeezerTrack>,
    pub artists: HashMap<i64, DeezerArtist>,
    pub albums: HashMap<i64, DeezerAlbum>,
}

/// Package page fields stored beside the listening tables.
pub struct PackageMeta {
    pub public_id: String,
    pub file_name: String,
    pub file_size: i32,
    pub created_at: NaiveDateTime,
    pub started_at: NaiveDateTime,
    pub total_duration_ms: u64,
    pub steps: serde_json::Value,
}

pub struct PersistArtifact {
    _temp_dir: TempDir,
    pub db_path: PathBuf,
    pub object_key: String,
}

/// Build a DuckDB artifact on a blocking thread.
pub fn build(input: PersistInput) -> Result<(PersistArtifact, PersistOutput), PersistError> {
    let temp_dir = TempDir::new()?;
    let db_path = temp_dir.path().join("package.duckdb");

    {
        let conn = duckdb::Connection::open(&db_path)?;
        create_tables(&conn)?;
        insert_artists(&conn, &input.artists)?;
        insert_albums(&conn, &input.albums)?;
        insert_tracks(&conn, &input.tracks)?;
        insert_interactions(&conn, &input.interactions)?;
        create_views(&conn)?;
    }

    let output = PersistOutput {
        interactions: input.interactions.len(),
        tracks: input.tracks.len(),
        albums: input.albums.len(),
        artists: input.artists.len(),
    };

    let object_key = format!("harmony/{}.duckdb", input.public_id);
    Ok((
        PersistArtifact {
            _temp_dir: temp_dir,
            db_path,
            object_key,
        },
        output,
    ))
}

/// Insert the package-page snapshot into a DuckDB file that already has tables.
pub fn write_package_meta(db_path: &Path, meta: &PackageMeta) -> Result<(), PersistError> {
    let conn = duckdb::Connection::open(db_path)?;
    conn.execute(
        "INSERT INTO package_meta (
            public_id, file_name, file_size, status, created_at, started_at, total_duration_ms, steps
         ) VALUES (
            ?, ?, ?, 'completed',
            CAST(? AS TIMESTAMP), CAST(? AS TIMESTAMP), ?,
            json(?)
         )",
        params![
            meta.public_id,
            meta.file_name,
            meta.file_size,
            timestamp_param(meta.created_at),
            timestamp_param(meta.started_at),
            meta.total_duration_ms as i64,
            meta.steps.to_string(),
        ],
    )?;
    Ok(())
}

/// Upload a built DuckDB artifact to object storage.
pub async fn upload(
    object_store: &S3ObjectStore,
    artifact: &PersistArtifact,
) -> Result<(), PersistError> {
    object_store
        .put_file(&artifact.object_key, &artifact.db_path)
        .await?;
    tracing::info!(
        object_key = %artifact.object_key,
        "persisted package data to object storage"
    );
    Ok(())
}

fn insert_artists(
    conn: &duckdb::Connection,
    artists: &HashMap<i64, DeezerArtist>,
) -> Result<(), PersistError> {
    let mut stmt =
        conn.prepare("INSERT INTO artists (id, name, image, image_uri) VALUES (?, ?, ?, ?)")?;
    for (id, artist) in artists {
        stmt.execute(params![
            *id as u32,
            artist.name,
            artist.image,
            artist.image_uri
        ])?;
    }
    Ok(())
}

fn insert_albums(
    conn: &duckdb::Connection,
    albums: &HashMap<i64, DeezerAlbum>,
) -> Result<(), PersistError> {
    for (id, album) in albums {
        let sql = format!(
            "INSERT INTO albums (id, title, image, image_uri, release_date, genres, nb_tracks, duration, album_type, artists)
             VALUES (?, ?, ?, ?, CAST(? AS DATE), {genres}, ?, ?, ?, {artists})",
            genres = sql_varchar_list(&album.genres),
            artists = sql_uinteger_list(&album.artists),
        );
        conn.execute(
            &sql,
            params![
                *id as u32,
                album.title,
                album.image,
                album.image_uri,
                parse_date(album.release_date.as_deref()),
                album.nb_tracks as i32,
                album.duration as i32,
                album_type_label(&album.album_type),
            ],
        )?;
    }
    Ok(())
}

fn insert_tracks(
    conn: &duckdb::Connection,
    tracks: &HashMap<i64, DeezerTrack>,
) -> Result<(), PersistError> {
    for (id, track) in tracks {
        let artists = sql_uinteger_list(&track.artists);
        let sql = format!(
            "INSERT INTO tracks (id, title, duration, track_position, disk_number, release_date, album_id, artists)
             VALUES (?, ?, ?, ?, ?, CAST(? AS DATE), ?, {artists})"
        );
        conn.execute(
            &sql,
            params![
                *id as u32,
                track.title,
                track.duration as i32,
                track.track_position as i32,
                track.disk_number as i32,
                parse_date(track.release_date.as_deref()),
                track.album as u32,
            ],
        )?;
    }
    Ok(())
}

fn insert_interactions(
    conn: &duckdb::Connection,
    interactions: &[Interaction],
) -> Result<(), PersistError> {
    let mut stmt = conn.prepare(
        "INSERT INTO interactions (ts, platform, ms_played, shuffle, skipped, offline, track_id)
         VALUES (make_timestamp(?), ?, ?, ?, ?, ?, ?)",
    )?;
    for interaction in interactions {
        stmt.execute(params![
            parse_timestamp(&interaction.ts),
            interaction.platform,
            interaction.ms_played as i32,
            interaction.shuffle,
            interaction.skipped,
            interaction.offline,
            interaction.track_id as u32,
        ])?;
    }
    Ok(())
}

fn sql_uinteger_list(ids: &[i64]) -> String {
    let items = ids
        .iter()
        .map(|id| (*id as u32).to_string())
        .collect::<Vec<_>>()
        .join(", ");
    format!("[{items}]::UINTEGER[]")
}

fn sql_varchar_list(values: &[String]) -> String {
    let items = values
        .iter()
        .map(|value| format!("'{}'", value.replace('\'', "''")))
        .collect::<Vec<_>>()
        .join(", ");
    format!("[{items}]::VARCHAR[]")
}

fn create_tables(conn: &duckdb::Connection) -> Result<(), PersistError> {
    conn.execute_batch(
        r"
        CREATE TABLE artists (
            id UINTEGER PRIMARY KEY,
            name VARCHAR,
            image VARCHAR,
            image_uri VARCHAR
        );

        CREATE TABLE albums (
            id UINTEGER PRIMARY KEY,
            title VARCHAR,
            image VARCHAR,
            image_uri VARCHAR,
            release_date DATE,
            genres VARCHAR[],
            nb_tracks INTEGER,
            duration INTEGER,
            album_type VARCHAR,
            artists UINTEGER[]
        );

        CREATE TABLE tracks (
            id UINTEGER PRIMARY KEY,
            title VARCHAR,
            duration INTEGER,
            track_position INTEGER,
            disk_number INTEGER,
            release_date DATE,
            album_id UINTEGER,
            artists UINTEGER[],
            CONSTRAINT fk_track_album FOREIGN KEY (album_id) REFERENCES albums(id)
        );

        CREATE TABLE interactions (
            ts TIMESTAMP,
            platform VARCHAR,
            ms_played INTEGER,
            shuffle BOOLEAN,
            skipped BOOLEAN,
            offline BOOLEAN,
            track_id UINTEGER,
            CONSTRAINT fk_interaction_track FOREIGN KEY (track_id) REFERENCES tracks(id)
        );

        CREATE TABLE package_meta (
            public_id VARCHAR,
            file_name VARCHAR,
            file_size INTEGER,
            status VARCHAR,
            created_at TIMESTAMP,
            started_at TIMESTAMP,
            total_duration_ms BIGINT,
            steps JSON
        );
        ",
    )?;
    Ok(())
}

fn create_views(conn: &duckdb::Connection) -> Result<(), PersistError> {
    conn.execute_batch(
        r"
        CREATE VIEW v_tracks_info AS
        SELECT
            t.id AS track_id,
            t.title AS track_name,
            t.artists AS track_artist_ids,
            t.album_id AS album_id,
            al.title AS album_title,
            (
                SELECT string_agg(a.name, ', ' ORDER BY u.ordinality)
                FROM unnest(t.artists) WITH ORDINALITY AS u(artist_id, ordinality)
                JOIN artists a ON a.id = u.artist_id
            ) AS track_artists_description,
            al.artists AS album_artist_ids,
            (
                SELECT string_agg(a.name, ', ' ORDER BY u.ordinality)
                FROM unnest(al.artists) WITH ORDINALITY AS u(artist_id, ordinality)
                JOIN artists a ON a.id = u.artist_id
            ) AS album_artists_description,
            al.image AS image,
            al.image_uri AS image_uri
        FROM tracks t
        LEFT JOIN albums al ON t.album_id = al.id;
        ",
    )?;
    Ok(())
}

fn timestamp_param(value: NaiveDateTime) -> String {
    value.format("%Y-%m-%d %H:%M:%S%.6f").to_string()
}

fn parse_date(value: Option<&str>) -> Option<String> {
    let trimmed = value?.trim();
    if trimmed.is_empty() {
        return None;
    }

    chrono::NaiveDate::parse_from_str(trimmed, "%Y-%m-%d")
        .ok()
        .map(|_| trimmed.to_string())
}

fn parse_timestamp(value: &str) -> Option<i64> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return None;
    }

    const FORMATS: &[&str] = &[
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M:%S%.f",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S%.f",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S%.fZ",
    ];

    for format in FORMATS {
        if let Ok(timestamp) = NaiveDateTime::parse_from_str(trimmed, format) {
            return Some(timestamp.and_utc().timestamp_micros());
        }
    }

    DateTime::parse_from_rfc3339(trimmed)
        .ok()
        .map(|timestamp| timestamp.with_timezone(&Utc).timestamp_micros())
}

fn album_type_label(album_type: &DeezerAlbumType) -> &'static str {
    match album_type {
        DeezerAlbumType::Album => "Album",
        DeezerAlbumType::Single => "Single",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_date_handles_valid_and_invalid_values() {
        assert_eq!(
            parse_date(Some("2024-05-01")).as_deref(),
            Some("2024-05-01")
        );
        assert_eq!(parse_date(Some("")), None);
        assert_eq!(parse_date(Some("not-a-date")), None);
    }

    #[test]
    fn parse_timestamp_handles_valid_and_invalid_values() {
        assert!(parse_timestamp("2024-05-01 12:34:56").is_some());
        assert!(parse_timestamp("2024-05-01 12:34:56.123").is_some());
        assert!(parse_timestamp("2024-05-01T12:34:56").is_some());
        assert!(parse_timestamp("2024-05-01T12:34:56Z").is_some());
        assert!(parse_timestamp("2024-05-01T12:34:56.123Z").is_some());
        assert_eq!(parse_timestamp(""), None);
        assert_eq!(parse_timestamp("invalid"), None);
    }

    #[test]
    fn create_views_exposes_track_metadata() -> Result<(), PersistError> {
        let conn = duckdb::Connection::open_in_memory()?;
        create_tables(&conn)?;

        conn.execute_batch(
            r"
            INSERT INTO artists (id, name, image, image_uri) VALUES
                (1, 'Artist A', 'data:image/jpeg;base64,artist-a', 'https://api.deezer.com/artist/1/image'),
                (2, 'Artist B', NULL, 'https://api.deezer.com/artist/2/image');
            INSERT INTO albums (id, title, image, image_uri, release_date, genres, nb_tracks, duration, album_type, artists)
                VALUES (10, 'Album', 'data:image/jpeg;base64,cover', 'https://api.deezer.com/album/10/image', DATE '2024-01-01', ['Pop'], 1, 180, 'Album', [1, 2]);
            INSERT INTO tracks (id, title, duration, track_position, disk_number, release_date, album_id, artists)
                VALUES (100, 'Track One', 180, 1, 1, DATE '2024-01-01', 10, [1, 2]);
            ",
        )?;

        create_views(&conn)?;

        let mut stmt = conn.prepare(
            "SELECT track_id, track_name, album_id, album_title, track_artists_description, album_artists_description, image, image_uri FROM v_tracks_info WHERE track_id = 100",
        )?;
        let row = stmt.query_row([], |row| {
            Ok((
                row.get::<_, u32>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, u32>(2)?,
                row.get::<_, Option<String>>(3)?,
                row.get::<_, Option<String>>(4)?,
                row.get::<_, Option<String>>(5)?,
                row.get::<_, Option<String>>(6)?,
                row.get::<_, Option<String>>(7)?,
            ))
        })?;

        assert_eq!(row.0, 100);
        assert_eq!(row.1, "Track One");
        assert_eq!(row.2, 10);
        assert_eq!(row.3.as_deref(), Some("Album"));
        assert_eq!(row.4.as_deref(), Some("Artist A, Artist B"));
        assert_eq!(row.5.as_deref(), Some("Artist A, Artist B"));
        assert_eq!(row.6.as_deref(), Some("data:image/jpeg;base64,cover"));
        assert_eq!(
            row.7.as_deref(),
            Some("https://api.deezer.com/album/10/image")
        );

        Ok(())
    }

    #[test]
    fn build_writes_rows_readable_by_the_view() -> Result<(), PersistError> {
        let mut artists = HashMap::new();
        artists.insert(
            1,
            DeezerArtist {
                id: 1,
                name: "Artist A".to_string(),
                image_uri: "https://api.deezer.com/artist/1/image".to_string(),
                image: Some("data:image/jpeg;base64,artist-a".to_string()),
            },
        );
        let mut albums = HashMap::new();
        albums.insert(
            10,
            DeezerAlbum {
                id: 10,
                title: "Album".to_string(),
                image_uri: "https://api.deezer.com/album/10/image".to_string(),
                image: Some("data:image/jpeg;base64,cover".to_string()),
                release_date: Some("2024-01-01".to_string()),
                genres: vec!["Pop".to_string(), "Rock's".to_string()],
                nb_tracks: 1,
                duration: 180,
                album_type: DeezerAlbumType::Album,
                artists: vec![1],
            },
        );
        let mut tracks = HashMap::new();
        tracks.insert(
            100,
            DeezerTrack {
                id: 100,
                title: "Track One".to_string(),
                duration: 180,
                track_position: 1,
                disk_number: 1,
                release_date: Some("2024-01-01".to_string()),
                artists: vec![1],
                album: 10,
            },
        );

        let (artifact, output) = build(PersistInput {
            public_id: "abc".to_string(),
            interactions: vec![Interaction {
                ts: "2024-05-01T12:34:56Z".to_string(),
                platform: "web".to_string(),
                ms_played: 180_000,
                shuffle: false,
                skipped: false,
                offline: false,
                track_id: 100,
            }],
            tracks,
            artists,
            albums,
        })?;

        assert_eq!(output.tracks, 1);
        assert_eq!(artifact.object_key, "harmony/abc.duckdb");

        let conn = duckdb::Connection::open(&artifact.db_path)?;
        let description: String = conn.query_row(
            "SELECT track_artists_description FROM v_tracks_info WHERE track_id = 100",
            [],
            |row| row.get(0),
        )?;
        let genre: String =
            conn.query_row("SELECT genres[2] FROM albums WHERE id = 10", [], |row| {
                row.get(0)
            })?;
        let played: i32 =
            conn.query_row("SELECT ms_played FROM interactions", [], |row| row.get(0))?;

        assert_eq!(description, "Artist A");
        assert_eq!(genre, "Rock's");
        assert_eq!(played, 180_000);

        let copied = std::env::temp_dir().join("harmony-persist-copy.duckdb");
        std::fs::copy(&artifact.db_path, &copied)?;
        let copied_conn = duckdb::Connection::open(&copied)?;
        let copied_count: i64 =
            copied_conn.query_row("SELECT count(*) FROM interactions", [], |row| row.get(0))?;
        assert_eq!(copied_count, 1);

        Ok(())
    }

    #[test]
    fn write_package_meta_stores_pipeline_steps() -> Result<(), PersistError> {
        let (artifact, _) = build(PersistInput {
            public_id: "abc".to_string(),
            interactions: Vec::new(),
            tracks: HashMap::new(),
            artists: HashMap::new(),
            albums: HashMap::new(),
        })?;

        let created_at = NaiveDateTime::parse_from_str("2024-05-01 10:00:00", "%Y-%m-%d %H:%M:%S")
            .expect("created_at");
        let started_at = NaiveDateTime::parse_from_str("2024-05-01 10:00:02", "%Y-%m-%d %H:%M:%S")
            .expect("started_at");
        let steps = serde_json::json!([
            {
                "id": "resolve_tracks",
                "output": { "missed": 3, "resolved": 10, "errors": 1 }
            }
        ]);

        write_package_meta(
            &artifact.db_path,
            &PackageMeta {
                public_id: "abc".to_string(),
                file_name: "history.zip".to_string(),
                file_size: 42,
                created_at,
                started_at,
                total_duration_ms: 1500,
                steps,
            },
        )?;

        let conn = duckdb::Connection::open(&artifact.db_path)?;
        let (file_name, file_size, duration_ms, created_at, steps_text): (
            String,
            i32,
            i64,
            String,
            String,
        ) = conn.query_row(
            "SELECT file_name, file_size::INTEGER, total_duration_ms::INTEGER, strftime(created_at, '%Y-%m-%dT%H:%M:%SZ'), steps::VARCHAR FROM package_meta",
            [],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?)),
        )?;
        let stored: serde_json::Value = serde_json::from_str(&steps_text).expect("steps json");

        assert_eq!(file_name, "history.zip");
        assert_eq!(file_size, 42);
        assert_eq!(duration_ms, 1500);
        assert_eq!(created_at, "2024-05-01T10:00:00Z");
        assert_eq!(stored[0]["output"]["missed"], 3);

        Ok(())
    }
}
