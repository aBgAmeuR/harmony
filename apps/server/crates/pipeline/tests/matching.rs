use adapters::memory::Memory;
use domain::catalog::{Catalog, Id};
use domain::matching::Guess;
use domain::observe::{Progress, Report};
use domain::package::Id as PackageId;
use domain::play::{History, Play, PlayError, RawPlay};
use domain::source::{Empty, NonEmpty};
use domain::stage::Stage;
use pipeline::Live;
use pipeline::matching::{self, MatchError};

#[derive(Debug)]
#[allow(
    dead_code,
    reason = "the harness prints this only when a fixture fails"
)]
enum Fixture {
    Json(serde_json::Error),
    Play(PlayError),
    Empty(Empty),
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

impl From<Empty> for Fixture {
    fn from(error: Empty) -> Self {
        Self::Empty(error)
    }
}

fn play(artist: &str, title: &str) -> Result<Play, Fixture> {
    let json = format!(
        r#"{{
            "ts": "2020-01-02T03:04:05Z",
            "platform": "android",
            "ms_played": 45000,
            "master_metadata_track_name": "{title}",
            "master_metadata_album_artist_name": "{artist}"
        }}"#
    );
    let raw = serde_json::from_str::<RawPlay<'_>>(&json)?;
    Ok(Play::try_from(raw)?)
}

fn drive(history: History, lookup: &Memory) -> Result<domain::matching::Match, MatchError> {
    let progress = Progress::new();
    let id = PackageId::generate();
    progress.open(id);
    let mut report = Report::new();
    let mut live = Live::new(id, &progress, &mut report);
    matching::run(history, lookup, &mut live)
}

fn history(plays: Vec<Play>) -> Result<History, Fixture> {
    Ok(History::from_plays(NonEmpty::new(plays)?))
}

fn empty_catalog() -> Catalog {
    Catalog::new(Vec::new(), Vec::new(), Vec::new(), Vec::new())
}

#[test]
fn run_asks_find_once_for_a_repeated_pair() -> Result<(), Fixture> {
    let plays = vec![play("Artist", "Song")?, play("Artist", "Song")?];
    let lookup = Memory::ready(
        vec![Guess::new(Id::new(30), "Artist", "Song")],
        empty_catalog(),
    );

    let matched = drive(history(plays)?, &lookup);
    assert!(
        matches!(matched, Ok(ref matched) if matched.hits().len() == 2 && matched.missed() == 0)
    );
    assert_eq!(lookup.finds(), 1);
    Ok(())
}

#[test]
fn run_counts_a_miss() -> Result<(), Fixture> {
    let lookup = Memory::ready(
        vec![Guess::new(Id::new(3), "LuhMaru", "Me n my kup")],
        empty_catalog(),
    );

    let matched = drive(history(vec![play("Ken Carson", "Me N My Kup")?])?, &lookup);
    assert!(matches!(matched, Ok(matched) if matched.hits().is_empty() && matched.missed() == 1));
    Ok(())
}

#[test]
fn run_wraps_a_lookup_failure_as_resolve() -> Result<(), Fixture> {
    let lookup = Memory::find_fails("down");
    let matched = drive(history(vec![play("Artist", "Song")?])?, &lookup);

    assert!(matches!(matched, Err(MatchError::Lookup(_))));
    let Err(error) = matched else {
        return Ok(());
    };
    assert_eq!(domain::fail::Fail::from(error).stage(), Stage::Resolve);
    Ok(())
}
