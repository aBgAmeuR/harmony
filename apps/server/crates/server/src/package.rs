use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use chrono::NaiveDateTime;
use diesel::result::Error as DieselError;
use harmony_db::{get_package_by_public_id, get_package_data, models::Package};
use serde::Serialize;

use crate::AppState;

#[derive(Serialize)]
pub struct PackageResponse {
    pub public_id: String,
    pub file_name: String,
    pub file_size: i32,
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub started_at: Option<NaiveDateTime>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_stage: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_message: Option<String>,
    pub updated_at: NaiveDateTime,
    pub created_at: NaiveDateTime,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub package_data: Option<serde_json::Value>,
}

impl PackageResponse {
    fn from_package(package: Package, package_data: Option<serde_json::Value>) -> Self {
        Self {
            public_id: package.public_id,
            file_name: package.file_name,
            file_size: package.file_size,
            status: package.status,
            started_at: package.started_at,
            error_stage: package.error_stage,
            error_message: package.error_message,
            updated_at: package.updated_at,
            created_at: package.created_at,
            data: package.data,
            package_data,
        }
    }
}

pub async fn get_package_handler(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<PackageResponse>, (StatusCode, String)> {
    let safe_id = id
        .chars()
        .filter(|c| c.is_alphanumeric())
        .collect::<String>();

    if safe_id.is_empty() || safe_id != id {
        return Err((StatusCode::BAD_REQUEST, "invalid package id".to_string()));
    }

    let mut conn = state
        .pool
        .get()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let package = get_package_by_public_id(&mut conn, &id)
        .await
        .map_err(|e| match e {
            DieselError::NotFound => (StatusCode::NOT_FOUND, "package not found".to_string()),
            other => (StatusCode::INTERNAL_SERVER_ERROR, other.to_string()),
        })?;

    let package_data = get_package_data(&mut conn, &id)
        .await
        .ok()
        .map(|row| row.value);

    Ok(Json(PackageResponse::from_package(package, package_data)))
}
