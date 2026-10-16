//! `read` on the committed Spotify archive. Performance work must not change its output.

use std::fmt::Write as _;
use std::path::PathBuf;

use domain::observe::{Progress, Report};
use domain::package::Id;
use domain::source::{Selection, Source};
use pipeline::Live;
use pipeline::read;

/// FNV-1a over every kept play, field by field, in order. Recorded on run 002.
const DIGEST: u64 = 0x181d_d210_8ab4_d37f;

fn fnv1a(bytes: &[u8]) -> u64 {
    bytes.iter().fold(0xcbf2_9ce4_8422_2325, |hash, byte| {
        (hash ^ u64::from(*byte)).wrapping_mul(0x0100_0000_01b3)
    })
}

#[test]
fn fixture_output_is_unchanged() -> Result<(), Box<dyn std::error::Error>> {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("benches/data_test.zip");
    let bytes = std::fs::read(path)?;
    let source = Source::open("data_test.zip".to_owned(), bytes, Selection::All, u64::MAX)?;
    let progress = Progress::new();
    let id = Id::generate();
    progress.open(id);
    let mut report = Report::new();
    let mut live = Live::new(id, &progress, &mut report);
    let history = read::run(source, &mut live)?;

    let mut lines = String::new();
    for play in history.plays() {
        writeln!(
            lines,
            "{}|{}|{}|{}|{}|{}|{}|{}",
            play.at().to_rfc3339(),
            play.platform().as_str(),
            play.ms(),
            play.artist(),
            play.title(),
            play.shuffle(),
            play.skip(),
            play.offline()
        )?;
    }

    assert_eq!(history.len(), 732);
    assert_eq!(
        fnv1a(lines.as_bytes()),
        DIGEST,
        "digest {:#x}",
        fnv1a(lines.as_bytes())
    );
    Ok(())
}
