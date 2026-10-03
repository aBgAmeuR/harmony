//! Bind the routes, start the worker, and leave on signal.

mod config;
mod worker;

use std::sync::Arc;
use std::time::Duration;

use adapters::deezer::{Deezer, Mode};
use axum::body::Body;
use axum::extract::{DefaultBodyLimit, Multipart, Path, State};
use axum::http::{HeaderValue, StatusCode, header};
use axum::response::sse::{Event, Sse};
use axum::response::{IntoResponse, Redirect, Response};
use axum::routing::{get, post};
use axum::{Json, Router};
use axum_tracing_opentelemetry::middleware::{OtelAxumLayer, OtelInResponseLayer};
use domain::observe::Progress;
use domain::package::State as PackageState;
use domain::ports::Store;
use http::HttpError;
use serde::Serialize;
use tokio::sync::{Notify, watch};

use crate::config::{Config, Files, LogFormat, Lookup};
use crate::worker::{App, Shelf};

fn main() {
    if std::env::args().nth(1).as_deref() == Some("healthcheck") {
        let code = match tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
        {
            Ok(runtime) => runtime.block_on(healthcheck()),
            Err(err) => {
                eprintln!("healthcheck failed: {err}");
                1
            }
        };
        std::process::exit(code);
    }

    if let Err(err) = boot() {
        eprintln!("{err:#}");
        std::process::exit(1);
    }
}

fn boot() -> anyhow::Result<()> {
    let _ = dotenvy::dotenv();
    let config = Config::from_env()?;
    let guard = init_log(config.log_format())?;

    // Blocking clients own a runtime. Build them before `block_on`, or Tokio
    // panics while dropping that runtime from the server's async thread.
    let blob = Arc::new(open_blob(config.files())?);
    let deezer = Arc::new(Deezer::open(open_mode(config.deezer()))?);
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()?;
    let result = runtime.block_on(serve(config, blob, deezer));
    // `process::exit` skips destructors. Flush the exporter first.
    drop(guard);
    let _ = std::io::Write::flush(&mut std::io::stderr());
    result?;
    std::process::exit(0);
}

async fn serve(config: Config, blob: Arc<Shelf>, deezer: Arc<Deezer>) -> anyhow::Result<()> {
    let app = App {
        store: Arc::new(Store::new()),
        progress: Arc::new(Progress::new()),
        wake: Arc::new(Notify::new()),
        blob,
        deezer,
        max_upload_bytes: config.max_upload_bytes(),
        public_url: config.public_url().map(str::to_owned),
    };

    let (stop_tx, stop_rx) = watch::channel(false);
    let worker = tokio::spawn(worker::listen(app.clone(), stop_rx));
    let cap = usize::try_from(http::body_limit(config.max_upload_bytes())).unwrap_or(usize::MAX);
    let router = routes(app.clone()).layer(DefaultBodyLimit::max(cap));
    let address = format!("{}:{}", config.host(), config.port());
    let listener = tokio::net::TcpListener::bind(&address).await?;
    tracing::info!(%address, "listening");

    tokio::select! {
        result = axum::serve(listener, router) => {
            result?;
        }
        () = interrupted() => {}
    }

    let _ = stop_tx.send(true);
    let (queued, running) = app.store.counts();
    tracing::info!(queued, running, "shutdown");
    worker.abort();
    Ok(())
}

fn open_blob(files: &Files) -> Result<Shelf, domain::ports::PutError> {
    match files {
        Files::Disk { dir } => Ok(Shelf::Dir(adapters::fs::Fs::open(dir)?)),
        Files::Bucket {
            endpoint,
            bucket,
            region,
            access_key,
            secret_key,
            ..
        } => Ok(Shelf::Bucket(adapters::s3::S3::open(
            endpoint, bucket, region, access_key, secret_key,
        )?)),
    }
}

fn open_mode(deezer: &Lookup) -> Mode {
    match deezer {
        Lookup::Direct { per_second } => Mode::Direct {
            per_second: *per_second,
        },
        Lookup::Proxies { urls, secret } => Mode::Proxies {
            urls: urls.clone(),
            secret: secret.clone(),
        },
    }
}

