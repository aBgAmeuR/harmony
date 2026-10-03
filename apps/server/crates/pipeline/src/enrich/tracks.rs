use domain::catalog::{Album, Track};

/// Drop a track whose album is not in the catalog.
pub fn keep(tracks: Vec<Track>, albums: &[Album]) -> Vec<Track> {
    let mut kept = Vec::new();
    for track in tracks {
        if albums.iter().any(|album| album.id() == track.album()) {
            kept.push(track);
        }
    }
    kept
}
