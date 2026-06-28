//! OpenTelemetry setup and middleware re-exports.
//!
//! This module centralizes tracing initialization and exposes Axum
//! OpenTelemetry middleware layers so they can be used as `otel::...`

pub use axum_tracing_opentelemetry::middleware::{OtelAxumLayer, OtelInResponseLayer};

pub fn init_otel() -> Box<init_tracing_opentelemetry::Guard> {
    let _ = dotenvy::dotenv();

    let guard = init_tracing_opentelemetry::TracingConfig::production()
        .with_compact_format()
        .with_file_names(false)
        .with_line_numbers(false)
        .without_span_events()
        .with_log_directives("harmony_server=info,opentelemetry=warn")
        .init_subscriber()
        .expect("failed to initialize OpenTelemetry subscriber");

    Box::new(guard)
}
