use std::{path::Path, sync::Arc};

use axum::{
    Router,
    extract::DefaultBodyLimit,
    routing::{any, get, post},
};
use dashmap::DashMap;
use tokio::sync::mpsc;
use tower_http::{
    cors::CorsLayer,
    services::{ServeDir, ServeFile},
};

mod config;
mod error;
mod healthcheck;
mod http;
mod otel;
mod package_upload;
mod pipeline;
mod progress;
mod storage;
mod store;
mod worker;

use config::{APP_VERSION, Config, DeezerMode, SPA_SHELL_FILE, StorageConfig};
use error::ApiError;
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

async fn api_not_found() -> ApiError {
    ApiError::not_found("route not found")
}

#[tokio::main]
async fn main() {
    if std::env::args().nth(1).as_deref() == Some("healthcheck") {
        std::process::exit(healthcheck::run().await);
    }

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
    let static_description = config
        .static_dir
        .as_deref()
        .map_or_else(|| "disabled".to_string(), |dir| dir.display().to_string());
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

    let app = app(state, config.static_dir.as_deref());

    let addr = format!("{}:{}", config.host, config.port);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("failed to bind to port");

    tracing::info!(
        version = APP_VERSION,
        address = %addr,
        storage = %storage_description,
        deezer = %deezer_description,
        static_dir = %static_description,
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

fn app(state: AppState, static_dir: Option<&Path>) -> Router {
    let max_upload_bytes = state.max_upload_bytes;
    let router = Router::new()
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
        .route("/files/{file_name}", get(http::get_package_file));
    let router = match static_dir {
        Some(dir) => router
            .route("/api/{*rest}", any(api_not_found))
            .fallback_service(
                ServeDir::new(dir).fallback(ServeFile::new(dir.join(SPA_SHELL_FILE))),
            ),
        None => router,
    };
    router
        .with_state(state)
        .layer(otel::OtelInResponseLayer)
        .layer(otel::OtelAxumLayer::default().filter(otel::trace_request_path))
        .layer(CorsLayer::permissive())
}
