//! Spotify `platform` string, folded into a closed set.

/// Client that recorded the play. Every input string maps to one variant.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Platform {
    Web,
    Android,
    Ios,
    Linux,
    Windows,
    Na,
    Other,
}

impl Platform {
    /// Value stored in `interactions.platform`.
    #[must_use]
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Web => "web_player",
            Self::Android => "android",
            Self::Ios => "ios",
            Self::Linux => "linux",
            Self::Windows => "windows",
            Self::Na => "not_applicable",
            Self::Other => "other",
        }
    }
}

impl From<&str> for Platform {
    fn from(raw: &str) -> Self {
        let trimmed = raw.trim();
        if trimmed.is_empty() {
            return Self::Other;
        }
        // Spotify sends ASCII. Folding in place avoids one `String` per play.
        // Unicode lowercase can turn a non-ASCII letter into an ASCII one, so that input keeps the copy.
        if !trimmed.is_ascii() {
            return Self::folded(&trimmed.to_lowercase());
        }
        Self::folded(trimmed)
    }
}

impl Platform {
    fn folded(text: &str) -> Self {
        let has = |needle: &str| {
            text.as_bytes()
                .windows(needle.len())
                .any(|window| window.eq_ignore_ascii_case(needle.as_bytes()))
        };
        if has("web_player") {
            return Self::Web;
        }
        if has("android") {
            return Self::Android;
        }
        if has("ios") || has("iphone") || has("os x") || has("macos") {
            return Self::Ios;
        }
        if has("linux") {
            return Self::Linux;
        }
        if has("windows") {
            return Self::Windows;
        }
        if has("partner")
            || text.eq_ignore_ascii_case("not_applicable")
            || text.eq_ignore_ascii_case("not applicable")
        {
            return Self::Na;
        }
        Self::Other
    }
}

#[cfg(test)]
mod tests {
    use super::Platform;

    #[test]
    fn known_clients_map_to_stored_names() {
        assert_eq!(Platform::from("web_player").as_str(), "web_player");
        assert_eq!(Platform::from("Android OS").as_str(), "android");
        assert_eq!(Platform::from("iPhone").as_str(), "ios");
        assert_eq!(Platform::from("os x").as_str(), "ios");
        assert_eq!(Platform::from("linux").as_str(), "linux");
        assert_eq!(Platform::from("windows").as_str(), "windows");
        assert_eq!(Platform::from("not_applicable").as_str(), "not_applicable");
        assert_eq!(Platform::from("not applicable").as_str(), "not_applicable");
        assert_eq!(Platform::from("partner").as_str(), "not_applicable");
        assert_eq!(Platform::from("fridge").as_str(), "other");
        assert_eq!(Platform::from("  ").as_str(), "other");
        assert_eq!(
            Platform::from("Windows 10 (10.0.19045; x64)").as_str(),
            "windows"
        );
        assert_eq!(Platform::from("NOT APPLICABLE").as_str(), "not_applicable");
        assert_eq!(Platform::from("Ändroid").as_str(), "other");
    }
}
