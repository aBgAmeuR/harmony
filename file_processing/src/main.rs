mod calculations;
mod file_processing;
mod models;

use anyhow::{Context, Result};
use calculations::{calculate_average_track_scores, print_top_tracks};
use chrono::{DateTime, Utc};
use file_processing::process_files;
use std::time::Instant;

fn main() -> Result<()> {
    let file_path = "./my_spotify_data.zip";
    let start = Instant::now();

    let tracks = process_files(file_path).context("Failed to process files")?;

    let reference_date = tracks
        .last()
        .and_then(|track| DateTime::parse_from_rfc3339(&track.ts).ok())
        .map(|dt| dt.with_timezone(&Utc))
        .context("Failed to get reference date from tracks")?;

    let sorted_tracks_all_time = calculate_average_track_scores(tracks.clone(), 0, reference_date)
        .context("Failed to get tracks all time")?;
    let sorted_tracks_year = calculate_average_track_scores(tracks.clone(), 365, reference_date)
        .context("Failed to get tracks last year")?;
    let sorted_tracks_6_month = calculate_average_track_scores(tracks, 180, reference_date)
        .context("Failed to get tracks last 6 months")?;

    let duration = start.elapsed();

    print_top_tracks(&sorted_tracks_all_time, "Top 10 tracks all time:");
    print_top_tracks(&sorted_tracks_year, "Top 10 tracks last year:");
    print_top_tracks(&sorted_tracks_6_month, "Top 10 tracks last 6 months:");

    println!("Time elapsed in processing files: {:?}", duration);

    Ok(())
}
