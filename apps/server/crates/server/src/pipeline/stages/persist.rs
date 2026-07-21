use std::fs::File;
use std::path::Path;

use chrono::{DateTime, NaiveDate, NaiveDateTime, Utc};
use polars::prelude::*;
use tempfile::TempDir;

use crate::pipeline::error::PersistError;
use crate::pipeline::types::DeezerAlbumType;
use crate::pipeline::PipelineContext;
use crate::storage::ObjectStore;

const EPOCH: NaiveDate = match NaiveDate::from_ymd_opt(1970, 1, 1) {
    Some(date) => date,
    None => panic!("invalid epoch date"),
};

#[tracing::instrument(
    skip(ctx),
    name = "pipeline.persist",
    fields(
        package_id = ctx.package_id,
        public_id = %ctx.public_id,
        interactions_count = ctx.interactions.len(),
        tracks_count = ctx.deezer_tracks.len(),
        artists_count = ctx.deezer_artists.len(),
        albums_count = ctx.deezer_albums.len(),
    ),
)]
pub fn run(ctx: &mut PipelineContext) -> Result<(), PersistError> {
    let temp_dir = TempDir::new()?;
    let temp_path = temp_dir.path();
    let db_path = temp_path.join("package.duckdb");

    let artists_df = build_artists_df(&ctx)?;
    let albums_df = build_albums_df(&ctx)?;
    let tracks_df = build_tracks_df(&ctx)?;
    let interactions_df = build_interactions_df(&ctx)?;

    let artists_parquet = temp_path.join("artists.parquet");
    let albums_parquet = temp_path.join("albums.parquet");
    let tracks_parquet = temp_path.join("tracks.parquet");
    let interactions_parquet = temp_path.join("interactions.parquet");

    write_parquet(&artists_df, &artists_parquet)?;
    write_parquet(&albums_df, &albums_parquet)?;
    write_parquet(&tracks_df, &tracks_parquet)?;
    write_parquet(&interactions_df, &interactions_parquet)?;

    {
        let conn = duckdb::Connection::open(&db_path)?;
        create_tables(&conn)?;
        load_parquet(&conn, "artists", &artists_parquet)?;
        load_parquet(&conn, "albums", &albums_parquet)?;
        load_parquet(&conn, "tracks", &tracks_parquet)?;
        load_parquet(&conn, "interactions", &interactions_parquet)?;
        create_views(&conn)?;
    }

    let object_key = format!("harmony/{}.duckdb", ctx.public_id);
    let handle =
        tokio::runtime::Handle::try_current().map_err(|_| PersistError::RuntimeUnavailable)?;
    handle.block_on(ctx.object_store.put_file(&object_key, &db_path))?;

    tracing::info!(
        object_key = %object_key,
        "persisted package data to object storage"
    );

    Ok(())
}

fn build_artists_df(ctx: &PipelineContext) -> Result<DataFrame, PersistError> {
    if ctx.deezer_artists.is_empty() {
        return Ok(empty_artists_df());
    }

    let mut ids = Vec::with_capacity(ctx.deezer_artists.len());
    let mut names = Vec::with_capacity(ctx.deezer_artists.len());
    let mut images = Vec::with_capacity(ctx.deezer_artists.len());
    let mut image_uris = Vec::with_capacity(ctx.deezer_artists.len());

    for (id, artist) in &ctx.deezer_artists {
        ids.push(*id as u32);
        names.push(artist.name.clone());
        images.push(artist.image.clone());
        image_uris.push(artist.image_uri.clone());
    }

    DataFrame::new(vec![
        Series::new("id".into(), ids).into(),
        Series::new("name".into(), names).into(),
        Series::new("image".into(), images).into(),
        Series::new("image_uri".into(), image_uris).into(),
    ])
    .map_err(PersistError::from)
}

