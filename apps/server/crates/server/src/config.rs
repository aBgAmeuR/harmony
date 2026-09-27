use std::path::{Path, PathBuf};

use reqwest::Url;

pub const DEFAULT_DATA_DIR: &str = "./data";
pub const DEFAULT_S3_REGION: &str = "auto";
pub const DEFAULT_DEEZER_RATE_LIMIT: u32 = 8;
pub const DEFAULT_MAX_UPLOAD_MB: u32 = 50;

pub const APP_VERSION: &str = match option_env!("HARMONY_VERSION") {
    Some(version) => version,
    None => "dev",
};

const DEEZER_RATE_LIMIT_MAX: u32 = 50;
const MAX_UPLOAD_MB_MAX: u32 = 2000;

/// SPA entry point written by the TanStack Start build.
pub const SPA_SHELL_FILE: &str = "_shell.html";

pub struct Config {
    pub host: String,
    pub port: u16,
    pub storage: StorageConfig,
    pub deezer: DeezerMode,
    pub max_upload_bytes: usize,
    pub log_format: LogFormat,
    pub static_dir: Option<PathBuf>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LogFormat {
    Compact,
    Pretty,
    Json,
}

impl LogFormat {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Compact => "compact",
            Self::Pretty => "pretty",
            Self::Json => "json",
        }
    }
}

pub enum StorageConfig {
    Local { data_dir: PathBuf },
    S3(Box<S3Config>),
}

pub struct S3Config {
    pub endpoint: Url,
    pub bucket: String,
    pub region: String,
    pub access_key_id: String,
    pub secret_access_key: String,
    pub public_url: Option<Url>,
}

pub enum DeezerMode {
    Direct { requests_per_second: u32 },
    Proxies { urls: Vec<Url>, secret: String },
}

impl StorageConfig {
    /// Human-readable summary without credentials.
    pub fn describe(&self) -> String {
        match self {
            Self::Local { data_dir } => format!("local ({})", data_dir.display()),
            Self::S3(s3) => format!(
                "s3 ({}, bucket {})",
                s3.endpoint.host_str().unwrap_or("unknown host"),
                s3.bucket
            ),
        }
    }
}

impl DeezerMode {
    /// Human-readable summary without proxy URLs or the proxy secret.
    pub fn describe(&self) -> String {
        match self {
            Self::Direct {
                requests_per_second,
            } => format!("direct ({requests_per_second} req/s)"),
            Self::Proxies { urls, .. } => format!("proxies ({})", urls.len()),
        }
    }
}

struct ConfigInput {
    pub host: Option<String>,
    pub port: Option<String>,
    pub data_dir: Option<String>,
    pub s3_endpoint: Option<String>,
    pub s3_bucket: Option<String>,
    pub s3_region: Option<String>,
    pub s3_public_url: Option<String>,
    pub aws_access_key_id: Option<String>,
    pub aws_secret_access_key: Option<String>,
    pub deezer_proxy_urls: Option<String>,
    pub deezer_proxy_secret: Option<String>,
    pub deezer_rate_limit: Option<String>,
    pub max_upload_mb: Option<String>,
    pub log_format: Option<String>,
    pub static_dir: Option<String>,
}

