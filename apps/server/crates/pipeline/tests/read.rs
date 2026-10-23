use std::io::{Cursor, Write};

use domain::observe::{Progress, Report};
use domain::package::Id;
use domain::source::{NonEmpty, Selection, Source};
use domain::stage::Stage;
use pipeline::Live;
use pipeline::read::{self, ReadError};
use zip::ZipWriter;
use zip::write::SimpleFileOptions;

const AUDIO: &str = "Spotify Extended Streaming History/Streaming_History_Audio_2020_1.json";
const RANGE: &str = "Spotify Extended Streaming History/Streaming_History_Audio_2019-2020_2.json";
const BARE_2025: &str = "Spotify Extended Streaming History/Streaming_History_Audio_2025.json";
const BARE_2026: &str = "Spotify Extended Streaming History/Streaming_History_Audio_2026.json";

fn archive(files: &[(&str, &str)]) -> Result<Vec<u8>, zip::result::ZipError> {
    let mut cursor = Cursor::new(Vec::new());
    let mut writer = ZipWriter::new(&mut cursor);
    let options = SimpleFileOptions::default();
    for (name, body) in files {
        writer.start_file(*name, options)?;
        writer.write_all(body.as_bytes())?;
    }
    writer.finish()?;
    Ok(cursor.into_inner())
}

fn source(bytes: Vec<u8>, files: Selection) -> Result<Source, domain::source::SourceError> {
    Source::open("history.zip".to_owned(), bytes, files, 2_000_000)
}

fn drive(source: Source) -> Result<domain::play::History, ReadError> {
    let progress = Progress::new();
    let id = Id::generate();
    progress.open(id);
    let mut report = Report::new();
    let mut live = Live::new(id, &progress, &mut report);
    read::run(source, &mut live)
}

fn play(title: &str, ms: i64) -> String {
    format!(
        r#"{{
            "ts": "2020-01-02T03:04:05Z",
            "platform": "android",
            "ms_played": {ms},
            "master_metadata_track_name": "{title}",
            "master_metadata_album_artist_name": "Artist",
            "shuffle": true,
            "skipped": false,
            "offline": false
        }}"#
    )
}

#[test]
fn run_keeps_a_cleaned_play_and_drops_a_short_one() -> Result<(), zip::result::ZipError> {
    let body = format!(
        "[{},{}]",
        play("Song (feat. Ada)", 45_000),
        play("Nope", 1_000)
    );
    let bytes = archive(&[(AUDIO, &body), ("readme.txt", "ignore")])?;
    let Ok(source) = source(bytes, Selection::All) else {
        return Err(zip::result::ZipError::FileNotFound);
    };
    let history = drive(source);

    let Ok(history) = history else {
        return Err(zip::result::ZipError::FileNotFound);
    };
    assert_eq!(history.len(), 1);
    assert!(!history.is_empty());
    let play = history.plays().first();
    assert!(matches!(
        play,
        Some(play) if play.title() == "Song" && play.artist() == "Artist" && play.ms() == 45_000 && play.shuffle()
    ));
    Ok(())
}

#[test]
fn run_keeps_audio_history_without_a_part_index() -> Result<(), zip::result::ZipError> {
    let bytes = archive(&[
        (BARE_2025, &format!("[{}]", play("Twenty Five", 45_000))),
        (BARE_2026, &format!("[{}]", play("Twenty Six", 45_000))),
        (AUDIO, &format!("[{}]", play("Indexed", 45_000))),
    ])?;
    let Ok(source) = source(bytes, Selection::All) else {
        return Err(zip::result::ZipError::FileNotFound);
    };
    let history = drive(source);

    let Ok(history) = history else {
        return Err(zip::result::ZipError::FileNotFound);
    };
    assert_eq!(history.len(), 3);
    Ok(())
}

#[test]
fn run_honors_a_non_empty_selection() -> Result<(), zip::result::ZipError> {
    let bytes = archive(&[
        (AUDIO, &format!("[{}]", play("Kept", 45_000))),
        (RANGE, &format!("[{}]", play("Dropped", 45_000))),
    ])?;
    let Ok(only) = NonEmpty::new(vec![RANGE.to_owned()]) else {
        return Err(zip::result::ZipError::FileNotFound);
    };
    let Ok(source) = source(bytes, Selection::Only(only)) else {
        return Err(zip::result::ZipError::FileNotFound);
    };
    let history = drive(source);

    let Ok(history) = history else {
        return Err(zip::result::ZipError::FileNotFound);
    };
    assert!(matches!(history.plays().first(), Some(play) if play.title() == "Dropped"));
    Ok(())
}

#[test]
fn run_reports_no_files_when_nothing_matches() -> Result<(), zip::result::ZipError> {
    let bytes = archive(&[("notes.txt", "hello")])?;
    let Ok(source) = source(bytes, Selection::All) else {
        return Err(zip::result::ZipError::FileNotFound);
    };

    let error = drive(source);
    assert!(matches!(error, Err(ReadError::NoFiles)));
    let Err(error) = error else {
        return Ok(());
    };
    let fail = domain::fail::Fail::from(error);
    assert_eq!(fail.stage(), Stage::Extract);
    Ok(())
}

#[test]
fn run_reports_parse_when_json_is_invalid() -> Result<(), zip::result::ZipError> {
    let bytes = archive(&[(AUDIO, "not-json")])?;
    let Ok(source) = source(bytes, Selection::All) else {
        return Err(zip::result::ZipError::FileNotFound);
    };

    let error = drive(source);
    assert!(matches!(error, Err(ReadError::Parse(_))));
    let Err(error) = error else {
        return Ok(());
    };
    assert_eq!(domain::fail::Fail::from(error).stage(), Stage::Parse);
    Ok(())
}

#[test]
fn run_reports_empty_when_every_play_is_dropped() -> Result<(), zip::result::ZipError> {
    let bytes = archive(&[(AUDIO, &format!("[{}]", play("Song", 30_000)))])?;
    let Ok(source) = source(bytes, Selection::All) else {
        return Err(zip::result::ZipError::FileNotFound);
    };

    let error = drive(source);
    assert!(matches!(error, Err(ReadError::Empty)));
    let Err(error) = error else {
        return Ok(());
    };
    assert_eq!(domain::fail::Fail::from(error).stage(), Stage::Normalize);
    Ok(())
}

#[test]
fn run_reports_extract_when_the_zip_is_truncated() -> Result<(), domain::source::SourceError> {
    let source = Source::open(
        "history.zip".to_owned(),
        b"PK\x03\x04truncated".to_vec(),
        Selection::All,
        2_000_000,
    )?;

    let error = drive(source);
    assert!(matches!(error, Err(ReadError::Extract(_))));
    Ok(())
}
