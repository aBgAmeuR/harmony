use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use std::time::Duration;

use reqwest::{Client, Url};
use serde::de::DeserializeOwned;
use tokio::sync::Mutex;
use tokio::time::{Instant, sleep, sleep_until};

use crate::config::DeezerMode;

pub const PROXY_SECRET_HEADER: &str = "X-Harmony-Secret";

const REQUEST_GAP_MS: u64 = 50;
const MAX_RETRIES: u32 = 3;
const RETRY_DELAY_MS: u64 = 1000;
/// Direct mode: the limiter caps throughput, concurrency only hides latency.
const DIRECT_CONCURRENCY: usize = 4;

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

/// Spaces requests evenly so the server stays under a requests-per-second cap.
struct RateLimiter {
    interval: Duration,
    next_slot: Mutex<Instant>,
}

impl RateLimiter {
    fn per_second(requests: u32) -> Self {
        Self {
            interval: Duration::from_secs(1) / requests.max(1),
            next_slot: Mutex::new(Instant::now()),
        }
    }

    async fn acquire(&self) {
        let slot = {
            let mut next = self.next_slot.lock().await;
            let slot = (*next).max(Instant::now());
            *next = slot + self.interval;
            slot
        };
        sleep_until(slot).await;
    }
}

enum Transport {
    Direct { limiter: RateLimiter },
    Proxies { urls: Vec<Url>, secret: String },
}

/// Snapshot of the client's lifetime request counters.
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq)]
pub struct DeezerCounters {
    pub requests: u64,
    pub retries: u64,
    pub quota_exceeded: u64,
}

impl DeezerCounters {
    pub fn since(self, earlier: Self) -> Self {
        Self {
            requests: self.requests.saturating_sub(earlier.requests),
            retries: self.retries.saturating_sub(earlier.retries),
            quota_exceeded: self.quota_exceeded.saturating_sub(earlier.quota_exceeded),
        }
    }
}

pub struct DeezerClient {
    http: Client,
    transport: Transport,
    proxy_round: AtomicUsize,
    requests: AtomicU64,
    retries: AtomicU64,
    quota_exceeded: AtomicU64,
}

impl DeezerClient {
    pub fn new(mode: DeezerMode) -> Result<Self, reqwest::Error> {
        let http = Client::builder()
            .timeout(Duration::from_secs(5))
            .user_agent(concat!("harmony/", env!("CARGO_PKG_VERSION")))
            .build()?;

        let transport = match mode {
            DeezerMode::Direct {
                requests_per_second,
            } => Transport::Direct {
                limiter: RateLimiter::per_second(requests_per_second),
            },
            DeezerMode::Proxies { urls, secret } => Transport::Proxies { urls, secret },
        };

        Ok(Self {
            http,
            transport,
            proxy_round: AtomicUsize::new(0),
            requests: AtomicU64::new(0),
            retries: AtomicU64::new(0),
            quota_exceeded: AtomicU64::new(0),
        })
    }

    pub fn counters(&self) -> DeezerCounters {
        DeezerCounters {
            requests: self.requests.load(Ordering::Relaxed),
            retries: self.retries.load(Ordering::Relaxed),
            quota_exceeded: self.quota_exceeded.load(Ordering::Relaxed),
        }
    }

    pub fn concurrency(&self) -> usize {
        match &self.transport {
            Transport::Direct { .. } => DIRECT_CONCURRENCY,
            Transport::Proxies { urls, .. } => urls.len(),
        }
    }

    fn request_url(&self, target_url: &str) -> String {
        match &self.transport {
            Transport::Direct { .. } => target_url.to_string(),
            Transport::Proxies { urls, .. } => {
                let index = self.proxy_round.fetch_add(1, Ordering::Relaxed) % urls.len();
                let mut url = urls[index].clone();
                url.query_pairs_mut().append_pair("target", target_url);
                url.to_string()
            }
        }
    }

