pub struct ArchiveFile {
    pub name: String,
    pub content: String,
}

#[derive(serde::Deserialize)]
pub struct RawInteraction {
    pub ts: String,
    pub platform: String,
    pub ms_played: i64,
    pub master_metadata_track_name: Option<String>,
    pub master_metadata_album_artist_name: Option<String>,
    pub master_metadata_album_album_name: Option<String>,
    #[serde(default)]
    pub shuffle: bool,
    #[serde(default)]
    pub skipped: bool,
    #[serde(default)]
    pub offline: bool,
}

pub struct TrackKey {
    pub artist: String,
    pub track: String,
}

pub struct NormalizedInteraction {
    pub track_key: String,
    pub ts: String,
    pub platform: String,
    pub ms_played: i64,
    pub shuffle: bool,
    pub skipped: bool,
    pub offline: bool,
}
