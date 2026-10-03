//! Row inserts. Artists and interactions go through the appender.
//!
//! Album and track rows carry `VARCHAR[]` / `UINTEGER[]`. This `DuckDB` crate's
//! appender rejects list values, so those two tables bind a list literal with
//! `CAST` from `insert_album.sql` and `insert_track.sql`.

use chrono::NaiveDate;
use domain::catalog::{Catalog, Id};
use duckdb::params;

use super::WriteError;

const ARTISTS: &str = "artists";
const INTERACTIONS: &str = "interactions";
const INSERT_ALBUM: &str = include_str!("sql/insert_album.sql");
const INSERT_TRACK: &str = include_str!("sql/insert_track.sql");

pub fn rows(conn: &duckdb::Connection, catalog: &Catalog) -> Result<(), WriteError> {
    artists(conn, catalog)?;
    albums(conn, catalog)?;
    tracks(conn, catalog)?;
    interactions(conn, catalog)?;
    Ok(())
}

fn artists(conn: &duckdb::Connection, catalog: &Catalog) -> Result<(), WriteError> {
    let mut appender = conn.appender(ARTISTS)?;
    for artist in catalog.artists() {
        appender.append_row((
            artist.id().get(),
            artist.name(),
            artist.image(),
            artist.uri(),
        ))?;
    }
    appender.flush()?;
    Ok(())
}

fn albums(conn: &duckdb::Connection, catalog: &Catalog) -> Result<(), WriteError> {
    let mut stmt = conn.prepare(INSERT_ALBUM)?;
    for album in catalog.albums() {
        let tracks = i32::from(album.tracks());
        let duration = seconds(album.ms())?;
        stmt.execute(params![
            album.id().get(),
            album.title(),
            album.image(),
            album.uri(),
            day(album.release()),
            text_list(album.genres()),
            tracks,
            duration,
            album.kind().as_str(),
            id_list(album.artists()),
        ])?;
    }
    Ok(())
}

fn tracks(conn: &duckdb::Connection, catalog: &Catalog) -> Result<(), WriteError> {
    let mut stmt = conn.prepare(INSERT_TRACK)?;
    for track in catalog.tracks() {
        let duration = seconds(track.ms())?;
        stmt.execute(params![
            track.id().get(),
            track.title(),
            duration,
            i32::from(track.position()),
            i32::from(track.disk()),
            day(track.release()),
            track.album().get(),
            id_list(track.artists()),
        ])?;
    }
    Ok(())
}

fn interactions(conn: &duckdb::Connection, catalog: &Catalog) -> Result<(), WriteError> {
    let mut appender = conn.appender(INTERACTIONS)?;
    for listen in catalog.listens() {
        let play = listen.play();
        let ms = fit(play.ms())?;
        let at = play.at().format("%Y-%m-%d %H:%M:%S%.6f").to_string();
        appender.append_row((
            at,
            play.platform().as_str(),
            ms,
            play.shuffle(),
            play.skip(),
            play.offline(),
            listen.track().get(),
        ))?;
    }
    appender.flush()?;
    Ok(())
}

fn fit(value: u32) -> Result<i32, WriteError> {
    i32::try_from(value).map_err(|_| WriteError::Fit)
}

/// The `duration` column is seconds. Album and track values are milliseconds.
fn seconds(ms: u32) -> Result<i32, WriteError> {
    fit(ms / 1_000)
}

fn day(value: Option<NaiveDate>) -> Option<String> {
    value.map(|date| date.format("%Y-%m-%d").to_string())
}

fn text_list(values: &[String]) -> String {
    let mut list = String::from("[");
    for (index, value) in values.iter().enumerate() {
        if index > 0 {
            list.push_str(", ");
        }
        list.push('\'');
        for ch in value.chars() {
            if ch == '\'' {
                list.push('\'');
            }
            list.push(ch);
        }
        list.push('\'');
    }
    list.push(']');
    list
}

fn id_list(ids: &[Id]) -> String {
    let mut list = String::from("[");
    for (index, id) in ids.iter().enumerate() {
        if index > 0 {
            list.push_str(", ");
        }
        list.push_str(&id.get().to_string());
    }
    list.push(']');
    list
}
