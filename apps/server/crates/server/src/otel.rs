//! OpenTelemetry setup and middleware re-exports.
//!
//! This module centralizes tracing initialization and exposes Axum
//! OpenTelemetry middleware layers so they can be used as `otel::...`

pub use axum_tracing_opentelemetry::middleware::{OtelAxumLayer, OtelInResponseLayer};
use init_tracing_opentelemetry::TracingConfig;
use init_tracing_opentelemetry::resource::DetectResource;

use crate::config::{APP_VERSION, LogFormat};

/// The binary target is `server`, so its events use the `server` log target.
const DEFAULT_LOG_DIRECTIVES: &str = "server=info,opentelemetry=warn";
const DEFAULT_SERVICE_NAME: &str = "harmony";

pub struct Telemetry {
    _guard: Box<init_tracing_opentelemetry::Guard>,
    pub otel_enabled: bool,
}

pub fn init(log_format: LogFormat) -> Telemetry {
    let env = |name: &str| std::env::var(name).ok();
    let otel_enabled = otel_enabled(
        env("OTEL_EXPORTER_OTLP_ENDPOINT").as_deref(),
        env("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT").as_deref(),
        env("OTEL_SDK_DISABLED").as_deref(),
    );

    let config = TracingConfig::production();
    let config = match log_format {
        LogFormat::Compact => config.with_compact_format(),
        LogFormat::Pretty => config.with_pretty_format(),
        LogFormat::Json => config.with_json_format(),
    };

    let guard = config
        .with_file_names(false)
        .with_line_numbers(false)
        .without_span_events()
        .with_log_directives(log_directives(env("RUST_LOG").as_deref()))
        .with_otel(otel_enabled)
        .with_resource_config(
            DetectResource::default()
                .with_fallback_service_name(DEFAULT_SERVICE_NAME)
                .with_fallback_service_version(APP_VERSION),
        )
        .init_subscriber()
        .expect("failed to initialize tracing subscriber");

    Telemetry {
        _guard: Box::new(guard),
        otel_enabled,
    }
}

/// `RUST_LOG` replaces the default directives entirely when it is set.
fn log_directives(rust_log: Option<&str>) -> String {
    match rust_log.map(str::trim) {
        Some(directives) if !directives.is_empty() => directives.to_string(),
        _ => DEFAULT_LOG_DIRECTIVES.to_string(),
    }
}

/// OTLP export only starts when an endpoint is configured and the SDK is not disabled.
fn otel_enabled(
    endpoint: Option<&str>,
    traces_endpoint: Option<&str>,
    sdk_disabled: Option<&str>,
) -> bool {
    let is_set = |value: Option<&str>| value.is_some_and(|value| !value.trim().is_empty());
    let disabled = sdk_disabled.is_some_and(|value| value.trim().eq_ignore_ascii_case("true"));
    (is_set(endpoint) || is_set(traces_endpoint)) && !disabled
}

/// SSE streams stay open for minutes, so they would only produce noise.
pub fn trace_request_path(path: &str) -> bool {
    (path.starts_with("/api/") && !path.ends_with("/stream")) || path.starts_with("/files/")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn log_directives_fall_back_to_defaults() {
        assert_eq!(log_directives(None), DEFAULT_LOG_DIRECTIVES);
        assert_eq!(log_directives(Some("  ")), DEFAULT_LOG_DIRECTIVES);
        assert_eq!(log_directives(Some("debug")), "debug");
    }

    #[test]
    fn otel_requires_an_endpoint_and_no_sdk_opt_out() {
        let endpoint = Some("http://localhost:4318");

        assert!(!otel_enabled(None, None, None));
        assert!(otel_enabled(endpoint, None, None));
        assert!(otel_enabled(None, endpoint, None));
        assert!(!otel_enabled(endpoint, None, Some("TRUE")));
        assert!(otel_enabled(endpoint, None, Some("false")));
        assert!(!otel_enabled(Some(" "), None, None));
    }

    #[test]
    fn only_api_and_file_requests_are_traced() {
        assert!(trace_request_path("/api/v1/packages"));
        assert!(!trace_request_path("/api/v1/packages/abc/stream"));
        assert!(trace_request_path("/files/abc.duckdb"));
        assert!(!trace_request_path("/health"));
        assert!(!trace_request_path("/assets/index.js"));
        assert!(!trace_request_path("/"));
    }
}
