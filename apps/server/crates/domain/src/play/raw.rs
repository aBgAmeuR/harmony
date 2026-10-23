//! One Spotify streaming-history object, before it is a [`super::Play`].

/// JSON object from an extended streaming history file.
///
/// Unknown keys stay ignored: Spotify adds fields, and this struct does not own that schema.
#[derive(Debug, Clone, PartialEq, Eq, serde::Deserialize)]
pub struct RawPlay {
    #[serde(rename = "ts")]
    pub(in crate::play) at: String,
    pub(in crate::play) platform: String,
    #[serde(rename = "ms_played")]
    pub(in crate::play) ms: i64,
    #[serde(rename = "master_metadata_album_artist_name")]
    pub(in crate::play) artist: Option<String>,
    #[serde(rename = "master_metadata_track_name")]
    pub(in crate::play) title: Option<String>,
    #[serde(default)]
    pub(in crate::play) shuffle: bool,
    #[serde(rename = "skipped", default)]
    pub(in crate::play) skip: bool,
    #[serde(default)]
    pub(in crate::play) offline: bool,
}

impl RawPlay {
    /// Replaces the title after `read` has cleaned it.
    #[must_use]
    pub fn with_title(mut self, title: String) -> Self {
        self.title = Some(title);
        self
    }

    #[must_use]
    pub fn title(&self) -> Option<&str> {
        self.title.as_deref()
    }
}

#[cfg(test)]
mod tests {
    use super::RawPlay;

    #[test]
    fn extra_spotify_fields_are_ignored() {
        let raw = serde_json::from_str::<RawPlay>(
            r#"{
                "ts": "2020-01-02T03:04:05Z",
                "username": "ada",
                "platform": "android",
                "ms_played": 40000,
                "conn_country": "FR",
                "master_metadata_track_name": "Song",
                "master_metadata_album_artist_name": "Artist",
                "master_metadata_album_album_name": "Album",
                "shuffle": true,
                "skipped": false,
                "offline": true
            }"#,
        );

        assert!(matches!(
            raw,
            Ok(raw) if raw.title() == Some("Song") && raw.shuffle && raw.offline && !raw.skip
        ));
    }
}