#[derive(Debug, thiserror::Error)]
#[error("{0}")]
pub struct ConfigError(String);

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        Self::from_input(ConfigInput {
            host: std::env::var("HOST").ok(),
            port: std::env::var("PORT").ok(),
            data_dir: std::env::var("DATA_DIR").ok(),
            s3_endpoint: std::env::var("S3_ENDPOINT").ok(),
            s3_bucket: std::env::var("S3_BUCKET").ok(),
            s3_region: std::env::var("S3_REGION").ok(),
            s3_public_url: std::env::var("S3_PUBLIC_URL").ok(),
            aws_access_key_id: std::env::var("AWS_ACCESS_KEY_ID").ok(),
            aws_secret_access_key: std::env::var("AWS_SECRET_ACCESS_KEY").ok(),
            deezer_proxy_urls: std::env::var("DEEZER_PROXY_URLS").ok(),
            deezer_proxy_secret: std::env::var("DEEZER_PROXY_SECRET").ok(),
            deezer_rate_limit: std::env::var("DEEZER_RATE_LIMIT").ok(),
            max_upload_mb: std::env::var("MAX_UPLOAD_MB").ok(),
            log_format: std::env::var("LOG_FORMAT").ok(),
            static_dir: std::env::var("STATIC_DIR").ok(),
        })
    }

    fn from_input(input: ConfigInput) -> Result<Self, ConfigError> {
        let mut problems = Vec::new();

        let port = match input.port.as_deref() {
            None => 3000,
            Some(value) if value.trim().is_empty() => 3000,
            Some(value) => match value.parse::<u16>() {
                Ok(port) => port,
                Err(_) => {
                    problems.push(format!("PORT is invalid: {value}"));
                    0
                }
            },
        };

        let storage = parse_storage(&input, &mut problems);
        let deezer = parse_deezer(&input, &mut problems);
        let max_upload_mb = parse_bounded(
            input.max_upload_mb.as_deref(),
            "MAX_UPLOAD_MB",
            DEFAULT_MAX_UPLOAD_MB,
            1,
            MAX_UPLOAD_MB_MAX,
            &mut problems,
        );
        let log_format = parse_log_format(input.log_format.as_deref(), &mut problems);
        let static_dir = parse_static_dir(input.static_dir.as_deref(), &mut problems);

        let (Some(storage), Some(deezer), Some(max_upload_mb), Some(log_format)) =
            (storage, deezer, max_upload_mb, log_format)
        else {
            return Err(ConfigError(format_problems(&problems)));
        };
        // A setting can parse while another one (PORT, a proxy URL) still failed.
        if !problems.is_empty() {
            return Err(ConfigError(format_problems(&problems)));
        }

        let host = match non_blank(input.host.as_deref()) {
            Some(host) => host.trim().to_string(),
            None => "127.0.0.1".to_string(),
        };

        Ok(Self {
            host,
            port,
            storage,
            deezer,
            max_upload_bytes: max_upload_mb as usize * 1024 * 1024,
            log_format,
            static_dir,
        })
    }
}

fn parse_static_dir(value: Option<&str>, problems: &mut Vec<String>) -> Option<PathBuf> {
    let dir = Path::new(non_blank(value)?.trim());
    if !dir.join(SPA_SHELL_FILE).is_file() {
        problems.push(format!(
            "STATIC_DIR '{}' must be a directory containing {SPA_SHELL_FILE}",
            dir.display()
        ));
        return None;
    }
    Some(dir.to_path_buf())
}

fn parse_log_format(value: Option<&str>, problems: &mut Vec<String>) -> Option<LogFormat> {
    let Some(raw) = non_blank(value) else {
        return Some(LogFormat::Compact);
    };
    let raw = raw.trim();
    match raw.to_ascii_lowercase().as_str() {
        "compact" => Some(LogFormat::Compact),
        "pretty" => Some(LogFormat::Pretty),
        "json" => Some(LogFormat::Json),
        _ => {
            problems.push(format!(
                "LOG_FORMAT is invalid: {raw} (expected compact, pretty or json)"
            ));
            None
        }
    }
}

fn parse_storage(input: &ConfigInput, problems: &mut Vec<String>) -> Option<StorageConfig> {
    let Some(raw_endpoint) = non_blank(input.s3_endpoint.as_deref()) else {
        let stray = [
            ("S3_BUCKET", &input.s3_bucket),
            ("S3_REGION", &input.s3_region),
            ("S3_PUBLIC_URL", &input.s3_public_url),
        ]
        .into_iter()
        .filter(|(_, value)| non_blank(value.as_deref()).is_some())
        .map(|(name, _)| name)
        .collect::<Vec<_>>();
        if !stray.is_empty() {
            problems.push(format!(
                "S3_ENDPOINT is not set but other S3 settings are: {}",
                stray.join(", ")
            ));
            return None;
        }

        let data_dir = non_blank(input.data_dir.as_deref())
            .map(str::trim)
            .unwrap_or(DEFAULT_DATA_DIR);
        return Some(StorageConfig::Local {
            data_dir: PathBuf::from(data_dir),
        });
    };

    let endpoint = parse_url(raw_endpoint, "S3_ENDPOINT", problems);
    let bucket = require_set(input.s3_bucket.as_deref(), "S3_BUCKET", problems);
    let access_key_id = require_set(
        input.aws_access_key_id.as_deref(),
        "AWS_ACCESS_KEY_ID",
        problems,
    );
    let secret_access_key = require_set(
        input.aws_secret_access_key.as_deref(),
        "AWS_SECRET_ACCESS_KEY",
        problems,
    );
    let region = non_blank(input.s3_region.as_deref())
        .map(str::trim)
        .unwrap_or(DEFAULT_S3_REGION)
        .to_string();
    let public_url = match non_blank(input.s3_public_url.as_deref()) {
        None => Some(None),
        Some(raw) => parse_url(raw, "S3_PUBLIC_URL", problems).map(Some),
    };

    Some(StorageConfig::S3(Box::new(S3Config {
        endpoint: endpoint?,
        bucket: bucket?,
        region,
        access_key_id: access_key_id?,
        secret_access_key: secret_access_key?,
        public_url: public_url?,
    })))
}

