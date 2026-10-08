//! One Spotify streaming-history object, before it is a [`super::Play`].

use std::borrow::Cow;

/// JSON object from an extended streaming history file.
///
/// Unknown keys stay ignored: Spotify adds fields, and this struct does not own that schema.
/// String fields borrow the input. `Cow` owns a string only when JSON escapes force a copy,
/// or when [`Self::with_title`] replaces the title.
#[derive(Debug, Clone, PartialEq, Eq, serde::Deserialize)]
pub struct RawPlay<'a> {
    #[serde(rename = "ts", borrow)]
    pub(in crate::play) at: Cow<'a, str>,
    #[serde(borrow)]
    pub(in crate::play) platform: Cow<'a, str>,
    #[serde(rename = "ms_played")]
    pub(in crate::play) ms: i64,
    #[serde(
        rename = "master_metadata_album_artist_name",
        borrow,
        deserialize_with = "borrow_option_cow"
    )]
    pub(in crate::play) artist: Option<Cow<'a, str>>,
    #[serde(
        rename = "master_metadata_track_name",
        borrow,
        deserialize_with = "borrow_option_cow"
    )]
    pub(in crate::play) title: Option<Cow<'a, str>>,
    #[serde(default)]
    pub(in crate::play) shuffle: bool,
    #[serde(rename = "skipped", default)]
    pub(in crate::play) skip: bool,
    #[serde(default)]
    pub(in crate::play) offline: bool,
}

impl RawPlay<'_> {
    /// Replaces the title after `read` has cleaned it.
    #[must_use]
    pub fn with_title(mut self, title: String) -> Self {
        self.title = Some(Cow::Owned(title));
        self
    }

    #[must_use]
    pub fn title(&self) -> Option<&str> {
        self.title.as_deref()
    }
}

/// `#[serde(borrow)]` borrows a bare `Cow<str>` and ignores `Option<Cow<str>>`.
fn borrow_option_cow<'de, D>(deserializer: D) -> Result<Option<Cow<'de, str>>, D::Error>
where
    D: serde::Deserializer<'de>,
{
    deserializer.deserialize_option(OptionCow)
}

struct OptionCow;

impl<'de> serde::de::Visitor<'de> for OptionCow {
    type Value = Option<Cow<'de, str>>;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("an optional string")
    }

    fn visit_unit<E>(self) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        Ok(None)
    }

    fn visit_none<E>(self) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        Ok(None)
    }

    fn visit_some<D>(self, deserializer: D) -> Result<Self::Value, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_str(CowStr).map(Some)
    }
}

struct CowStr;

impl<'de> serde::de::Visitor<'de> for CowStr {
    type Value = Cow<'de, str>;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("a string")
    }

    fn visit_borrowed_str<E>(self, value: &'de str) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        Ok(Cow::Borrowed(value))
    }

    fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        Ok(Cow::Owned(value.to_owned()))
    }

    fn visit_string<E>(self, value: String) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        Ok(Cow::Owned(value))
    }
}

#[cfg(test)]
mod tests {
    use super::RawPlay;

    #[test]
    fn extra_spotify_fields_are_ignored() {
        let raw = serde_json::from_str::<RawPlay<'_>>(
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
