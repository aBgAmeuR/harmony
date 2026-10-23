use domain::catalog::{Album, Track};

/// Keep albums that a remaining track still points at.
///
/// `image` is already a data-url or empty. A failed image stays empty.
pub fn keep(albums: Vec<Album>, tracks: &[Track]) -> Vec<Album> {
    let mut kept = Vec::new();
    for album in albums {
        if tracks.iter().any(|track| track.album() == album.id()) {
            kept.push(album);
        }
    }
    kept
}