fn parse_deezer(input: &ConfigInput, problems: &mut Vec<String>) -> Option<DeezerMode> {
    let Some(raw_urls) = non_blank(input.deezer_proxy_urls.as_deref()) else {
        let stray_secret = non_blank(input.deezer_proxy_secret.as_deref()).is_some();
        let requests_per_second = parse_bounded(
            input.deezer_rate_limit.as_deref(),
            "DEEZER_RATE_LIMIT",
            DEFAULT_DEEZER_RATE_LIMIT,
            1,
            DEEZER_RATE_LIMIT_MAX,
            problems,
        );
        if stray_secret {
            problems.push("DEEZER_PROXY_SECRET is set but DEEZER_PROXY_URLS is not".to_string());
            return None;
        }
        return Some(DeezerMode::Direct {
            requests_per_second: requests_per_second?,
        });
    };

    let urls = parse_proxy_urls(raw_urls, problems);
    let secret = match input.deezer_proxy_secret.as_deref() {
        None => {
            problems.push("DEEZER_PROXY_SECRET is not set".to_string());
            None
        }
        Some(secret) if secret.trim().is_empty() => {
            problems.push("DEEZER_PROXY_SECRET is empty".to_string());
            None
        }
        Some(secret) => Some(secret.to_string()),
    };

    // parse_proxy_urls always reports a problem when it returns no URL.
    if urls.is_empty() {
        return None;
    }
    Some(DeezerMode::Proxies {
        urls,
        secret: secret?,
    })
}

fn format_problems(problems: &[String]) -> String {
    let mut message = String::from("invalid configuration:");
    for problem in problems {
        message.push('\n');
        message.push_str(problem);
    }
    message
}

fn non_blank(value: Option<&str>) -> Option<&str> {
    value.filter(|value| !value.trim().is_empty())
}

fn require_set(value: Option<&str>, name: &str, problems: &mut Vec<String>) -> Option<String> {
    match non_blank(value) {
        Some(value) => Some(value.to_string()),
        None => {
            problems.push(format!("{name} is not set"));
            None
        }
    }
}

fn parse_url(raw: &str, name: &str, problems: &mut Vec<String>) -> Option<Url> {
    match Url::parse(raw.trim()) {
        Ok(url) => Some(url),
        Err(err) => {
            problems.push(format!("{name} is invalid: {err}"));
            None
        }
    }
}

fn parse_bounded(
    value: Option<&str>,
    name: &str,
    default: u32,
    min: u32,
    max: u32,
    problems: &mut Vec<String>,
) -> Option<u32> {
    let Some(raw) = non_blank(value) else {
        return Some(default);
    };
    let raw = raw.trim();
    match raw.parse::<u32>() {
        Ok(parsed) if (min..=max).contains(&parsed) => Some(parsed),
        _ => {
            problems.push(format!("{name} is invalid: {raw} (expected {min}-{max})"));
            None
        }
    }
}

fn parse_proxy_urls(raw: &str, problems: &mut Vec<String>) -> Vec<Url> {
    let mut urls = Vec::new();
    let mut saw_segment = false;

    for segment in raw.split(',') {
        let trimmed = segment.trim();
        if trimmed.is_empty() {
            continue;
        }
        saw_segment = true;
        match Url::parse(trimmed) {
            Ok(url) => urls.push(url),
            Err(err) => problems.push(format!("invalid proxy URL '{trimmed}': {err}")),
        }
    }

    if !saw_segment {
        problems.push("DEEZER_PROXY_URLS is empty".to_string());
    }

    urls
}