fn build_albums_df(ctx: &PipelineContext) -> Result<DataFrame, PersistError> {
    if ctx.deezer_albums.is_empty() {
        return Ok(empty_albums_df());
    }

    let mut ids = Vec::with_capacity(ctx.deezer_albums.len());
    let mut titles = Vec::with_capacity(ctx.deezer_albums.len());
    let mut images = Vec::with_capacity(ctx.deezer_albums.len());
    let mut image_uris = Vec::with_capacity(ctx.deezer_albums.len());
    let mut release_dates = Vec::with_capacity(ctx.deezer_albums.len());
    let mut genres = Vec::with_capacity(ctx.deezer_albums.len());
    let mut nb_tracks = Vec::with_capacity(ctx.deezer_albums.len());
    let mut durations = Vec::with_capacity(ctx.deezer_albums.len());
    let mut album_types = Vec::with_capacity(ctx.deezer_albums.len());
    let mut artists = Vec::with_capacity(ctx.deezer_albums.len());

    for (id, album) in &ctx.deezer_albums {
        ids.push(*id as u32);
        titles.push(album.title.clone());
        images.push(album.image.clone());
        image_uris.push(album.image_uri.clone());
        release_dates.push(parse_date(album.release_date.as_deref()));
        genres.push(album.genres.clone());
        nb_tracks.push(album.nb_tracks as i32);
        durations.push(album.duration as i32);
        album_types.push(album_type_label(&album.album_type).to_string());
        artists.push(album.artists.clone());
    }

    DataFrame::new(vec![
        Series::new("id".into(), ids).into(),
        Series::new("title".into(), titles).into(),
        Series::new("image".into(), images).into(),
        Series::new("image_uri".into(), image_uris).into(),
        date_series("release_date", release_dates).into(),
        string_list_series("genres", &genres).into(),
        Series::new("nb_tracks".into(), nb_tracks).into(),
        Series::new("duration".into(), durations).into(),
        Series::new("album_type".into(), album_types).into(),
        u32_list_series("artists", &artists).into(),
    ])
    .map_err(PersistError::from)
}

fn build_tracks_df(ctx: &PipelineContext) -> Result<DataFrame, PersistError> {
    if ctx.deezer_tracks.is_empty() {
        return Ok(empty_tracks_df());
    }

    let mut ids = Vec::with_capacity(ctx.deezer_tracks.len());
    let mut titles = Vec::with_capacity(ctx.deezer_tracks.len());
    let mut durations = Vec::with_capacity(ctx.deezer_tracks.len());
    let mut track_positions = Vec::with_capacity(ctx.deezer_tracks.len());
    let mut disk_numbers = Vec::with_capacity(ctx.deezer_tracks.len());
    let mut release_dates = Vec::with_capacity(ctx.deezer_tracks.len());
    let mut album_ids = Vec::with_capacity(ctx.deezer_tracks.len());
    let mut artists = Vec::with_capacity(ctx.deezer_tracks.len());

    for (id, track) in &ctx.deezer_tracks {
        ids.push(*id as u32);
        titles.push(track.title.clone());
        durations.push(track.duration as i32);
        track_positions.push(track.track_position as i32);
        disk_numbers.push(track.disk_number as i32);
        release_dates.push(parse_date(track.release_date.as_deref()));
        album_ids.push(track.album as u32);
        artists.push(track.artists.clone());
    }

    DataFrame::new(vec![
        Series::new("id".into(), ids).into(),
        Series::new("title".into(), titles).into(),
        Series::new("duration".into(), durations).into(),
        Series::new("track_position".into(), track_positions).into(),
        Series::new("disk_number".into(), disk_numbers).into(),
        date_series("release_date", release_dates).into(),
        Series::new("album_id".into(), album_ids).into(),
        u32_list_series("artists", &artists).into(),
    ])
    .map_err(PersistError::from)
}

fn build_interactions_df(ctx: &PipelineContext) -> Result<DataFrame, PersistError> {
    if ctx.interactions.is_empty() {
        return Ok(empty_interactions_df());
    }

    let mut timestamps = Vec::with_capacity(ctx.interactions.len());
    let mut platforms = Vec::with_capacity(ctx.interactions.len());
    let mut ms_played = Vec::with_capacity(ctx.interactions.len());
    let mut shuffles = Vec::with_capacity(ctx.interactions.len());
    let mut skipped = Vec::with_capacity(ctx.interactions.len());
    let mut offline = Vec::with_capacity(ctx.interactions.len());
    let mut track_ids = Vec::with_capacity(ctx.interactions.len());

    for interaction in &ctx.interactions {
        timestamps.push(parse_timestamp(&interaction.ts));
        platforms.push(interaction.platform.clone());
        ms_played.push(interaction.ms_played as i32);
        shuffles.push(interaction.shuffle);
        skipped.push(interaction.skipped);
        offline.push(interaction.offline);
        track_ids.push(interaction.track_id as u32);
    }

    DataFrame::new(vec![
        datetime_series("ts", timestamps).into(),
        Series::new("platform".into(), platforms).into(),
        Series::new("ms_played".into(), ms_played).into(),
        Series::new("shuffle".into(), shuffles).into(),
        Series::new("skipped".into(), skipped).into(),
        Series::new("offline".into(), offline).into(),
        Series::new("track_id".into(), track_ids).into(),
    ])
    .map_err(PersistError::from)
}

