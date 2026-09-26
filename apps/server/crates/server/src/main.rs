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

use config::Config;
use package_upload::PackageUpload;
use pipeline::DeezerClient;
use storage::S3ObjectStore;

pub type RamStore = Arc<DashMap<i32, PackageUpload>>;

#[derive(Clone)]
pub struct AppState {
    pub packages: store::PackageStore,
    pub ram_store: RamStore,
    pub jobs: mpsc::Sender<worker::Job>,
    pub progress: Arc<progress::ProgressHub>,
    pub object_store: Arc<S3ObjectStore>,
    pub deezer: Arc<DeezerClient>,
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
    let _guard = otel::init_otel();

    let (jobs_tx, jobs_rx) = mpsc::channel::<worker::Job>(64);
    let state = AppState {
        packages: store::PackageStore::new(),
        ram_store: Arc::new(DashMap::new()),
        jobs: jobs_tx,
        progress: Arc::new(progress::ProgressHub::new()),
        object_store: Arc::new(S3ObjectStore::new(
            config.s3_endpoint,
            config.s3_bucket,
            config.aws_access_key_id,
            config.aws_secret_access_key,
        )),
        deezer: Arc::new(pipeline::build_deezer_client(
            config.deezer_proxy_urls,
            config.deezer_proxy_secret,
        )),
    };

    tokio::spawn(worker::run(state.clone(), jobs_rx));

    let app = app(state);

    let addr = format!("{}:{}", config.host, config.port);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("failed to bind to port");

    tracing::info!("server is running on http://{addr}");
    println!("server is running on http://{addr}");

    axum::serve(listener, app.into_make_service())
        .await
        .expect("failed to start server");
}

fn app(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health))
        .route(
            "/api/v1/packages",
            post(http::upload_package).layer(DefaultBodyLimit::max(50 * 1024 * 1024)),
        )
        .route("/api/v1/packages/{id}", get(http::get_package_handler))
        .route(
            "/api/v1/packages/{id}/stream",
            get(progress::stream_package_progress),
        )
        .with_state(state)
        .layer(otel::OtelInResponseLayer)
        .layer(otel::OtelAxumLayer::default())
        .layer(CorsLayer::permissive())
}
