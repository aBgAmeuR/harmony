use std::env;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;

use reqwest::Client;
use serde::de::DeserializeOwned;
use tokio::time::sleep;

pub const PROXY_SECRET_HEADER: &str = "X-Harmony-Secret";

pub struct DeezerConfig {
    pub proxy_urls: Vec<String>,
    pub proxy_secret: String,
    pub request_gap_ms: u64,
    pub max_retries: u32,
    pub retry_delay_ms: u64,
}

#[derive(Debug)]
pub enum DeezerFetchError {
    Network(reqwest::Error),
    QuotaExceeded,
    Api(#[allow(dead_code)] String),
}

impl DeezerFetchError {
    pub fn is_retryable(&self) -> bool {
        match self {
            Self::Network(err) => {
                err.is_timeout()
                    || err.is_connect()
                    || err.is_request()
                    || err
                        .status()
                        .is_some_and(|status| is_retryable_status(status))
            }
            Self::QuotaExceeded => true,
            Self::Api(_) => false,
        }
    }
}

fn is_retryable_status(status: reqwest::StatusCode) -> bool {
    status == reqwest::StatusCode::TOO_MANY_REQUESTS || status.is_server_error()
}

pub fn load_config() -> Result<DeezerConfig, String> {
    let proxy_urls_raw =
        env::var("DEEZER_PROXY_URLS").map_err(|_| "DEEZER_PROXY_URLS is not set".to_string())?;

    let proxy_urls: Vec<String> = proxy_urls_raw
        .split(',')
        .map(str::trim)
        .filter(|url| !url.is_empty())
        .map(str::to_string)
        .collect();

    if proxy_urls.is_empty() {
        return Err("DEEZER_PROXY_URLS is empty".to_string());
    }

    for proxy_url in &proxy_urls {
        reqwest::Url::parse(proxy_url)
            .map_err(|err| format!("invalid proxy URL '{proxy_url}': {err}"))?;
    }

    let proxy_secret =
        env::var("DEEZER_PROXY_SECRET").map_err(|_| "DEEZER_PROXY_SECRET is not set".to_string())?;

    if proxy_secret.trim().is_empty() {
        return Err("DEEZER_PROXY_SECRET is empty".to_string());
    }

    let request_gap_ms = env::var("DEEZER_REQUEST_GAP_MS")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(50);

    let max_retries = env::var("DEEZER_MAX_RETRIES")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(3);

    let retry_delay_ms = env::var("DEEZER_RETRY_DELAY_MS")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(1000);

    Ok(DeezerConfig {
        proxy_urls,
        proxy_secret,
        request_gap_ms,
        max_retries,
        retry_delay_ms,
    })
}

pub struct DeezerClient {
    http: Client,
    config: Arc<DeezerConfig>,
    proxy_round: Arc<AtomicUsize>,
}

impl DeezerClient {
    pub fn new(config: DeezerConfig) -> Result<Self, reqwest::Error> {
        let http = Client::builder()
            .timeout(Duration::from_secs(5))
            .build()?;

        Ok(Self {
            http,
            config: Arc::new(config),
            proxy_round: Arc::new(AtomicUsize::new(0)),
        })
    }

    pub fn concurrency(&self) -> usize {
        self.config.proxy_urls.len()
    }

    fn next_proxy_url(&self, target_url: &str) -> String {
        let index = self.proxy_round.fetch_add(1, Ordering::Relaxed) % self.config.proxy_urls.len();
        let mut url =
            reqwest::Url::parse(&self.config.proxy_urls[index]).expect("proxy URL validated at startup");
        url.query_pairs_mut().append_pair("target", target_url);
        url.to_string()
    }

    async fn fetch_once(&self, target_url: &str) -> Result<serde_json::Value, DeezerFetchError> {
        let proxy_url = self.next_proxy_url(target_url);

        let response = self
            .http
            .get(proxy_url)
            .header(PROXY_SECRET_HEADER, &self.config.proxy_secret)
            .send()
            .await
            .map_err(DeezerFetchError::Network)?;

        sleep(Duration::from_millis(self.config.request_gap_ms)).await;

        let status = response.status();
        if !status.is_success() {
            return Err(DeezerFetchError::Network(
                response.error_for_status().unwrap_err(),
            ));
        }

        let value: serde_json::Value = response
            .json()
            .await
            .map_err(DeezerFetchError::Network)?;

        if let Some(err) = value.get("error") {
            if err.get("message").and_then(|message| message.as_str())
                == Some("Quota limit exceeded")
            {
                return Err(DeezerFetchError::QuotaExceeded);
            }

            let message = err
                .get("message")
                .and_then(|message| message.as_str())
                .unwrap_or("unknown Deezer API error")
                .to_string();
            return Err(DeezerFetchError::Api(message));
        }

        Ok(value)
    }

    pub async fn get_json<T: DeserializeOwned>(
        &self,
        target_url: &str,
    ) -> Result<T, DeezerFetchError> {
        let mut last_error: Option<DeezerFetchError> = None;

        for attempt in 0..self.config.max_retries {
            if attempt > 0 {
                sleep(Duration::from_millis(self.config.retry_delay_ms)).await;
            }

            match self.fetch_once(target_url).await {
                Ok(value) => {
                    return serde_json::from_value(value).map_err(|err| {
                        DeezerFetchError::Api(format!("failed to parse Deezer response: {err}"))
                    });
                }
                Err(err) => {
                    if err.is_retryable() && attempt + 1 < self.config.max_retries {
                        last_error = Some(err);
                        continue;
                    }
                    return Err(err);
                }
            }
        }

        Err(last_error.unwrap_or(DeezerFetchError::Api(
            "max retries exceeded".to_string(),
        )))
    }
}
