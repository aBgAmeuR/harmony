//! Environment. A bad value refuses to start. `STATIC_DIR` is not read.

use std::path::PathBuf;

/// How the process logs.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum LogFormat {
    Compact,
    Pretty,
    Json,
}

/// Where finished databases are stored.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) enum Files {
    Disk {
        dir: PathBuf,
    },
    Bucket {
        endpoint: String,
        bucket: String,
        region: String,
        access_key: String,
        secret_key: String,
        public_url: Option<String>,
    },
}

/// Deezer, direct or through proxies. Proxies ignore the rate limit.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) enum Lookup {
    Direct { per_second: u32 },
    Proxies { urls: Vec<String>, secret: String },
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct Config {
    host: String,
    port: u16,
    files: Files,
    deezer: Lookup,
    max_upload_bytes: u64,
    log_format: LogFormat,
}

impl Config {
    pub(crate) fn host(&self) -> &str {
        &self.host
    }

    pub(crate) const fn port(&self) -> u16 {
        self.port
    }

    pub(crate) const fn files(&self) -> &Files {
        &self.files
    }

    pub(crate) const fn deezer(&self) -> &Lookup {
        &self.deezer
    }

    pub(crate) const fn max_upload_bytes(&self) -> u64 {
        self.max_upload_bytes
    }

    pub(crate) const fn log_format(&self) -> LogFormat {
        self.log_format
    }

    pub(crate) fn public_url(&self) -> Option<&str> {
        match &self.files {
            Files::Disk { .. } => None,
            Files::Bucket { public_url, .. } => public_url.as_deref(),
        }
    }

    /// # Errors
    ///
    /// [`ConfigError`] when a variable is set but cannot be read.
    pub(crate) fn from_env() -> Result<Self, ConfigError> {
        Self::from_input(&Input {
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
        })
    }

    pub(crate) fn from_input(input: &Input) -> Result<Self, ConfigError> {
        let mut problems = Vec::new();
        let host = non_blank(input.host.as_deref())
            .unwrap_or("127.0.0.1")
            .trim()
            .to_owned();
        let port = parse_port(input.port.as_deref(), &mut problems);
        let files = parse_files(input, &mut problems);
        let deezer = parse_deezer(input, &mut problems);
        let max_upload_mb = parse_bounded(
            input.max_upload_mb.as_deref(),
            "MAX_UPLOAD_MB",
            50,
            1,
            2000,
            &mut problems,
        );
        let log_format = parse_log_format(input.log_format.as_deref(), &mut problems);
        if !problems.is_empty() {
            return Err(ConfigError(join(&problems)));
        }
        let (Some(port), Some(files), Some(deezer), Some(max_upload_mb), Some(log_format)) =
            (port, files, deezer, max_upload_mb, log_format)
        else {
            return Err(ConfigError(join(&problems)));
        };
        Ok(Self {
            host,
            port,
            files,
            deezer,
            max_upload_bytes: u64::from(max_upload_mb) * 1024 * 1024,
            log_format,
        })
    }
}

/// Values already read from the environment, so tests can skip the process env.
#[derive(Debug, Clone, Default)]
pub(crate) struct Input {
    pub(crate) host: Option<String>,
    pub(crate) port: Option<String>,
    pub(crate) data_dir: Option<String>,
    pub(crate) s3_endpoint: Option<String>,
    pub(crate) s3_bucket: Option<String>,
    pub(crate) s3_region: Option<String>,
    pub(crate) s3_public_url: Option<String>,
    pub(crate) aws_access_key_id: Option<String>,
    pub(crate) aws_secret_access_key: Option<String>,
    pub(crate) deezer_proxy_urls: Option<String>,
    pub(crate) deezer_proxy_secret: Option<String>,
    pub(crate) deezer_rate_limit: Option<String>,
    pub(crate) max_upload_mb: Option<String>,
    pub(crate) log_format: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("{0}")]
pub(crate) struct ConfigError(String);

fn parse_port(value: Option<&str>, problems: &mut Vec<String>) -> Option<u16> {
    let Some(raw) = non_blank(value) else {
        return Some(3000);
    };
    match raw.trim().parse::<u16>() {
        Ok(port) if port > 0 => Some(port),
        _ => {
            problems.push(format!("PORT is invalid: {}", raw.trim()));
            None
        }
    }
}

