use adapters::memory::Memory;
use domain::catalog::{Album, Artist, Catalog, Id, Kind, Track};
use domain::matching::{Hit, Match};
use domain::observe::{Progress, Report};
use domain::package::Id as PackageId;
use domain::play::{Play, PlayError, RawPlay};
use domain::stage::Stage;
use pipeline::Live;
use pipeline::enrich::{self, EnrichError};

#[derive(Debug)]
#[allow(
    dead_code,
    reason = "the harness prints this only when a fixture fails"
)]
enum Fixture {
    Json(serde_json::Error),
    Play(PlayError),
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

fn play() -> Result<Play, Fixture> {
    let raw = serde_json::from_str::<RawPlay>(
        r#"{
            "ts": "2020-01-02T03:04:05Z",
            "platform": "android",
            "ms_played": 45000,
            "master_metadata_track_name": "Song",
            "master_metadata_album_artist_name": "Artist"
        }"#,
    )?;
    Ok(Play::try_from(raw)?)
}

fn sample(track_album: Id) -> Catalog {
    let artist = Id::new(10);
    let album = Id::new(20);
    let track = Id::new(30);
    Catalog::new(
        vec![Artist::new(
            artist,
            "Artist".to_owned(),
            None,
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
            track_album,
            vec![artist],
        )],
        Vec::new(),
    )
}

fn drive(matched: Match, lookup: &Memory) -> Result<Catalog, EnrichError> {
    let progress = Progress::new();
    let id = PackageId::generate();
    progress.open(id);
    let mut report = Report::new();
    let mut live = Live::new(id, &progress, &mut report);
    enrich::run(matched, lookup, &mut live)
}

#[test]
fn run_keeps_a_listen_when_the_album_exists() -> Result<(), Fixture> {
    let lookup = Memory::ready(Vec::new(), sample(Id::new(20)));
    let matched = Match::new(vec![Hit::new(play()?, Id::new(30))], 0);

    let catalog = drive(matched, &lookup);
    assert!(matches!(
        catalog,
        Ok(catalog)
            if catalog.listens().len() == 1
                && catalog.tracks().len() == 1
                && catalog.albums().len() == 1
                && catalog.artists().len() == 1
                && catalog.listens().first().is_some_and(|listen| listen.track() == Id::new(30))
    ));
    Ok(())
}

#[test]
fn run_drops_a_track_without_an_album_and_its_listen() -> Result<(), Fixture> {
    let lookup = Memory::ready(Vec::new(), sample(Id::new(99)));
    let matched = Match::new(vec![Hit::new(play()?, Id::new(30))], 0);

    let catalog = drive(matched, &lookup);
    assert!(matches!(
        catalog,
        Ok(catalog) if catalog.listens().is_empty() && catalog.tracks().is_empty() && catalog.albums().is_empty()
    ));
    Ok(())
}

#[test]
fn run_maps_a_load_failure_to_tracks() -> Result<(), Fixture> {
    let lookup = Memory::load_fails("down", sample(Id::new(20)));
    let matched = Match::new(vec![Hit::new(play()?, Id::new(30))], 0);

    let error = drive(matched, &lookup);
    assert!(matches!(error, Err(EnrichError::Tracks(_))));
    let Err(error) = error else {
        return Ok(());
    };
    assert_eq!(domain::fail::Fail::from(error).stage(), Stage::Tracks);
    Ok(())
}
