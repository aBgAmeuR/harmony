use std::sync::Arc;

use axum::{
    Router,
    extract::DefaultBodyLimit,
    routing::{get, post},
};
use dashmap::DashMap;
use tokio::sync::mpsc;
use tower_http::cors::CorsLayer;

mod config;
mod error;
mod http;
mod otel;
mod package_upload;
mod pipeline;
mod progress;
mod storage;
mod store;
mod worker;

use config::{APP_VERSION, Config, DeezerMode, StorageConfig};
use package_upload::PackageUpload;
use pipeline::DeezerClient;
use storage::Storage;

pub type RamStore = Arc<DashMap<i32, PackageUpload>>;

/// Room for multipart boundaries and the `selected_files` field on top of the ZIP.
const MULTIPART_OVERHEAD_BYTES: usize = 1024 * 1024;

#[derive(Clone)]
pub struct AppState {
    pub packages: store::PackageStore,
    pub ram_store: RamStore,
    pub jobs: mpsc::Sender<worker::Job>,
    pub progress: Arc<progress::ProgressHub>,
    pub object_store: Arc<Storage>,
    pub deezer: Arc<DeezerClient>,
    pub max_upload_bytes: usize,
}

async fn health() -> &'static str {
    "OK"
}

#[tokio::main]
async fn main() {
    let _ = dotenvy::dotenv();

    let config = Config::from_env().unwrap_or_else(|err| {
        eprintln!("{err}");
        std::process::exit(1);
    });
    let storage = Storage::from_config(&config.storage).unwrap_or_else(|err| {
        eprintln!("{err}");
        std::process::exit(1);
    });
    let telemetry = otel::init(config.log_format);

    let storage_description = config.storage.describe();
    let deezer_description = config.deezer.describe();
    let deezer_direct = matches!(config.deezer, DeezerMode::Direct { .. });
    let s3_without_public_url =
        matches!(&config.storage, StorageConfig::S3(s3) if s3.public_url.is_none());

    let (jobs_tx, jobs_rx) = mpsc::channel::<worker::Job>(64);
    let state = AppState {
        packages: store::PackageStore::new(),
        ram_store: Arc::new(DashMap::new()),
        jobs: jobs_tx,
        progress: Arc::new(progress::ProgressHub::new()),
        object_store: Arc::new(storage),
        deezer: Arc::new(pipeline::build_deezer_client(config.deezer)),
        max_upload_bytes: config.max_upload_bytes,
    };

    tokio::spawn(worker::run(state.clone(), jobs_rx));

    let app = app(state);

    let addr = format!("{}:{}", config.host, config.port);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("failed to bind to port");

    tracing::info!(
        version = APP_VERSION,
        address = %addr,
        storage = %storage_description,
        deezer = %deezer_description,
        max_upload_mb = config.max_upload_bytes / (1024 * 1024),
        otel = telemetry.otel_enabled,
        log_format = config.log_format.as_str(),
        "harmony listening on http://{addr}"
    );
    if deezer_direct {
        tracing::info!(
            "Deezer requests go straight from this server; large imports can take 20+ minutes. Set DEEZER_PROXY_URLS to go faster."
        );
    }
    if s3_without_public_url {
        tracing::warn!(
            "S3_PUBLIC_URL is not set: /files/{{id}}.duckdb returns 404, so package pages cannot load their data from this server."
        );
    }

    axum::serve(listener, app.into_make_service())
        .await
        .expect("failed to start server");
}

fn app(state: AppState) -> Router {
    let max_upload_bytes = state.max_upload_bytes;
    Router::new()
        .route("/health", get(health))
        .route("/api/v1/config", get(http::get_server_config))
        .route(
            "/api/v1/packages",
            post(http::upload_package).layer(DefaultBodyLimit::max(
                max_upload_bytes + MULTIPART_OVERHEAD_BYTES,
            )),
        )
        .route("/api/v1/packages/{id}", get(http::get_package_handler))
        .route(
            "/api/v1/packages/{id}/stream",
            get(progress::stream_package_progress),
        )
        .route("/files/{file_name}", get(http::get_package_file))
        .with_state(state)
        .layer(otel::OtelInResponseLayer)
        .layer(otel::OtelAxumLayer::default().filter(otel::trace_request_path))
        .layer(CorsLayer::permissive())
}
