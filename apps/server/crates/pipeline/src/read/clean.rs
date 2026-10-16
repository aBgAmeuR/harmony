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

    // Every pass needs one trigger byte to match. Most titles hold none and never enter the regex engine.
    let mut cleaned = Cow::Borrowed(trimmed);
    if cleaned.contains('.') {
        cleaned = strip(&cleaners.ext, cleaned, "");
    }
    if cleaned
        .bytes()
        .any(|byte| matches!(byte, b'(' | b'[' | b'{'))
    {
        for pattern in &cleaners.junk {
            cleaned = strip(pattern, cleaned, "");
        }
        cleaned = strip(&cleaners.brackets, cleaned, "");
    }
    if double_space(&cleaned) {
        cleaned = strip(&cleaners.spaces, cleaned, " ");
    }
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
    if cleaned.starts_with(['-', '_']) || cleaned.ends_with(['-', '_']) {
        return strip(&cleaners.edges, cleaned, "");
    }
    cleaned
}

/// Trigger of `\s{2,}`: regex `\s` and `char::is_whitespace` are both Unicode `White_Space`.
fn double_space(text: &str) -> bool {
    let mut previous = false;
    for character in text.chars() {
        let space = character.is_whitespace();
        if space && previous {
            return true;
        }
        previous = space;
    }
    false
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
    fn passes_still_run_when_their_trigger_appears() {
        assert_eq!(title("Song.FLAC"), "Song");
        assert_eq!(title("F.I.C.O."), "F.I.C.O.");
        assert_eq!(title("Song  (Live)  Take"), "Song Take");
        assert_eq!(title("- Song _"), "Song");
        assert_eq!(title("Song\u{3000}\u{3000}Two"), "Song Two");
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