    async fn fetch_once(&self, target_url: &str) -> Result<serde_json::Value, DeezerFetchError> {
        let url = self.request_url(target_url);

        let response = match &self.transport {
            Transport::Direct { limiter } => {
                limiter.acquire().await;
                self.requests.fetch_add(1, Ordering::Relaxed);
                self.http
                    .get(url)
                    .send()
                    .await
                    .map_err(DeezerFetchError::Network)?
            }
            Transport::Proxies { secret, .. } => {
                self.requests.fetch_add(1, Ordering::Relaxed);
                let response = self
                    .http
                    .get(url)
                    .header(PROXY_SECRET_HEADER, secret)
                    .send()
                    .await
                    .map_err(DeezerFetchError::Network)?;
                sleep(Duration::from_millis(REQUEST_GAP_MS)).await;
                response
            }
        };

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
                self.retries.fetch_add(1, Ordering::Relaxed);
                sleep(Duration::from_millis(RETRY_DELAY_MS)).await;
            }

            match self.fetch_once(target_url).await {
                Ok(value) => {
                    return serde_json::from_value(value).map_err(|err| {
                        DeezerFetchError::Api(format!("failed to parse Deezer response: {err}"))
                    });
                }
                Err(err) => {
                    if matches!(err, DeezerFetchError::QuotaExceeded) {
                        self.quota_exceeded.fetch_add(1, Ordering::Relaxed);
                    }
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

#[cfg(test)]
mod tests {
    use super::*;

    const TARGET: &str = "https://api.deezer.com/track/3135556";

    fn direct_client() -> DeezerClient {
        DeezerClient::new(DeezerMode::Direct {
            requests_per_second: 8,
        })
        .unwrap()
    }

    fn proxy_client(count: usize) -> DeezerClient {
        let urls = (0..count)
            .map(|index| Url::parse(&format!("http://proxy-{index}.example/")).unwrap())
            .collect();
        DeezerClient::new(DeezerMode::Proxies {
            urls,
            secret: "secret".to_string(),
        })
        .unwrap()
    }

    #[test]
    fn direct_mode_requests_the_target_itself() {
        assert_eq!(direct_client().request_url(TARGET), TARGET);
    }

    #[test]
    fn proxy_mode_passes_the_target_as_query() {
        let client = proxy_client(2);
        let first = client.request_url(TARGET);
        let second = client.request_url(TARGET);

        assert!(
            first.starts_with("http://proxy-0.example/?target="),
            "{first}"
        );
        assert!(
            second.starts_with("http://proxy-1.example/?target="),
            "{second}"
        );
    }

    #[test]
    fn concurrency_depends_on_transport() {
        assert_eq!(direct_client().concurrency(), 4);
        assert_eq!(proxy_client(3).concurrency(), 3);
    }

    #[test]
    fn counters_since_saturates() {
        let earlier = DeezerCounters {
            requests: 10,
            retries: 2,
            quota_exceeded: 1,
        };
        let later = DeezerCounters {
            requests: 25,
            retries: 1,
            quota_exceeded: 1,
        };

        assert_eq!(
            later.since(earlier),
            DeezerCounters {
                requests: 15,
                retries: 0,
                quota_exceeded: 0,
            }
        );
        assert_eq!(
            DeezerCounters::default().since(later),
            DeezerCounters::default()
        );
    }

    #[test]
    fn new_client_starts_with_zero_counters() {
        assert_eq!(direct_client().counters(), DeezerCounters::default());
    }

    #[tokio::test]
    async fn rate_limiter_spaces_requests() {
        let limiter = RateLimiter::per_second(20);
        let started = std::time::Instant::now();
        for _ in 0..5 {
            limiter.acquire().await;
        }
        let elapsed = started.elapsed();

        assert!(elapsed >= Duration::from_millis(190), "{elapsed:?}");
        assert!(elapsed < Duration::from_secs(2), "{elapsed:?}");
    }
}