fn parse_files(input: &Input, problems: &mut Vec<String>) -> Option<Files> {
    let endpoint = non_blank(input.s3_endpoint.as_deref());
    let bucket = non_blank(input.s3_bucket.as_deref());
    let access = non_blank(input.aws_access_key_id.as_deref());
    let secret = non_blank(input.aws_secret_access_key.as_deref());
    let region = non_blank(input.s3_region.as_deref());
    let public_url = non_blank(input.s3_public_url.as_deref());
    let any_s3 = endpoint.is_some()
        || bucket.is_some()
        || access.is_some()
        || secret.is_some()
        || region.is_some()
        || public_url.is_some();
    if !any_s3 {
        let dir = non_blank(input.data_dir.as_deref())
            .unwrap_or("./data")
            .trim()
            .to_owned();
        return Some(Files::Disk {
            dir: PathBuf::from(dir),
        });
    }
    let endpoint = require(endpoint, "S3_ENDPOINT", problems);
    let bucket = require(bucket, "S3_BUCKET", problems);
    let access = require(access, "AWS_ACCESS_KEY_ID", problems);
    let secret = require(secret, "AWS_SECRET_ACCESS_KEY", problems);
    let public_url = match public_url {
        Some(raw) => parse_url(raw, "S3_PUBLIC_URL", problems).map(Some),
        None => Some(None),
    };
    let endpoint = endpoint.and_then(|raw| parse_url(raw, "S3_ENDPOINT", problems));
    Some(Files::Bucket {
        endpoint: endpoint?,
        bucket: bucket?.trim().to_owned(),
        region: region.unwrap_or("auto").trim().to_owned(),
        access_key: access?.trim().to_owned(),
        secret_key: secret?.trim().to_owned(),
        public_url: public_url?,
    })
}

fn parse_deezer(input: &Input, problems: &mut Vec<String>) -> Option<Lookup> {
    let urls = non_blank(input.deezer_proxy_urls.as_deref());
    let secret = non_blank(input.deezer_proxy_secret.as_deref());
    let Some(urls) = urls else {
        if secret.is_some() {
            problems.push("DEEZER_PROXY_SECRET is set but DEEZER_PROXY_URLS is not".to_owned());
            return None;
        }
        let per_second = parse_bounded(
            input.deezer_rate_limit.as_deref(),
            "DEEZER_RATE_LIMIT",
            8,
            1,
            u32::MAX,
            problems,
        )?;
        return Some(Lookup::Direct { per_second });
    };
    if secret.is_none() {
        problems.push("DEEZER_PROXY_SECRET is not set".to_owned());
    }
    let parsed = split_urls(urls, problems);
    if parsed.is_empty() {
        return None;
    }
    Some(Lookup::Proxies {
        urls: parsed,
        secret: secret?.trim().to_owned(),
    })
}

fn parse_log_format(value: Option<&str>, problems: &mut Vec<String>) -> Option<LogFormat> {
    let Some(raw) = non_blank(value) else {
        return Some(LogFormat::Compact);
    };
    match raw.trim().to_ascii_lowercase().as_str() {
        "compact" => Some(LogFormat::Compact),
        "pretty" => Some(LogFormat::Pretty),
        "json" => Some(LogFormat::Json),
        _ => {
            problems.push(format!(
                "LOG_FORMAT is invalid: {} (expected compact, pretty or json)",
                raw.trim()
            ));
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
    match raw.trim().parse::<u32>() {
        Ok(parsed) if (min..=max).contains(&parsed) => Some(parsed),
        _ => {
            problems.push(format!(
                "{name} is invalid: {} (expected {min}-{max})",
                raw.trim()
            ));
            None
        }
    }
}

fn split_urls(raw: &str, problems: &mut Vec<String>) -> Vec<String> {
    let mut urls = Vec::new();
    let mut saw = false;
    for segment in raw.split(',') {
        let trimmed = segment.trim();
        if trimmed.is_empty() {
            continue;
        }
        saw = true;
        if let Some(url) = parse_url(trimmed, "DEEZER_PROXY_URLS", problems) {
            urls.push(url);
        }
    }
    if !saw {
        problems.push("DEEZER_PROXY_URLS is empty".to_owned());
    }
    urls
}

fn parse_url(raw: &str, name: &str, problems: &mut Vec<String>) -> Option<String> {
    match reqwest::Url::parse(raw.trim()) {
        Ok(url) => Some(url.to_string()),
        Err(err) => {
            problems.push(format!("{name} is invalid: {err}"));
            None
        }
    }
}

fn require<'a>(value: Option<&'a str>, name: &str, problems: &mut Vec<String>) -> Option<&'a str> {
    if let Some(value) = value {
        return Some(value);
    }
    problems.push(format!("{name} is not set"));
    None
}

