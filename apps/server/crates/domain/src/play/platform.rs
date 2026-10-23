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

        let lower = trimmed.to_lowercase();
        if lower.contains("web_player") {
            return Self::Web;
        }
        if lower.contains("android") {
            return Self::Android;
        }
        if lower.contains("ios")
            || lower.contains("iphone")
            || lower.contains("os x")
            || lower.contains("macos")
        {
            return Self::Ios;
        }
        if lower.contains("linux") {
            return Self::Linux;
        }
        if lower.contains("windows") {
            return Self::Windows;
        }
        if lower.contains("partner") || lower == "not_applicable" || lower == "not applicable" {
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
    }
}
