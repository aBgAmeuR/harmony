use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct DefaultTrack {
    pub ts: String,
    pub username: String,
    pub ms_played: u32,
    pub master_metadata_track_name: Option<String>,
    pub master_metadata_album_artist_name: Option<String>,
    pub master_metadata_album_album_name: Option<String>,
    pub spotify_track_uri: Option<String>,
    pub offline_timestamp: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Track {
    pub total_played: u32,
    pub ms_played: u32,
    pub default_spotify_uri: String,
    pub score: Option<f32>,
    pub track_name: String,
    pub artist_name: String,
    pub album_name: String,
}

impl Track {
    pub fn compute_average_score(&mut self) {
        let ms_played = self.ms_played as f32 / 1_000_000.0;
        let score = (self.total_played as f32 + ms_played) / 2.0;
        self.score = Some(score);
    }
}
