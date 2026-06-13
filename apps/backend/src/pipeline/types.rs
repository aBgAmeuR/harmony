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

#[derive(serde::Serialize)]
pub struct Interaction {
    pub ts: String,
    pub platform: String,
    pub ms_played: i64,
    pub shuffle: bool,
    pub skipped: bool,
    pub offline: bool,
    pub track_id: i64,
}

#[derive(serde::Serialize)]
pub struct DeezerTrack {
    pub id: i64,
    pub title: String,
    pub duration: i64,
    pub track_position: i64,
    pub disk_number: i64,
    pub release_date: Option<String>,
    pub artists: Vec<i64>,
    pub album: i64,
}

#[derive(serde::Serialize)]
pub struct DeezerArtist {
    pub id: i64,
    pub name: String,
    pub picture: String,
}

#[derive(serde::Serialize)]
pub enum DeezerAlbumType {
    Album,
    Single,
}

#[derive(serde::Serialize)]
pub struct DeezerAlbum {
    pub id: i64,
    pub title: String,
    pub cover: String,
    pub release_date: Option<String>,
    pub genres: Vec<String>,
    pub nb_tracks: i64,
    pub duration: i64,
    pub album_type: DeezerAlbumType,
    pub artists: Vec<i64>,
}