fn write_parquet(df: &DataFrame, path: &Path) -> Result<(), PersistError> {
    let mut file = File::create(path)?;
    let mut df = df.clone();
    ParquetWriter::new(&mut file).finish(&mut df)?;
    Ok(())
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

fn load_parquet(conn: &duckdb::Connection, table: &str, path: &Path) -> Result<(), PersistError> {
    let sql = format!(
        "INSERT INTO {table} SELECT * FROM '{}'",
        path.to_string_lossy().replace('\'', "''")
    );
    conn.execute(&sql, [])?;
    Ok(())
}

fn parse_date(value: Option<&str>) -> Option<i32> {
    value.and_then(|raw| {
        let trimmed = raw.trim();
        if trimmed.is_empty() {
            return None;
        }

        NaiveDate::parse_from_str(trimmed, "%Y-%m-%d")
            .ok()
            .map(|date| date.signed_duration_since(EPOCH).num_days() as i32)
    })
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

fn date_series(name: &str, values: Vec<Option<i32>>) -> Series {
    Series::new(name.into(), values)
        .cast(&DataType::Date)
        .expect("date series should cast")
}

fn datetime_series(name: &str, values: Vec<Option<i64>>) -> Series {
    Series::new(name.into(), values)
        .cast(&DataType::Datetime(TimeUnit::Microseconds, None))
        .expect("datetime series should cast")
}

fn u32_list_series(name: &str, values: &[Vec<i64>]) -> Series {
    let list_values: Vec<Series> = values
        .iter()
        .map(|ids| {
            let uids: Vec<u32> = ids.iter().map(|id| *id as u32).collect();
            Series::new(PlSmallStr::EMPTY, uids)
        })
        .collect();

    Series::new(name.into(), list_values)
}

fn string_list_series(name: &str, values: &[Vec<String>]) -> Series {
    let list_values: Vec<Series> = values
        .iter()
        .map(|items| Series::new(PlSmallStr::EMPTY, items.clone()))
        .collect();

    Series::new(name.into(), list_values)
}

fn empty_artists_df() -> DataFrame {
    DataFrame::empty_with_schema(&Schema::from_iter([
        Field::new("id".into(), DataType::UInt32),
        Field::new("name".into(), DataType::String),
        Field::new("image".into(), DataType::String),
        Field::new("image_uri".into(), DataType::String),
    ]))
}

fn empty_albums_df() -> DataFrame {
    DataFrame::empty_with_schema(&Schema::from_iter([
        Field::new("id".into(), DataType::UInt32),
        Field::new("title".into(), DataType::String),
        Field::new("image".into(), DataType::String),
        Field::new("image_uri".into(), DataType::String),
        Field::new("release_date".into(), DataType::Date),
        Field::new("genres".into(), DataType::List(Box::new(DataType::String))),
        Field::new("nb_tracks".into(), DataType::Int32),
        Field::new("duration".into(), DataType::Int32),
        Field::new("album_type".into(), DataType::String),
        Field::new("artists".into(), DataType::List(Box::new(DataType::UInt32))),
    ]))
}

fn empty_tracks_df() -> DataFrame {
    DataFrame::empty_with_schema(&Schema::from_iter([
        Field::new("id".into(), DataType::UInt32),
        Field::new("title".into(), DataType::String),
        Field::new("duration".into(), DataType::Int32),
        Field::new("track_position".into(), DataType::Int32),
        Field::new("disk_number".into(), DataType::Int32),
        Field::new("release_date".into(), DataType::Date),
        Field::new("album_id".into(), DataType::UInt32),
        Field::new("artists".into(), DataType::List(Box::new(DataType::UInt32))),
    ]))
}

fn empty_interactions_df() -> DataFrame {
    DataFrame::empty_with_schema(&Schema::from_iter([
        Field::new(
            "ts".into(),
            DataType::Datetime(TimeUnit::Microseconds, None),
        ),
        Field::new("platform".into(), DataType::String),
        Field::new("ms_played".into(), DataType::Int32),
        Field::new("shuffle".into(), DataType::Boolean),
        Field::new("skipped".into(), DataType::Boolean),
        Field::new("offline".into(), DataType::Boolean),
        Field::new("track_id".into(), DataType::UInt32),
    ]))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_date_handles_valid_and_invalid_values() {
        assert_eq!(parse_date(Some("2024-05-01")), Some(19_844));
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
}
