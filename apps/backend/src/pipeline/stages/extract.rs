use std::io::{Cursor, Read};
use std::sync::LazyLock;

use regex::Regex;
use zip::ZipArchive;

use crate::pipeline::error::ExtractError;
use crate::pipeline::types::ArchiveFile;
use crate::pipeline::PipelineContext;

static STREAMING_FILE_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
        r"Spotify Extended Streaming History/Streaming_History_Audio_(\d{4}(-\d{4})?)_(\d+)\.json",
    )
    .expect("invalid regex")
});

#[tracing::instrument(
    skip(ctx),
    name = "pipeline.extract",
    fields(
        package_id = ctx.package_id,
        zip_size_bytes = ctx.zip_bytes.len(),
        input_files_count,
        files_taken_count,
    ),
)]
pub fn run(ctx: &mut PipelineContext) -> Result<(), ExtractError> {
    let cursor = Cursor::new(&ctx.zip_bytes);
    let mut archive = ZipArchive::new(cursor)?;
    let input_files_count = archive.len();

    let mut files = Vec::new();

    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|source| ExtractError::ReadEntry {
                name: format!("index {i}"),
                source,
            })?;

        let name = file.name().to_string();
        if !STREAMING_FILE_RE.is_match(&name) {
            continue;
        }

        let mut content_bytes = Vec::new();
        file.read_to_end(&mut content_bytes)
            .map_err(|source| ExtractError::ReadEntry {
                name: name.clone(),
                source: zip::result::ZipError::from(source),
            })?;

        let content = String::from_utf8_lossy(&content_bytes).into_owned();

        tracing::info!(file = %name, "matched streaming history file");
        files.push(ArchiveFile { name, content });
    }

    if files.is_empty() {
        return Err(ExtractError::NoMatchingFiles);
    }

    ctx.stats.files_taken_count = files.len();
    ctx.files = files;

    let span = tracing::Span::current();
    span.record("input_files_count", input_files_count as u64);
    span.record("files_taken_count", ctx.stats.files_taken_count as i64);

    Ok(())
}