fn init_log(format: LogFormat) -> anyhow::Result<init_tracing_opentelemetry::Guard> {
    let export = otel_export_enabled();
    let config = init_tracing_opentelemetry::TracingConfig::default()
        .with_otel(export)
        .with_logs(export)
        .with_metrics(export)
        .with_file_names(false)
        .with_line_numbers(false)
        .with_thread_names(false)
        .without_span_events()
        .with_timer(init_tracing_opentelemetry::LogTimer::Time)
        .with_resource_config(
            init_tracing_opentelemetry::resource::DetectResource::default()
                .with_fallback_service_name("harmony"),
        );
    let config = match format {
        LogFormat::Compact => config.with_compact_format(),
        LogFormat::Pretty => config.with_pretty_format(),
        LogFormat::Json => config.with_json_format(),
    };
    let guard = config.init_subscriber()?;
    if export {
        tracing::info!("opentelemetry export enabled");
    }
    Ok(guard)
}

/// Export stays off until an OTLP endpoint is set, matching `.env.example`.
fn otel_export_enabled() -> bool {
    std::env::var("OTEL_EXPORTER_OTLP_ENDPOINT").is_ok_and(|value| !value.trim().is_empty())
}

fn routes(app: App) -> Router {
    Router::new()
        .route("/api/v1/config", get(limits))
        .route("/api/v1/packages", post(upload))
        .route("/api/v1/packages/{id}/stream", get(stream))
        .route("/files/{name}", get(download))
        .layer(OtelInResponseLayer)
        .layer(OtelAxumLayer::default())
        .route("/health", get(health))
        .with_state(app)
}

async fn health() -> &'static str {
    http::health()
}

async fn limits(State(app): State<App>) -> Json<http::Limits> {
    Json(http::config(app.max_upload_bytes))
}

async fn upload(State(app): State<App>, mut multipart: Multipart) -> Response {
    let mut name = String::new();
    let mut bytes = None;
    let mut files = None;
    loop {
        let field = match multipart.next_field().await {
            Ok(Some(field)) => field,
            Ok(None) => break,
            Err(err) => return text(StatusCode::BAD_REQUEST, err.to_string()),
        };
        let field_name = field.name().map(str::to_owned);
        match field_name.as_deref() {
            Some("file") => {
                if let Some(file_name) = field.file_name() {
                    name = file_name.to_owned();
                }
                match field.bytes().await {
                    Ok(data) => bytes = Some(data.to_vec()),
                    Err(err) => return text(StatusCode::BAD_REQUEST, err.to_string()),
                }
            }
            Some("selected_files") => match field.text().await {
                Ok(raw) => files = Some(raw),
                Err(err) => return text(StatusCode::BAD_REQUEST, err.to_string()),
            },
            _ => {
                if field.bytes().await.is_err() {
                    return text(StatusCode::BAD_REQUEST, "bad multipart field".to_owned());
                }
            }
        }
    }
    let Some(bytes) = bytes else {
        return text(StatusCode::BAD_REQUEST, "no file".to_owned());
    };
    let source = match http::source(http::Upload::new(name, bytes, files), app.max_upload_bytes) {
        Ok(source) => source,
        Err(err) => return http_error(&err),
    };
    let package = match app.store.open(source) {
        Ok(package) => package,
        Err(err) => return text(StatusCode::BAD_REQUEST, err.to_string()),
    };
    app.progress.open(package.id());
    app.wake.notify_one();
    (
        StatusCode::ACCEPTED,
        Json(Accepted {
            public_id: package.id().to_string(),
            status: PackageState::Queued.as_str(),
        }),
    )
        .into_response()
}

async fn stream(State(app): State<App>, Path(id): Path<String>) -> Response {
    match http::watch(app.progress.as_ref(), &id) {
        Ok(rx) => Sse::new(events(rx)).into_response(),
        Err(err) => http_error(&err),
    }
}

