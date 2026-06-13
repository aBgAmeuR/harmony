use axum::{
    Json,
    extract::{Multipart, State},
    http::StatusCode,
};
use harmony_rs::create_package;
use serde::Serialize;
use tracing::{debug, info};
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::worker::Job;

use crate::AppState;

#[derive(Serialize)]
pub struct UploadResponse {
    pub public_id: String,
    pub status: &'static str,
}

fn is_zip(data: &[u8]) -> bool {
    data.starts_with(&[0x50, 0x4B, 0x03, 0x04])
}

pub async fn upload_package(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<(StatusCode, Json<UploadResponse>), (StatusCode, String)> {
    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|err| (StatusCode::BAD_REQUEST, err.to_string()))?
    {
        debug!(field_name = ?field.name(), "multipart field received");

        if field.name() != Some("file") {
            continue;
        }

        let file_name = field.file_name().unwrap_or("unknown").to_string();
        let data = field
            .bytes()
            .await
            .map_err(|err| (StatusCode::BAD_REQUEST, err.to_string()))?;

        debug!(file_name = %file_name, size_bytes = data.len(), "reading upload bytes");

        info!(
            file_name = %file_name,
            size_bytes = %data.len(),
            "package upload received"
        );

        tracing::Span::current().record("upload.file_name", file_name.as_str());
        tracing::Span::current().record("upload.size_bytes", data.len() as i64);

        if !is_zip(&data) {
            return Err((
                StatusCode::UNPROCESSABLE_ENTITY,
                "file is not a valid zip archive".to_string(),
            ));
        }

        let file_size = i32::try_from(data.len())
            .map_err(|_| (StatusCode::BAD_REQUEST, "file too large".to_string()))?;

        let pool = state.db_pool.clone();
        let package = tokio::task::spawn_blocking(move || {
            let mut conn = pool.get().map_err(|e| e.to_string())?;
            create_package(&mut conn, &file_name, file_size).map_err(|e| e.to_string())
        })
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;

        state.ram_store.insert(package.id, data.to_vec());

        let span = tracing::Span::current();
        span.record("package.id", package.id);
        span.record("package.public_id", package.public_id.as_str());

        state
            .jobs
            .send(Job {
                package_id: package.id,
                parent_cx: tracing::Span::current().context(),
            })
            .await
            .map_err(|_| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "worker unavailable".to_string(),
                )
            })?;

        return Ok((
            StatusCode::ACCEPTED,
            Json(UploadResponse {
                public_id: package.public_id,
                status: "pending",
            }),
        ));
    }

    Err((StatusCode::BAD_REQUEST, "no file".to_string()))
}