#[cfg(test)]
mod tests {
    use super::*;

    const ACCESS_KEY: &str = "aws-access-key-value";
    const SECRET_KEY: &str = "aws-secret-key-value";
    const PROXY_SECRET: &str = "proxy-secret-value";

    fn expect_err(result: Result<Config, ConfigError>) -> ConfigError {
        match result {
            Ok(_) => panic!("expected configuration error"),
            Err(err) => err,
        }
    }

    fn empty_input() -> ConfigInput {
        ConfigInput {
            host: None,
            port: None,
            data_dir: None,
            s3_endpoint: None,
            s3_bucket: None,
            s3_region: None,
            s3_public_url: None,
            aws_access_key_id: None,
            aws_secret_access_key: None,
            deezer_proxy_urls: None,
            deezer_proxy_secret: None,
            deezer_rate_limit: None,
            max_upload_mb: None,
            log_format: None,
            static_dir: None,
        }
    }

    fn valid_input() -> ConfigInput {
        ConfigInput {
            s3_endpoint: Some("https://s3.example".to_string()),
            s3_bucket: Some("harmony".to_string()),
            aws_access_key_id: Some(ACCESS_KEY.to_string()),
            aws_secret_access_key: Some(SECRET_KEY.to_string()),
            deezer_proxy_urls: Some("http://proxy-a.example".to_string()),
            deezer_proxy_secret: Some(PROXY_SECRET.to_string()),
            ..empty_input()
        }
    }

    #[test]
    fn empty_input_uses_local_storage_and_direct_deezer() {
        let config = Config::from_input(empty_input()).unwrap();

        let StorageConfig::Local { data_dir } = &config.storage else {
            panic!("expected local storage");
        };
        assert_eq!(data_dir, &PathBuf::from("./data"));
        assert!(matches!(
            config.deezer,
            DeezerMode::Direct {
                requests_per_second: 8
            }
        ));
        assert_eq!(config.max_upload_bytes, 50 * 1024 * 1024);
        assert_eq!(config.host, "127.0.0.1");
        assert_eq!(config.port, 3000);
    }

    #[test]
    fn blank_values_count_as_unset() {
        let mut input = empty_input();
        input.data_dir = Some("  ".to_string());
        input.s3_bucket = Some(" ".to_string());
        input.deezer_proxy_urls = Some("".to_string());
        input.max_upload_mb = Some(" ".to_string());

        let config = Config::from_input(input).unwrap();
        assert!(matches!(config.storage, StorageConfig::Local { .. }));
        assert!(matches!(config.deezer, DeezerMode::Direct { .. }));
        assert_eq!(config.max_upload_bytes, 50 * 1024 * 1024);
    }

    #[test]
    fn s3_endpoint_alone_lists_missing_s3_settings() {
        let mut input = empty_input();
        input.s3_endpoint = Some("https://s3.example".to_string());

        let message = expect_err(Config::from_input(input)).to_string();
        for name in ["S3_BUCKET", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"] {
            assert!(message.contains(&format!("{name} is not set")), "{message}");
        }
    }

    #[test]
    fn full_s3_settings_default_region_and_no_public_url() {
        let config = Config::from_input(valid_input()).unwrap();

        let StorageConfig::S3(s3) = &config.storage else {
            panic!("expected s3 storage");
        };
        assert_eq!(s3.endpoint.as_str(), "https://s3.example/");
        assert_eq!(s3.bucket, "harmony");
        assert_eq!(s3.region, "auto");
        assert!(s3.public_url.is_none());
    }

    #[test]
    fn s3_region_and_public_url_are_read() {
        let mut input = valid_input();
        input.s3_region = Some("garage".to_string());
        input.s3_public_url = Some("https://cdn.example/harmony".to_string());

        let config = Config::from_input(input).unwrap();
        let StorageConfig::S3(s3) = &config.storage else {
            panic!("expected s3 storage");
        };
        assert_eq!(s3.region, "garage");
        assert_eq!(
            s3.public_url.as_ref().map(Url::as_str),
            Some("https://cdn.example/harmony")
        );
    }

