use std::collections::HashMap;

use crate::pipeline::error::VerifyError;
use crate::pipeline::report::VerifyReport;
use crate::pipeline::types::{DeezerAlbum, DeezerTrack, Interaction};

pub struct VerifyInput {
    pub albums: HashMap<i64, DeezerAlbum>,
    pub tracks: HashMap<i64, DeezerTrack>,
    pub interactions: Vec<Interaction>,
}

pub struct VerifyOutput {
    pub albums: HashMap<i64, DeezerAlbum>,
    pub tracks: HashMap<i64, DeezerTrack>,
    pub interactions: Vec<Interaction>,
}

fn verify_references(
    albums: &HashMap<i64, DeezerAlbum>,
    tracks: &mut HashMap<i64, DeezerTrack>,
    interactions: &mut Vec<Interaction>,
) -> VerifyReport {
    let tracks_before = tracks.len();
    tracks.retain(|_, track| albums.contains_key(&track.album));
    let tracks_skipped = tracks_before - tracks.len();

    let interactions_before = interactions.len();
    interactions.retain(|interaction| tracks.contains_key(&interaction.track_id));
    let interactions_skipped = interactions_before - interactions.len();

    VerifyReport {
        tracks_skipped,
        interactions_skipped,
    }
}

pub fn run(input: VerifyInput) -> Result<(VerifyOutput, VerifyReport), VerifyError> {
    let mut tracks = input.tracks;
    let mut interactions = input.interactions;
    let report = verify_references(&input.albums, &mut tracks, &mut interactions);

    Ok((
        VerifyOutput {
            albums: input.albums,
            tracks,
            interactions,
        },
        report,
    ))
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use super::verify_references;
    use crate::pipeline::types::{DeezerAlbum, DeezerAlbumType, DeezerTrack, Interaction};

    fn sample_album(id: i64) -> DeezerAlbum {
        DeezerAlbum {
            id,
            title: format!("Album {id}"),
            image_uri: String::new(),
            image: None,
            release_date: None,
            genres: Vec::new(),
            nb_tracks: 1,
            duration: 100,
            album_type: DeezerAlbumType::Album,
            artists: vec![1],
        }
    }

    fn sample_track(id: i64, album_id: i64) -> DeezerTrack {
        DeezerTrack {
            id,
            title: format!("Track {id}"),
            duration: 100,
            track_position: 1,
            disk_number: 1,
            release_date: None,
            artists: vec![1],
            album: album_id,
        }
    }

    fn sample_interaction(track_id: i64) -> Interaction {
        Interaction {
            ts: "2024-01-01 00:00:00".to_string(),
            platform: "web".to_string(),
            ms_played: 1000,
            shuffle: false,
            skipped: false,
            offline: false,
            track_id,
        }
    }

    #[test]
    fn skips_tracks_with_missing_albums_and_orphan_interactions() {
        let albums = HashMap::from([(10, sample_album(10))]);
        let mut tracks = HashMap::from([(1, sample_track(1, 10)), (2, sample_track(2, 99))]);
        let mut interactions = vec![
            sample_interaction(1),
            sample_interaction(2),
            sample_interaction(3),
        ];

        let counts = verify_references(&albums, &mut tracks, &mut interactions);

        assert_eq!(tracks.len(), 1);
        assert!(tracks.contains_key(&1));
        assert_eq!(interactions.len(), 1);
        assert_eq!(interactions[0].track_id, 1);
        assert_eq!(counts.tracks_skipped, 1);
        assert_eq!(counts.interactions_skipped, 2);
    }
}
