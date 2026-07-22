use std::path::PathBuf;

use axum::{
    extract::Path,
    http::StatusCode,
    response::IntoResponse,
};
use tokio::fs;

use crate::AppState;

pub async fn get_db_file(
    axum::extract::State(_state): axum::extract::State<AppState>,
    Path(id): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let safe_id = id
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '-' || *c == '_')
        .collect::<String>();

    if safe_id.is_empty() || safe_id != id {
        return Err((StatusCode::BAD_REQUEST, "invalid package id".into()));
    }

    let path = PathBuf::from("/data/duckdb").join(format!("{safe_id}.duckdb"));

    let bytes = fs::read(&path).await.map_err(|_| {
        (StatusCode::NOT_FOUND, format!("package '{safe_id}' not found"))
    })?;

    Ok((
        [
            ("Content-Type", "application/octet-stream"),
            ("Content-Disposition", "attachment"),
        ],
        bytes,
    ))
}
