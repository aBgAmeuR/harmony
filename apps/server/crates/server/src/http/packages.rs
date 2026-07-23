use axum::{
    Json,
    extract::{Multipart, Path, State},
    http::StatusCode,
};
use chrono::NaiveDateTime;
use harmony_db::{create_package, get_package_by_public_id, models::Package};
use serde::Serialize;
use tracing::info;
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::error::{ApiError, ApiResult, PackageId};
use crate::package_upload::PackageUpload;
use crate::worker::Job;
use crate::AppState;

#[derive(Serialize)]
pub struct UploadResponse {
    pub public_id: String,
    pub status: &'static str,
}

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
}

impl PackageResponse {
    fn from_package(package: Package) -> Self {
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
        }
    }
}

fn is_zip(data: &[u8]) -> bool {
    data.starts_with(&[0x50, 0x4B, 0x03, 0x04])
}

pub async fn upload_package(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<(StatusCode, Json<UploadResponse>), ApiError> {
    let mut file_name = None;
    let mut file_data = None;
    let mut selected_files = None;

    while let Some(field) = multipart.next_field().await? {
        info!(field_name = ?field.name(), "multipart field received");

        match field.name() {
            Some("file") => {
                file_name = Some(field.file_name().unwrap_or("unknown").to_string());
                file_data = Some(field.bytes().await?.to_vec());
            }
            Some("selected_files") => {
                let raw = field.text().await?;
                selected_files = Some(serde_json::from_str::<Vec<String>>(&raw).map_err(|err| {
                    ApiError::bad_request(format!("invalid selected_files JSON: {err}"))
                })?);
            }
            _ => {}
        }
    }

    let file_name = file_name.ok_or_else(|| ApiError::bad_request("no file"))?;
    let data = file_data.ok_or_else(|| ApiError::bad_request("no file"))?;

    if let Some(files) = selected_files.as_ref()
        && files.is_empty()
    {
        return Err(ApiError::bad_request("selected_files must not be empty"));
    }

    info!(
        file_name = %file_name,
        size_bytes = data.len(),
        selected_files_count = selected_files.as_ref().map(|files| files.len()),
        "package upload received"
    );

    tracing::Span::current().record("upload.file_name", file_name.as_str());
    tracing::Span::current().record("upload.size_bytes", data.len() as i64);

    if !is_zip(&data) {
        return Err(ApiError::unprocessable("file is not a valid zip archive"));
    }

    let file_size = i32::try_from(data.len()).map_err(|_| ApiError::bad_request("file too large"))?;

    let mut conn = state.conn().await?;
    let package = create_package(&mut conn, &file_name, file_size).await?;

    state.ram_store.insert(
        package.id,
        PackageUpload {
            zip_bytes: data,
            selected_files,
        },
    );

    let span = tracing::Span::current();
    span.record("package.id", package.id);
    span.record("package.public_id", package.public_id.as_str());

    state
        .jobs
        .send(Job {
            package_id: package.id,
            public_id: package.public_id.clone(),
            parent_cx: tracing::Span::current().context(),
        })
        .await
        .map_err(|_| ApiError::internal("worker unavailable"))?;

    Ok((
        StatusCode::ACCEPTED,
        Json(UploadResponse {
            public_id: package.public_id,
            status: "pending",
        }),
    ))
}

pub async fn get_package_handler(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> ApiResult<PackageResponse> {
    let package_id: PackageId = id.parse()?;

    let mut conn = state.conn().await?;
    let package = get_package_by_public_id(&mut conn, package_id.as_str()).await?;

    Ok(Json(PackageResponse::from_package(package)))
}
