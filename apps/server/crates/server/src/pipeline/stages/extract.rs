use std::collections::HashSet;
use std::io::{Cursor, Read};
use std::sync::LazyLock;

use regex::Regex;
use zip::ZipArchive;

use crate::pipeline::error::ExtractError;
use crate::pipeline::report::ExtractReport;
use crate::pipeline::types::ArchiveFile;

static STREAMING_FILE_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
        r"Spotify Extended Streaming History/Streaming_History_Audio_(\d{4}(-\d{4})?)_(\d+)\.json",
    )
    .expect("invalid regex")
});

fn normalize_zip_path(path: &str) -> String {
    path.replace('\\', "/")
}

pub struct ExtractInput {
    pub zip_bytes: Vec<u8>,
    pub selected_files: Option<Vec<String>>,
}

pub struct ExtractOutput {
    pub files: Vec<ArchiveFile>,
}

pub fn run(input: ExtractInput) -> Result<(ExtractOutput, ExtractReport), ExtractError> {
    let cursor = Cursor::new(&input.zip_bytes);
    let mut archive = ZipArchive::new(cursor)?;

    let selected: Option<HashSet<String>> = input
        .selected_files
        .as_ref()
        .map(|files| files.iter().map(|path| normalize_zip_path(path)).collect());

    let mut files = Vec::new();

    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|source| ExtractError::ReadEntry {
                name: format!("index {i}"),
                source,
            })?;

        let name = normalize_zip_path(file.name());
        if !STREAMING_FILE_RE.is_match(&name) {
            continue;
        }

        if let Some(selected) = selected.as_ref()
            && !selected.contains(&name)
        {
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

    let report = ExtractReport {
        files_taken_count: files.len(),
    };

    Ok((ExtractOutput { files }, report))
}