    #[test]
    fn s3_settings_without_endpoint_are_rejected() {
        let mut input = empty_input();
        input.s3_bucket = Some("harmony".to_string());
        input.s3_public_url = Some("https://cdn.example".to_string());

        let message = expect_err(Config::from_input(input)).to_string();
        assert!(
            message.contains(
                "S3_ENDPOINT is not set but other S3 settings are: S3_BUCKET, S3_PUBLIC_URL"
            ),
            "{message}"
        );
    }

    #[test]
    fn aws_credentials_without_endpoint_are_ignored() {
        let mut input = empty_input();
        input.aws_access_key_id = Some(ACCESS_KEY.to_string());
        input.aws_secret_access_key = Some(SECRET_KEY.to_string());

        let config = Config::from_input(input).unwrap();
        assert!(matches!(config.storage, StorageConfig::Local { .. }));
    }

    #[test]
    fn data_dir_is_trimmed() {
        let mut input = empty_input();
        input.data_dir = Some(" /srv/harmony ".to_string());

        let config = Config::from_input(input).unwrap();
        let StorageConfig::Local { data_dir } = &config.storage else {
            panic!("expected local storage");
        };
        assert_eq!(data_dir, &PathBuf::from("/srv/harmony"));
    }

    #[test]
    fn proxy_secret_without_urls_is_rejected_without_leaking_it() {
        let mut input = empty_input();
        input.deezer_proxy_secret = Some(PROXY_SECRET.to_string());

        let message = expect_err(Config::from_input(input)).to_string();
        assert!(
            message.contains("DEEZER_PROXY_SECRET is set but DEEZER_PROXY_URLS is not"),
            "{message}"
        );
        assert!(!message.contains(PROXY_SECRET), "{message}");
    }

    #[test]
    fn deezer_rate_limit_is_bounded() {
        for value in ["0", "51", "abc"] {
            let mut input = empty_input();
            input.deezer_rate_limit = Some(value.to_string());

            let message = expect_err(Config::from_input(input)).to_string();
            assert!(
                message.contains(&format!(
                    "DEEZER_RATE_LIMIT is invalid: {value} (expected 1-50)"
                )),
                "{message}"
            );
        }

        let mut input = empty_input();
        input.deezer_rate_limit = Some("50".to_string());
        let config = Config::from_input(input).unwrap();
        assert!(matches!(
            config.deezer,
            DeezerMode::Direct {
                requests_per_second: 50
            }
        ));
    }

    #[test]
    fn deezer_rate_limit_is_ignored_in_proxy_mode() {
        let mut input = valid_input();
        input.deezer_rate_limit = Some("abc".to_string());

        let config = Config::from_input(input).unwrap();
        assert!(matches!(config.deezer, DeezerMode::Proxies { .. }));
    }

    #[test]
    fn max_upload_mb_is_bounded() {
        for value in ["0", "2001", "x"] {
            let mut input = empty_input();
            input.max_upload_mb = Some(value.to_string());

            let message = expect_err(Config::from_input(input)).to_string();
            assert!(
                message.contains(&format!(
                    "MAX_UPLOAD_MB is invalid: {value} (expected 1-2000)"
                )),
                "{message}"
            );
        }

        let mut input = empty_input();
        input.max_upload_mb = Some("2000".to_string());
        let config = Config::from_input(input).unwrap();
        assert_eq!(config.max_upload_bytes, 2000 * 1024 * 1024);
    }

    #[test]
    fn invalid_endpoint_and_empty_secret_are_both_reported() {
        let mut input = valid_input();
        input.s3_endpoint = Some("not a url".to_string());
        input.deezer_proxy_secret = Some("   ".to_string());

        let message = expect_err(Config::from_input(input)).to_string();
        assert!(message.contains("S3_ENDPOINT is invalid"), "{message}");
        assert!(
            message.contains("DEEZER_PROXY_SECRET is empty"),
            "{message}"
        );
        assert!(!message.contains(ACCESS_KEY), "{message}");
        assert!(!message.contains(PROXY_SECRET), "{message}");
    }

    #[test]
    fn valid_proxy_list_keeps_defaults_and_raw_secret() {
        let mut input = valid_input();
        input.deezer_proxy_urls =
            Some("http://proxy-a.example, http://proxy-b.example".to_string());
        input.deezer_proxy_secret = Some(" secret ".to_string());

        let config = Config::from_input(input).unwrap();
        let DeezerMode::Proxies { urls, secret } = &config.deezer else {
            panic!("expected proxy mode");
        };
        assert_eq!(urls.len(), 2);
        assert_eq!(config.host, "127.0.0.1");
        assert_eq!(config.port, 3000);
        assert_eq!(secret, " secret ");
    }

