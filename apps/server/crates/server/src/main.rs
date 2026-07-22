 use std::sync::Arc;

use axum::{
    Router,
    extract::DefaultBodyLimit,
    routing::{get, post},
};
use dashmap::DashMap;
use harmony_db::establish_pool;
use tokio::sync::mpsc;
use tower_http::cors::CorsLayer;

mod db_file;
mod error;
mod otel;
mod package;
mod package_data;
mod package_upload;
mod pipeline;
mod progress;
mod storage;
mod upload;
mod worker;

use package_upload::PackageUpload;
use storage::S3ObjectStore;

pub type RamStore = Arc<DashMap<i32, PackageUpload>>;

#[derive(Clone)]
pub struct AppState {
    pub pool: harmony_db::DbPool,
    pub ram_store: RamStore,
    pub jobs: mpsc::Sender<worker::Job>,
    pub progress: Arc<progress::ProgressHub>,
    pub object_store: Arc<S3ObjectStore>,
}

async fn health() -> &'static str {
    "OK"
}

#[tokio::main]
async fn main() {
    let _guard = otel::init_otel();
    let pool = establish_pool();
    let object_store = Arc::new(
        S3ObjectStore::from_env()
            .await
            .expect("failed to initialize object storage"),
    );

    let (jobs_tx, jobs_rx) = mpsc::channel::<worker::Job>(64);
    let state = AppState {
        pool,
        ram_store: Arc::new(DashMap::new()),
        jobs: jobs_tx,
        progress: Arc::new(progress::ProgressHub::new()),
        object_store,
    };

    tokio::spawn(worker::run(state.clone(), jobs_rx));

    let app = app(state);

    let host = std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = format!("{host}:{port}");

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
            post(upload::upload_package).layer(DefaultBodyLimit::max(50 * 1024 * 1024)),
        )
        .route("/api/v1/packages/{id}", get(package::get_package_handler))
        .route(
            "/api/v1/packages/{id}/stream",
            get(progress::stream_package_progress),
        )
        .route(
            "/api/v1/packages/{id}/data",
            get(package_data::get_package_data_handler),
        )
        .route(
            "/api/v1/packages/{id}/db",
            get(db_file::get_db_file),
        )
        .with_state(state)
        .layer(otel::OtelInResponseLayer::default())
        .layer(otel::OtelAxumLayer::default())
        .layer(CorsLayer::permissive())
}
