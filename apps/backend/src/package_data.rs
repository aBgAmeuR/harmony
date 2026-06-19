use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use diesel::result::Error as DieselError;

use crate::AppState;

pub async fn get_package_data(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let pool = state.db_pool.clone();

    let row = tokio::task::spawn_blocking(move || {
        let mut conn = pool.get().map_err(|e| e.to_string())?;
        harmony_rs::get_package_data(&mut conn, &id).map_err(|e| match e {
            DieselError::NotFound => "not found".to_string(),
            other => other.to_string(),
        })
    })
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    .map_err(|e| {
        if e == "not found" {
            (StatusCode::NOT_FOUND, "package data not found".to_string())
        } else {
            (StatusCode::INTERNAL_SERVER_ERROR, e)
        }
    })?;

    Ok(Json(row.value))
}
