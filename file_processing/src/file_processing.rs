use crate::models::DefaultTrack;
use anyhow::{Context, Result};
use regex::Regex;
use serde_json::from_slice;
use std::fs::File;
use std::io::Read;
use zip::read::ZipArchive;

const NAME_REGEX: &str = r"Spotify Extended Streaming History/Streaming_History_Audio_\d{4}(-\d{4})?_\d+\.json";
const FAILED_TO_OPEN: &str = "Failed to open file";
const FAILED_TO_READ_ZIP: &str = "Failed to read zip archive";
const FAILED_TO_COMPILE_REGEX: &str = "Failed to compile regex";
const FAILED_TO_GET_FILE: &str = "Failed to get file at index";
const FAILED_TO_EXTRACT_JSON: &str = "Failed to extract JSON tracks from file";
const FAILED_TO_READ: &str = "Failed to read contents of file";
const FAILED_TO_PARSE: &str = "Failed to parse JSON in file";

/// Process files within a zip archive and extract DefaultTrack data.
pub fn process_files(file_path: &str) -> Result<Vec<DefaultTrack>> {
    let archive = File::open(file_path)
        .with_context(|| format!("{}: {}", FAILED_TO_OPEN, file_path))?;
    let mut tracks: Vec<DefaultTrack> = Vec::new();

    let mut archive = ZipArchive::new(archive)
        .with_context(|| format!("{}", FAILED_TO_READ_ZIP))?;

    let name_regex = Regex::new(NAME_REGEX)
    .with_context(|| format!("{}", FAILED_TO_COMPILE_REGEX))?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i)
            .with_context(|| format!("{}: {}", FAILED_TO_GET_FILE, i))?;

        if !is_valid_file(&file, &name_regex) {
            continue;
        }

        let json_tracks = extract_json_tracks(&mut file)
            .with_context(|| format!("{}", FAILED_TO_EXTRACT_JSON))?;

        tracks.extend(json_tracks);
    }

    Ok(tracks)
}

/// Checks if the file name matches the expected format.
fn is_valid_file(file: &zip::read::ZipFile, name_regex: &Regex) -> bool {
    let file_name = file.name().to_string();
    name_regex.is_match(&file_name)
}

/// Extracts DefaultTrack data from a JSON file within the zip archive.
fn extract_json_tracks(file: &mut zip::read::ZipFile) -> Result<Vec<DefaultTrack>> {
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)
        .with_context(|| format!("{} {:?}", FAILED_TO_READ, file.name()))?;

    let json_tracks: Vec<DefaultTrack> = from_slice(&buffer)
        .with_context(|| format!("{} {:?}", FAILED_TO_PARSE, file.name()))?;

    Ok(json_tracks)
}
