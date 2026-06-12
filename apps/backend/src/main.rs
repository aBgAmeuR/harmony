use axum::{
    Json, Router,
    extract::{DefaultBodyLimit, Multipart, State},
    http::StatusCode,
    routing::{get, post},
};
use harmony_rs::{DbPool, create_package, establish_pool};
use regex::Regex;
use std::io::Cursor;
use std::sync::LazyLock;
use tracing::info;
use zip::ZipArchive;

#[path = "lib/otel.rs"]
mod otel;

static STREAMING_FILE_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
        r"Spotify Extended Streaming History/Streaming_History_Audio_(\d{4}(-\d{4})?)_(\d+)\.json",
    )
    .expect("invalid regex")
});

#[derive(Clone)]
struct AppState {
    db_pool: DbPool,
}

async fn health() -> &'static str {
    "OK"
}

fn is_zip(data: &[u8]) -> bool {
    data.starts_with(&[0x50, 0x4B, 0x03, 0x04])
}

async fn upload_package(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Json<Vec<String>>, (StatusCode, String)> {
    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|err| (StatusCode::BAD_REQUEST, err.to_string()))?
    {
        eprintln!("[DEBUG] field name={:?}", field.name());

        if field.name() != Some("file") {
            continue;
        }

        let file_name = field.file_name().unwrap_or("unknown").to_string();
        eprintln!("[DEBUG] reading bytes for file={file_name}");
        let data = field
            .bytes()
            .await
            .map_err(|err| (StatusCode::BAD_REQUEST, err.to_string()))?;

        eprintln!("[DEBUG] bytes read: {} bytes", data.len());

        info!(
            file_name = %file_name,
            size_bytes = %data.len(),
            "package upload received"
        );

        if !is_zip(&data) {
            return Err((
                StatusCode::UNPROCESSABLE_ENTITY,
                "file is not a valid zip archive".to_string(),
            ));
        }

        let file_size = i32::try_from(data.len())
            .map_err(|_| (StatusCode::BAD_REQUEST, "file too large".to_string()))?;

        // Move both zip parsing AND db insert into spawn_blocking
        let pool = state.db_pool.clone();
        let matched = tokio::task::spawn_blocking(move || -> Result<Vec<String>, String> {
            // Parse zip
            let cursor = Cursor::new(data.to_vec());
            let mut archive =
                ZipArchive::new(cursor).map_err(|e| format!("failed to read zip: {e}"))?;

            let matched: Vec<String> = (0..archive.len())
                .filter_map(|i| {
                    let file = archive.by_index(i).ok()?;
                    let name = file.name().to_string();
                    if STREAMING_FILE_RE.is_match(&name) {
                        info!(file = %name, "matched streaming history file");
                        Some(name)
                    } else {
                        None
                    }
                })
                .collect();

            // Save package record
            let mut conn = pool.get().map_err(|e| e.to_string())?;
            create_package(&mut conn, &file_name, file_size).map_err(|e| e.to_string())?;

            Ok(matched)
        })
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;

        return Ok(Json(matched));
    }

    Err((StatusCode::BAD_REQUEST, "no file".to_string()))
}

#[tokio::main]
async fn main() {
    let _guard = otel::init_otel();
    let pool = establish_pool();

    let app_state = AppState { db_pool: pool };
    let app = app(app_state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .expect("failed to bind to port 3000");

    println!("server is running on http://127.0.0.1:3000");

    axum::serve(listener, app.into_make_service())
        .await
        .expect("failed to start server");
}

fn app(state: AppState) -> Router {
    Router::new()
        .layer(otel::OtelInResponseLayer::default())
        .layer(otel::OtelAxumLayer::default())
        .route("/health", get(health))
        .route(
            "/api/v1/packages",
            post(upload_package).layer(DefaultBodyLimit::max(50 * 1024 * 1024)),
        )
        .with_state(state)
}