fn non_blank(value: Option<&str>) -> Option<&str> {
    value.filter(|value| !value.trim().is_empty())
}

fn join(problems: &[String]) -> String {
    let mut message = String::from("invalid configuration:");
    for problem in problems {
        message.push('\n');
        message.push_str(problem);
    }
    message
}

#[cfg(test)]
mod tests {
    use super::{Config, Files, Input, LogFormat, Lookup};

    #[test]
    fn empty_input_uses_local_storage_and_direct_deezer() -> Result<(), super::ConfigError> {
        let config = Config::from_input(&Input::default())?;

        assert_eq!(config.host(), "127.0.0.1");
        assert_eq!(config.port(), 3000);
        assert_eq!(config.max_upload_bytes(), 50 * 1024 * 1024);
        assert_eq!(config.log_format(), LogFormat::Compact);
        assert!(
            matches!(config.files(), Files::Disk { dir } if dir.ends_with("data") || dir == std::path::Path::new("./data"))
        );
        assert!(matches!(config.deezer(), Lookup::Direct { per_second: 8 }));
        Ok(())
    }

    #[test]
    fn upload_size_is_bounded() {
        let low = Input {
            max_upload_mb: Some("0".to_owned()),
            ..Input::default()
        };
        assert!(Config::from_input(&low).is_err());

        let high = Input {
            max_upload_mb: Some("2001".to_owned()),
            ..Input::default()
        };
        assert!(Config::from_input(&high).is_err());

        let ok = Input {
            max_upload_mb: Some("2000".to_owned()),
            ..Input::default()
        };
        let config = Config::from_input(&ok);
        assert!(matches!(config, Ok(config) if config.max_upload_bytes() == 2000 * 1024 * 1024));
    }

    #[test]
    fn s3_requires_the_four_settings_together() {
        let input = Input {
            s3_bucket: Some("harmony".to_owned()),
            ..Input::default()
        };
        assert!(Config::from_input(&input).is_err());
    }

    #[test]
    fn proxies_require_a_secret_and_direct_rejects_zero() {
        let urls = Input {
            deezer_proxy_urls: Some("http://proxy.example".to_owned()),
            ..Input::default()
        };
        assert!(Config::from_input(&urls).is_err());

        let rate = Input {
            deezer_rate_limit: Some("0".to_owned()),
            ..Input::default()
        };
        assert!(Config::from_input(&rate).is_err());
    }

    #[test]
    fn proxies_ignore_the_rate_limit() -> Result<(), super::ConfigError> {
        let input = Input {
            deezer_proxy_urls: Some("http://proxy.example".to_owned()),
            deezer_proxy_secret: Some("secret".to_owned()),
            deezer_rate_limit: Some("1".to_owned()),
            ..Input::default()
        };
        let config = Config::from_input(&input)?;

        assert!(matches!(
            config.deezer(),
            Lookup::Proxies { urls, secret } if urls.len() == 1 && secret == "secret"
        ));
        Ok(())
    }

    #[test]
    fn log_format_names_the_three_shapes() -> Result<(), super::ConfigError> {
        let input = Input {
            log_format: Some("json".to_owned()),
            ..Input::default()
        };
        assert_eq!(Config::from_input(&input)?.log_format(), LogFormat::Json);

        let bad = Input {
            log_format: Some("xml".to_owned()),
            ..Input::default()
        };
        assert!(Config::from_input(&bad).is_err());
        Ok(())
    }
}
