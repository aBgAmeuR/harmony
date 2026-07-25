use std::env;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Duration;

use reqwest::{Client, Url};
use serde::de::DeserializeOwned;
use tokio::time::sleep;

pub const PROXY_SECRET_HEADER: &str = "X-Harmony-Secret";

const REQUEST_GAP_MS: u64 = 50;
const MAX_RETRIES: u32 = 3;
const RETRY_DELAY_MS: u64 = 1000;

pub struct DeezerConfig {
    pub proxy_urls: Vec<Url>,
    pub proxy_secret: String,
}

#[derive(Debug, thiserror::Error)]
pub enum DeezerFetchError {
    #[error("network error: {0}")]
    Network(reqwest::Error),

    #[error("quota limit exceeded")]
    QuotaExceeded,

    #[error("deezer api error: {0}")]
    Api(String),
}

impl DeezerFetchError {
    pub fn is_retryable(&self) -> bool {
        match self {
            Self::Network(err) => {
                err.is_timeout()
                    || err.is_connect()
                    || err.is_request()
                    || err.status().is_some_and(is_retryable_status)
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

    let mut proxy_urls = Vec::new();
    for raw in proxy_urls_raw
        .split(',')
        .map(str::trim)
        .filter(|url| !url.is_empty())
    {
        let url = Url::parse(raw).map_err(|err| format!("invalid proxy URL '{raw}': {err}"))?;
        proxy_urls.push(url);
    }

    if proxy_urls.is_empty() {
        return Err("DEEZER_PROXY_URLS is empty".to_string());
    }

    let proxy_secret = env::var("DEEZER_PROXY_SECRET")
        .map_err(|_| "DEEZER_PROXY_SECRET is not set".to_string())?;

    if proxy_secret.trim().is_empty() {
        return Err("DEEZER_PROXY_SECRET is empty".to_string());
    }

    Ok(DeezerConfig {
        proxy_urls,
        proxy_secret,
    })
}

pub struct DeezerClient {
    http: Client,
    proxy_urls: Vec<Url>,
    proxy_secret: String,
    proxy_round: AtomicUsize,
}

impl DeezerClient {
    pub fn new(config: DeezerConfig) -> Result<Self, reqwest::Error> {
        let http = Client::builder().timeout(Duration::from_secs(5)).build()?;

        Ok(Self {
            http,
            proxy_urls: config.proxy_urls,
            proxy_secret: config.proxy_secret,
            proxy_round: AtomicUsize::new(0),
        })
    }

    pub fn concurrency(&self) -> usize {
        self.proxy_urls.len()
    }

    fn next_proxy_url(&self, target_url: &str) -> String {
        let index = self.proxy_round.fetch_add(1, Ordering::Relaxed) % self.proxy_urls.len();
        let mut url = self.proxy_urls[index].clone();
        url.query_pairs_mut().append_pair("target", target_url);
        url.to_string()
    }

    async fn fetch_once(&self, target_url: &str) -> Result<serde_json::Value, DeezerFetchError> {
        let proxy_url = self.next_proxy_url(target_url);

        let response = self
            .http
            .get(proxy_url)
            .header(PROXY_SECRET_HEADER, &self.proxy_secret)
            .send()
            .await
            .map_err(DeezerFetchError::Network)?;

        sleep(Duration::from_millis(REQUEST_GAP_MS)).await;

        let status = response.status();
        if !status.is_success() {
            return Err(DeezerFetchError::Network(
                response.error_for_status().unwrap_err(),
            ));
        }

        let value: serde_json::Value = response.json().await.map_err(DeezerFetchError::Network)?;

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

        for attempt in 0..MAX_RETRIES {
            if attempt > 0 {
                sleep(Duration::from_millis(RETRY_DELAY_MS)).await;
            }

            match self.fetch_once(target_url).await {
                Ok(value) => {
                    return serde_json::from_value(value).map_err(|err| {
                        DeezerFetchError::Api(format!("failed to parse Deezer response: {err}"))
                    });
                }
                Err(err) => {
                    if err.is_retryable() && attempt + 1 < MAX_RETRIES {
                        last_error = Some(err);
                        continue;
                    }
                    return Err(err);
                }
            }
        }

        Err(last_error.unwrap_or_else(|| DeezerFetchError::Api("max retries exceeded".to_string())))
    }
}
