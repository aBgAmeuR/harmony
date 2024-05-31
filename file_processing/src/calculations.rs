use crate::models::{DefaultTrack, Track};
use anyhow::Result;
use chrono::{DateTime, Duration, Utc};
use std::collections::HashMap;

/// Filters tracks within a specified time range and aggregates their play data.
fn filter_and_aggregate_tracks(
    tracks: Vec<DefaultTrack>,
    time_range_days: i64,
    reference_date: DateTime<Utc>,
) -> Result<HashMap<String, Track>> {
    let start_date = reference_date - Duration::days(time_range_days);
    let mut track_count: HashMap<String, Track> = HashMap::new();

    for track in tracks {
        let track_date = DateTime::parse_from_rfc3339(&track.ts)?.with_timezone(&Utc);
        
        if !is_within_time_range(track_date, start_date, reference_date, time_range_days) {
            continue;
        }

        if let Some(aggregated_track) = aggregate_track_data(&track, &mut track_count) {
            update_aggregated_track(aggregated_track, &track);
        }
    }

    Ok(track_count)
}

/// Checks if the track date is within the specified time range.
fn is_within_time_range(
    track_date: DateTime<Utc>,
    start_date: DateTime<Utc>,
    reference_date: DateTime<Utc>,
    time_range_days: i64,
) -> bool {
    (time_range_days == 0 || track_date >= start_date) && track_date <= reference_date
}

/// Aggregates track data into the track count map.
fn aggregate_track_data<'a>(
    track: &'a DefaultTrack,
    track_count: &'a mut HashMap<String, Track>,
) -> Option<&'a mut Track> {
    if let (Some(spotify_track_uri), Some(album_name), Some(artist_name), Some(track_name)) = (
        track.spotify_track_uri.clone(),
        track.master_metadata_album_album_name.clone(),
        track.master_metadata_album_artist_name.clone(),
        track.master_metadata_track_name.clone(),
    ) {
        if track.ms_played < 5000 {
            return None;
        }

        let entry = track_count.entry(spotify_track_uri.clone()).or_insert_with(|| Track {
            total_played: 0,
            ms_played: 0,
            default_spotify_uri: spotify_track_uri,
            score: None,
            album_name,
            artist_name,
            track_name,
        });
        Some(entry)
    } else {
        None
    }
}

/// Updates the aggregated track data with new play data.
fn update_aggregated_track(aggregated_track: &mut Track, track: &DefaultTrack) {
    aggregated_track.total_played += 1;
    aggregated_track.ms_played += track.ms_played;
}

/// Calculates the average scores for tracks and returns them sorted by score.
pub fn calculate_average_track_scores(
    tracks: Vec<DefaultTrack>,
    time_range_days: i64,
    reference_date: DateTime<Utc>,
) -> Result<Vec<Track>> {
    let track_count = filter_and_aggregate_tracks(tracks, time_range_days, reference_date)?;

    let mut sorted_tracks: Vec<Track> = track_count
        .into_values()
        .map(|mut track| {
            track.compute_average_score();
            track
        })
        .collect();

    sorted_tracks.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());

    Ok(sorted_tracks)
}

/// Prints the top tracks with a given title.
pub fn print_top_tracks(tracks: &[Track], title: &str) {
    println!("{}", title);
    for track in tracks.iter().take(10) {
        println!("{:?}", track);
    }
}