async fn download(State(app): State<App>, Path(name): Path<String>) -> Response {
    let blob = Arc::clone(&app.blob);
    let public_url = app.public_url.clone();
    let opened = tokio::task::spawn_blocking(move || {
        load_download(blob.as_ref(), &name, public_url.as_deref())
    })
    .await;
    match opened {
        Ok(Ok(Loaded::Redirect(url))) => Redirect::temporary(&url).into_response(),
        Ok(Ok(Loaded::Bytes(bytes))) => file_response(bytes),
        Ok(Err(err)) => http_error(&err),
        Err(_) => text(
            StatusCode::INTERNAL_SERVER_ERROR,
            "download failed".to_owned(),
        ),
    }
}

fn load_download(blob: &Shelf, name: &str, public_url: Option<&str>) -> Result<Loaded, HttpError> {
    match http::file(blob, name, public_url)? {
        http::Body::Redirect(url) => Ok(Loaded::Redirect(url)),
        http::Body::File(artifact) => match std::fs::read(artifact.path()) {
            Ok(bytes) => Ok(Loaded::Bytes(bytes)),
            Err(_) => Err(HttpError::Missing),
        },
    }
}

enum Loaded {
    Redirect(String),
    Bytes(Vec<u8>),
}

fn events(
    rx: std::sync::mpsc::Receiver<domain::observe::Event>,
) -> impl futures::Stream<Item = Result<Event, std::convert::Infallible>> {
    futures::stream::unfold(rx, |rx| async move {
        let joined = tokio::task::spawn_blocking(move || {
            let next = rx.recv().ok();
            (rx, next)
        })
        .await
        .ok()?;
        let (rx, next) = joined;
        let event = next?;
        let data = serde_json::to_string(&event).ok()?;
        let sse = Event::default().event("pipeline").data(data);
        Some((Ok(sse), rx))
    })
}

fn file_response(bytes: Vec<u8>) -> Response {
    let mut response = Response::new(Body::from(bytes));
    if let Ok(kind) = HeaderValue::from_str("application/octet-stream") {
        response.headers_mut().insert(header::CONTENT_TYPE, kind);
    }
    response
}

fn http_error(err: &HttpError) -> Response {
    text(status(err.status()), err.to_string())
}

fn text(status: StatusCode, message: String) -> Response {
    (status, message).into_response()
}

fn status(code: u16) -> StatusCode {
    StatusCode::from_u16(code).unwrap_or(StatusCode::BAD_REQUEST)
}

#[derive(Serialize)]
struct Accepted {
    public_id: String,
    status: &'static str,
}

async fn interrupted() {
    let ctrl_c = tokio::signal::ctrl_c();
    #[cfg(unix)]
    {
        let Ok(mut terminate) =
            tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
        else {
            let _ = ctrl_c.await;
            return;
        };
        tokio::select! {
            _ = ctrl_c => {}
            _ = terminate.recv() => {}
        }
    }
    #[cfg(not(unix))]
    {
        let _ = ctrl_c.await;
    }
}

async fn healthcheck() -> i32 {
    match probe().await {
        Ok(()) => 0,
        Err(reason) => {
            eprintln!("healthcheck failed: {reason}");
            1
        }
    }
}

async fn probe() -> Result<(), String> {
    let port = std::env::var("PORT").ok();
    let url = health_url(port.as_deref())?;
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .build()
        .map_err(|err| err.to_string())?;
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|err| format!("{url}: {err}"))?;
    let status = response.status();
    let body = response
        .text()
        .await
        .map_err(|err| format!("{url}: {err}"))?;
    if status != reqwest::StatusCode::OK || body != "ok" {
        return Err(format!("{url} returned {status}: {body}"));
    }
    Ok(())
}

fn health_url(port: Option<&str>) -> Result<String, String> {
    let port = match port.map(str::trim) {
        None | Some("") => 3000,
        Some(value) => value
            .parse::<u16>()
            .map_err(|_| format!("PORT is invalid: {value}"))?,
    };
    if port == 0 {
        return Err("PORT is invalid: 0".to_owned());
    }
    Ok(format!("http://127.0.0.1:{port}/health"))
}
