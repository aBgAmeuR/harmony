use std::sync::Arc;

use axum::{
    Router,
    extract::DefaultBodyLimit,
    routing::{get, post},
};
use dashmap::DashMap;
use harmony_rs::{DbPool, establish_pool};
use tokio::sync::mpsc;

#[path = "lib/otel.rs"]
mod otel;
mod package_data;
mod upload;
mod worker;

pub type RamStore = Arc<DashMap<i32, Vec<u8>>>;

#[derive(Clone)]
pub struct AppState {
    pub db_pool: DbPool,
    pub ram_store: RamStore,
    pub jobs: mpsc::Sender<worker::Job>,
}

async fn health() -> &'static str {
    "OK"
}

#[tokio::main]
async fn main() {
    let _guard = otel::init_otel();
    let pool = establish_pool();

    let (jobs_tx, jobs_rx) = mpsc::channel::<worker::Job>(64);
    let state = AppState {
        db_pool: pool,
        ram_store: Arc::new(DashMap::new()),
        jobs: jobs_tx,
    };

    tokio::spawn(worker::run(state.clone(), jobs_rx));

    let app = app(state);

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
            post(upload::upload_package).layer(DefaultBodyLimit::max(50 * 1024 * 1024)),
        )
        .route(
            "/api/v1/packages/{id}/data",
            get(package_data::get_package_data),
        )
        .with_state(state)
}
