//! Strip audio extensions and edition notes from a Spotify title.

use std::borrow::Cow;
use std::sync::LazyLock;

use regex::Regex;

struct Cleaners {
    ext: Regex,
    junk: [Regex; 4],
    brackets: Regex,
    spaces: Regex,
    edges: Regex,
}

/// Borrows `raw` when no cleaner matches. A pass that matches owns a new string.
pub fn title(raw: &str) -> Cow<'_, str> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Cow::Borrowed("");
    }
    let Some(cleaners) = cleaners() else {
        return Cow::Borrowed(trimmed);
    };

    let mut cleaned = cleaners.ext.replace(trimmed, "");
    for pattern in &cleaners.junk {
        cleaned = strip(pattern, cleaned, "");
    }
    cleaned = strip(&cleaners.brackets, cleaned, "");
    cleaned = strip(&cleaners.spaces, cleaned, " ");
    let cleaned = match cleaned {
        Cow::Borrowed(text) => Cow::Borrowed(text.trim()),
        Cow::Owned(text) => {
            let trimmed = text.trim();
            if trimmed.len() == text.len() {
                Cow::Owned(text)
            } else {
                Cow::Owned(trimmed.to_owned())
            }
        }
    };
    strip(&cleaners.edges, cleaned, "")
}

/// `replace_all` that hands back the same `Cow` when nothing matched.
fn strip<'a>(pattern: &Regex, text: Cow<'a, str>, with: &str) -> Cow<'a, str> {
    let changed = match pattern.replace_all(&text, with) {
        Cow::Owned(changed) => Some(changed),
        Cow::Borrowed(_) => None,
    };
    changed.map_or(text, Cow::Owned)
}

fn cleaners() -> Option<&'static Cleaners> {
    static CLEANERS: LazyLock<Option<Cleaners>> = LazyLock::new(compile);
    CLEANERS.as_ref()
}

fn compile() -> Option<Cleaners> {
    let ext = Regex::new(r"(?i)\.(mp3|flac|wav|m4a|ogg|opus)$").ok()?;
    let junk = [
        Regex::new(r"(?i)(?:[\(\[\{])\s*(?:feat\.?|ft\.?|featuring|with|prod\.?|starring)\s+[^)\]}]+(?:[\)\]\}])").ok()?,
        Regex::new(r"(?i)(?:[\(\[\{])\s*(?:official\s+(?:music\s+)?video|video\s?clip|audio|lyrics|visualizer|hd|hq|4k|1080p|720p)\s*(?:[\)\]\}])").ok()?,
        Regex::new(r"(?i)(?:[\(\[\{])\s*(?:remaster(?:ed)?|mix|remix|edit|radio\s?edit|original\s?mix|extended|instrumental|karaoke|live|session|version)\s*(?:[\)\]\}])").ok()?,
        Regex::new(r"(?i)(?:[\(\[\{])\s*(?:spanish|french|english|german|japanese|mono|stereo)\s*(?:version)?\s*(?:[\)\]\}])").ok()?,
    ];
    let brackets = Regex::new(r"\(\s*\)|\[\s*\]|\{\s*\}").ok()?;
    let spaces = Regex::new(r"\s{2,}").ok()?;
    let edges = Regex::new(r"^[-_]\s*|\s*[-_]$").ok()?;
    Some(Cleaners {
        ext,
        junk,
        brackets,
        spaces,
        edges,
    })
}

#[cfg(test)]
mod tests {
    use std::borrow::Cow;

    use super::title;

    #[test]
    fn strips_extension_feat_and_remaster() {
        assert_eq!(title("  Song (feat. Ada).mp3  "), "Song");
        assert_eq!(title("Song (Remastered)"), "Song");
        assert_eq!(title("Song (French Version)"), "Song");
        assert_eq!(title("Song [Official Video]"), "Song");
    }

    #[test]
    fn a_clean_title_is_borrowed() {
        assert!(matches!(title(" Song "), Cow::Borrowed("Song")));
    }

    #[test]
    fn a_title_that_is_only_a_note_becomes_empty() {
        assert_eq!(title("(feat. Ada)"), "");
    }
}
