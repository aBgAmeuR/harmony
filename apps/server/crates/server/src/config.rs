use reqwest::Url;

pub struct Config {
    pub host: String,
    pub port: u16,
    pub s3_endpoint: Url,
    pub s3_bucket: String,
    pub aws_access_key_id: String,
    pub aws_secret_access_key: String,
    pub deezer_proxy_urls: Vec<Url>,
    pub deezer_proxy_secret: String,
}

struct ConfigInput {
    pub host: Option<String>,
    pub port: Option<String>,
    pub s3_endpoint: Option<String>,
    pub s3_bucket: Option<String>,
    pub aws_access_key_id: Option<String>,
    pub aws_secret_access_key: Option<String>,
    pub deezer_proxy_urls: Option<String>,
    pub deezer_proxy_secret: Option<String>,
}

#[derive(Debug, thiserror::Error)]
#[error("{0}")]
pub struct ConfigError(String);

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        Self::from_input(ConfigInput {
            host: std::env::var("HOST").ok(),
            port: std::env::var("PORT").ok(),
            s3_endpoint: std::env::var("S3_ENDPOINT").ok(),
            s3_bucket: std::env::var("S3_BUCKET").ok(),
            aws_access_key_id: std::env::var("AWS_ACCESS_KEY_ID").ok(),
            aws_secret_access_key: std::env::var("AWS_SECRET_ACCESS_KEY").ok(),
            deezer_proxy_urls: std::env::var("DEEZER_PROXY_URLS").ok(),
            deezer_proxy_secret: std::env::var("DEEZER_PROXY_SECRET").ok(),
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

        let s3_endpoint = match non_blank(input.s3_endpoint.as_deref()) {
            None => {
                problems.push("S3_ENDPOINT is not set".to_string());
                None
            }
            Some(value) => match Url::parse(value.trim()) {
                Ok(url) => Some(url),
                Err(err) => {
                    problems.push(format!("S3_ENDPOINT is invalid: {err}"));
                    None
                }
            },
        };

        let s3_bucket = require_set(input.s3_bucket.as_deref(), "S3_BUCKET", &mut problems);
        let aws_access_key_id = require_set(
            input.aws_access_key_id.as_deref(),
            "AWS_ACCESS_KEY_ID",
            &mut problems,
        );
        let aws_secret_access_key = require_set(
            input.aws_secret_access_key.as_deref(),
            "AWS_SECRET_ACCESS_KEY",
            &mut problems,
        );

        let deezer_proxy_urls = match non_blank(input.deezer_proxy_urls.as_deref()) {
            None => {
                problems.push("DEEZER_PROXY_URLS is not set".to_string());
                Vec::new()
            }
            Some(raw) => parse_proxy_urls(raw, &mut problems),
        };

        let deezer_proxy_secret = match input.deezer_proxy_secret.as_deref() {
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
            s3_endpoint: s3_endpoint.unwrap(),
            s3_bucket: s3_bucket.unwrap(),
            aws_access_key_id: aws_access_key_id.unwrap(),
            aws_secret_access_key: aws_secret_access_key.unwrap(),
            deezer_proxy_urls,
            deezer_proxy_secret: deezer_proxy_secret.unwrap(),
        })
    }
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
    const PROXY_SECRET: &str = "proxy-secret-value";

    fn expect_err(result: Result<Config, ConfigError>) -> ConfigError {
        match result {
            Ok(_) => panic!("expected configuration error"),
            Err(err) => err,
        }
    }

    fn valid_input() -> ConfigInput {
        ConfigInput {
            host: None,
            port: None,
            s3_endpoint: Some("https://s3.example".to_string()),
            s3_bucket: Some("harmony".to_string()),
            aws_access_key_id: Some(ACCESS_KEY.to_string()),
            aws_secret_access_key: Some("aws-secret-key-value".to_string()),
            deezer_proxy_urls: Some("http://proxy-a.example".to_string()),
            deezer_proxy_secret: Some(PROXY_SECRET.to_string()),
        }
    }

    #[test]
    fn missing_required_settings_are_listed_together() {
        let err = expect_err(Config::from_input(ConfigInput {
            host: None,
            port: None,
            s3_endpoint: None,
            s3_bucket: None,
            aws_access_key_id: None,
            aws_secret_access_key: None,
            deezer_proxy_urls: None,
            deezer_proxy_secret: None,
        }));
        let message = err.to_string();
        for name in [
            "S3_ENDPOINT",
            "S3_BUCKET",
            "AWS_ACCESS_KEY_ID",
            "AWS_SECRET_ACCESS_KEY",
            "DEEZER_PROXY_URLS",
            "DEEZER_PROXY_SECRET",
        ] {
            assert!(message.contains(name), "{message}");
        }
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
        assert_eq!(config.deezer_proxy_urls.len(), 2);
        assert_eq!(config.host, "127.0.0.1");
        assert_eq!(config.port, 3000);
        assert_eq!(config.deezer_proxy_secret, " secret ");
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
}