    #[test]
    fn invalid_port_names_the_value_and_hides_secrets() {
        let mut input = valid_input();
        input.port = Some("nope".to_string());

        let message = expect_err(Config::from_input(input)).to_string();
        assert!(message.contains("PORT is invalid: nope"), "{message}");
        assert!(!message.contains(ACCESS_KEY), "{message}");
        assert!(!message.contains(PROXY_SECRET), "{message}");
    }

    #[test]
    fn log_format_defaults_to_compact_and_ignores_case() {
        let config = Config::from_input(empty_input()).unwrap();
        assert_eq!(config.log_format, LogFormat::Compact);

        let mut input = empty_input();
        input.log_format = Some("JSON".to_string());
        let config = Config::from_input(input).unwrap();
        assert_eq!(config.log_format, LogFormat::Json);

        let mut input = empty_input();
        input.log_format = Some(" pretty ".to_string());
        let config = Config::from_input(input).unwrap();
        assert_eq!(config.log_format, LogFormat::Pretty);
    }

    #[test]
    fn invalid_log_format_names_the_value() {
        let mut input = empty_input();
        input.log_format = Some("nope".to_string());

        let message = expect_err(Config::from_input(input)).to_string();
        assert!(
            message.contains("LOG_FORMAT is invalid: nope (expected compact, pretty or json)"),
            "{message}"
        );
    }

    #[test]
    fn describe_hides_credentials_and_proxy_urls() {
        let config = Config::from_input(valid_input()).unwrap();

        let storage = config.storage.describe();
        let deezer = config.deezer.describe();
        assert_eq!(storage, "s3 (s3.example, bucket harmony)");
        assert_eq!(deezer, "proxies (1)");
        for description in [&storage, &deezer] {
            assert!(!description.contains(ACCESS_KEY), "{description}");
            assert!(!description.contains(SECRET_KEY), "{description}");
            assert!(!description.contains(PROXY_SECRET), "{description}");
            assert!(!description.contains("proxy-a.example"), "{description}");
        }
    }

    #[test]
    fn static_dir_is_disabled_by_default() {
        let config = Config::from_input(empty_input()).unwrap();
        assert!(config.static_dir.is_none());

        let mut input = empty_input();
        input.static_dir = Some("  ".to_string());
        let config = Config::from_input(input).unwrap();
        assert!(config.static_dir.is_none());
    }

    #[test]
    fn static_dir_with_shell_is_accepted() {
        let dir = tempfile::TempDir::new().unwrap();
        std::fs::write(dir.path().join(SPA_SHELL_FILE), "<html></html>").unwrap();

        let mut input = empty_input();
        input.static_dir = Some(dir.path().display().to_string());
        let config = Config::from_input(input).unwrap();
        assert_eq!(config.static_dir.as_deref(), Some(dir.path()));
    }

    #[test]
    fn static_dir_without_shell_is_rejected() {
        let dir = tempfile::TempDir::new().unwrap();
        let path = dir.path().display().to_string();

        let mut input = empty_input();
        input.static_dir = Some(path.clone());
        let message = expect_err(Config::from_input(input)).to_string();
        assert!(
            message.contains(&format!(
                "STATIC_DIR '{path}' must be a directory containing _shell.html"
            )),
            "{message}"
        );
    }

    #[test]
    fn missing_static_dir_is_rejected() {
        let dir = tempfile::TempDir::new().unwrap();
        let path = dir.path().join("missing").display().to_string();

        let mut input = empty_input();
        input.static_dir = Some(path.clone());
        let message = expect_err(Config::from_input(input)).to_string();
        assert!(
            message.contains(&format!("STATIC_DIR '{path}'")),
            "{message}"
        );
    }

    #[test]
    fn describe_local_storage_and_direct_deezer() {
        let config = Config::from_input(empty_input()).unwrap();

        assert_eq!(config.storage.describe(), "local (./data)");
        assert_eq!(config.deezer.describe(), "direct (8 req/s)");
    }
}
