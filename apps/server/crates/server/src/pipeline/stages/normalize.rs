use std::sync::LazyLock;

use regex::Regex;

use crate::pipeline::error::NormalizeError;
use crate::pipeline::types::{NormalizedInteraction, TrackKey};
use crate::pipeline::PipelineContext;

const MIN_MS_PLAYED: i64 = 30_000;

static FILE_EXT_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?i)\.(mp3|flac|wav|m4a|ogg|opus)$").expect("invalid regex"));

static TRACK_JUNK_PATTERNS: LazyLock<[Regex; 4]> = LazyLock::new(|| {
    [
        Regex::new(r"(?i)(?:[\(\[\{])\s*(?:feat\.?|ft\.?|featuring|with|prod\.?|starring)\s+[^)\]}]+(?:[\)\]\}])").expect("invalid regex"),
        Regex::new(r"(?i)(?:[\(\[\{])\s*(?:official\s+(?:music\s+)?video|video\s?clip|audio|lyrics|visualizer|hd|hq|4k|1080p|720p)\s*(?:[\)\]\}])").expect("invalid regex"),
        Regex::new(r"(?i)(?:[\(\[\{])\s*(?:remaster(?:ed)?|mix|remix|edit|radio\s?edit|original\s?mix|extended|instrumental|karaoke|live|session|version)\s*(?:[\)\]\}])").expect("invalid regex"),
        Regex::new(r"(?i)(?:[\(\[\{])\s*(?:spanish|french|english|german|japanese|mono|stereo)\s*(?:version)?\s*(?:[\)\]\}])").expect("invalid regex"),
    ]
});

static EMPTY_BRACKETS_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"\(\s*\)|\[\s*\]|\{\s*\}").expect("invalid regex"));

static MULTI_SPACE_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"\s{2,}").expect("invalid regex"));

static EDGE_DASH_UNDERSCORE_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[-_]\s*|\s*[-_]$").expect("invalid regex"));

fn normalize_track_name(title: &str) -> String {
    let trimmed = title.trim();
    if trimmed.is_empty() {
        return String::new();
    }

    let mut cleaned = FILE_EXT_RE.replace(trimmed, "").into_owned();

    for pattern in TRACK_JUNK_PATTERNS.iter() {
        cleaned = pattern.replace_all(&cleaned, "").into_owned();
    }

    cleaned = EMPTY_BRACKETS_RE.replace_all(&cleaned, "").into_owned();
    cleaned = MULTI_SPACE_RE.replace_all(&cleaned, " ").into_owned();
    cleaned = cleaned.trim().to_string();
    EDGE_DASH_UNDERSCORE_RE
        .replace_all(&cleaned, "")
        .into_owned()
}

fn normalize_platform(raw: &str) -> &'static str {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return "other";
    }

    let lower = trimmed.to_lowercase();

    if lower.contains("web_player") {
        return "web_player";
    }
    if lower.contains("android") {
        return "android";
    }
    if lower.contains("ios")
        || lower.contains("iphone")
        || lower.contains("os x")
        || lower.contains("macos")
    {
        return "ios";
    }
    if lower.contains("linux") {
        return "linux";
    }
    if lower.contains("windows") {
        return "windows";
    }
    if lower.contains("partner") || lower == "not_applicable" || lower == "not applicable" {
        return "not_applicable";
    }

    "other"
}

#[tracing::instrument(
    skip(ctx),
    name = "pipeline.normalize",
    fields(
        package_id = ctx.package_id,
        input_interactions_count = ctx.raw.len(),
        kept,
        rejected,
        catalogue_size,
    ),
)]
pub fn run(ctx: &mut PipelineContext) -> Result<(), NormalizeError> {
    let mut kept = 0usize;
    let mut rejected = 0usize;

    for raw in ctx.raw.drain(..) {
        let Some(track) = raw
            .master_metadata_track_name
            .as_deref()
            .filter(|s| !s.trim().is_empty())
        else {
            rejected += 1;
            continue;
        };

        let Some(artist) = raw
            .master_metadata_album_artist_name
            .as_deref()
            .filter(|s| !s.trim().is_empty())
        else {
            rejected += 1;
            continue;
        };

        if raw.ms_played <= MIN_MS_PLAYED {
            rejected += 1;
            continue;
        }

        let clean_track = normalize_track_name(track);
        if clean_track.is_empty() {
            rejected += 1;
            continue;
        }

        let clean_artist = artist.trim().to_string();
        let track_key = format!("{clean_artist}-{clean_track}");

        ctx.catalogue.insert(
            track_key.clone(),
            TrackKey {
                artist: clean_artist,
                track: clean_track,
            },
        );

        ctx.normalized.push(NormalizedInteraction {
            track_key,
            ts: raw.ts,
            platform: normalize_platform(&raw.platform).to_string(),
            ms_played: raw.ms_played,
            shuffle: raw.shuffle,
            skipped: raw.skipped,
            offline: raw.offline,
        });
        kept += 1;
    }

    ctx.stats.normalize_kept_count = kept;
    ctx.stats.normalize_rejected_count = rejected;

    let span = tracing::Span::current();
    span.record("kept", kept as i64);
    span.record("rejected", rejected as i64);
    span.record("catalogue_size", ctx.catalogue.len() as i64);

    tracing::info!(kept = kept, rejected = rejected, "normalize stage finished");

    if ctx.normalized.is_empty() {
        return Err(NormalizeError::NoInteractionsKept);
    }

    Ok(())
}
