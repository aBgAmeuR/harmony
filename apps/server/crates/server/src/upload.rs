use axum::{
    Json,
    extract::{Multipart, State},
    http::StatusCode,
};
use harmony_db::create_package;
use serde::Serialize;
use tracing::info;
use tracing_opentelemetry::OpenTelemetrySpanExt;

use crate::package_upload::PackageUpload;
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
    let mut file_name = None;
    let mut file_data = None;
    let mut selected_files = None;

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|err| (StatusCode::BAD_REQUEST, err.to_string()))?
    {
        info!(field_name = ?field.name(), "multipart field received");

        match field.name() {
            Some("file") => {
                file_name = Some(field.file_name().unwrap_or("unknown").to_string());
                file_data = Some(
                    field
                        .bytes()
                        .await
                        .map_err(|err| (StatusCode::BAD_REQUEST, err.to_string()))?
                        .to_vec(),
                );
            }
            Some("selected_files") => {
                let raw = field
                    .text()
                    .await
                    .map_err(|err| (StatusCode::BAD_REQUEST, err.to_string()))?;
                selected_files = Some(
                    serde_json::from_str::<Vec<String>>(&raw).map_err(|err| {
                        (
                            StatusCode::BAD_REQUEST,
                            format!("invalid selected_files JSON: {err}"),
                        )
                    })?,
                );
            }
            _ => {}
        }
    }

    let file_name = file_name.ok_or((StatusCode::BAD_REQUEST, "no file".to_string()))?;
    let data = file_data.ok_or((StatusCode::BAD_REQUEST, "no file".to_string()))?;

    if let Some(files) = selected_files.as_ref() {
        if files.is_empty() {
            return Err((
                StatusCode::BAD_REQUEST,
                "selected_files must not be empty".to_string(),
            ));
        }
    }

    info!(file_name = %file_name, size_bytes = data.len(), "reading upload bytes");

    info!(
        file_name = %file_name,
        size_bytes = %data.len(),
        selected_files_count = selected_files.as_ref().map(|files| files.len()),
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

    let mut conn = state
        .pool
        .get()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let package = create_package(&mut conn, &file_name, file_size)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

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
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "worker unavailable".to_string(),
            )
        })?;

    Ok((
        StatusCode::ACCEPTED,
        Json(UploadResponse {
            public_id: package.public_id,
            status: "pending",
        }),
    ))
}
