use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use diesel::result::Error as DieselError;
use harmony_db::get_package_data;

use crate::AppState;

pub async fn get_package_data_handler(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let mut conn = state
        .pool
        .get()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let row = get_package_data(&mut conn, &id)
        .await
        .map_err(|e| match e {
            DieselError::NotFound => (StatusCode::NOT_FOUND, "package data not found".to_string()),
            other => (StatusCode::INTERNAL_SERVER_ERROR, other.to_string()),
        })?;

    Ok(Json(row.value))
}
