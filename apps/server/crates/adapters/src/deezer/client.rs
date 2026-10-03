//! One in-flight request per proxy, then a pause.
//!
//! The previous client handed out proxies with a shared counter. A fast proxy
//! finished, the counter wrapped, and the next call landed on a proxy that
//! still had a request in flight. Deezer answered with a quota error.
//!
//! Each proxy is now its own lane. A 403, a 429, or `Quota limit exceeded`
//! parks that lane for five seconds, which is Deezer's quota window. The same
//! call tries another lane and fails only after every lane has refused it.

use std::io::Cursor;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Condvar, Mutex};
use std::thread;
use std::time::{Duration, Instant};

use base64::Engine;
use domain::ports::LookupError;
use image::ImageReader;
use image::codecs::jpeg::JpegEncoder;
use image::imageops::FilterType;
use reqwest::Url;
use reqwest::blocking::Client;

use super::retry::{ApiMessage, Blow, Hit, api_message};

const PAUSE: Duration = Duration::from_millis(50);
const QUOTA: Duration = Duration::from_secs(5);
const RETRY: Duration = Duration::from_secs(1);
const DIRECT_LANES: usize = 4;
const PROXY_HEADER: &str = "X-Harmony-Secret";
const THUMB_SIZE: u32 = 56;
const THUMB_QUALITY: u8 = 60;

/// Direct calls are paced. Proxy calls use one lane per URL.
pub enum Mode {
    Direct { per_second: u32 },
    Proxies { urls: Vec<String>, secret: String },
}

#[derive(Clone, Copy)]
enum Cool {
    Pause,
    Quota,
}

struct Lane {
    busy: bool,
    ready_at: Instant,
}

pub(crate) struct ProxyLanes {
    inner: Mutex<Vec<Lane>>,
    wake: Condvar,
    pause: Duration,
    quota: Duration,
}

pub(crate) struct LaneGuard<'a> {
    lanes: &'a ProxyLanes,
    index: usize,
    cool: Cool,
}

impl ProxyLanes {
    pub(crate) fn open(count: usize) -> Self {
        Self::with_pace(count, PAUSE, QUOTA)
    }

    pub(crate) fn with_pace(count: usize, pause: Duration, quota: Duration) -> Self {
        let now = Instant::now();
        Self {
            inner: Mutex::new(
                (0..count)
                    .map(|_| Lane {
                        busy: false,
                        ready_at: now,
                    })
                    .collect(),
            ),
            wake: Condvar::new(),
            pause,
            quota,
        }
    }

    pub(crate) fn acquire(&self) -> Result<LaneGuard<'_>, LookupError> {
        let index = self.reserve()?;
        Ok(LaneGuard {
            lanes: self,
            index,
            cool: Cool::Pause,
        })
    }

    fn reserve(&self) -> Result<usize, LookupError> {
        let mut guard = lock(&self.inner)?;
        loop {
            let mut chosen: Option<(usize, Instant)> = None;
            for (index, lane) in guard.iter().enumerate() {
                if lane.busy {
                    continue;
                }
                let sooner = match chosen {
                    None => true,
                    Some((_, ready)) => lane.ready_at < ready,
                };
                if sooner {
                    chosen = Some((index, lane.ready_at));
                }
            }
            let Some((index, ready_at)) = chosen else {
                guard = self
                    .wake
                    .wait(guard)
                    .map_err(|_| LookupError::new("deezer proxy gate poisoned"))?;
                continue;
            };
            if let Some(lane) = guard.get_mut(index) {
                lane.busy = true;
            }
            drop(guard);
            if let Some(wait) = ready_at.checked_duration_since(Instant::now()) {
                thread::sleep(wait);
            }
            return Ok(index);
        }
    }

    fn release(&self, index: usize, cool: Cool) {
        let Ok(mut guard) = self.inner.lock() else {
            return;
        };
        let pause = match cool {
            Cool::Pause => self.pause,
            Cool::Quota => self.quota,
        };
        if let Some(lane) = guard.get_mut(index) {
            lane.busy = false;
            lane.ready_at = Instant::now() + pause;
        }
        self.wake.notify_all();
    }
}

impl LaneGuard<'_> {
    pub(crate) const fn index(&self) -> usize {
        self.index
    }

    pub(crate) const fn cool_for_quota(&mut self) {
        self.cool = Cool::Quota;
    }
}

impl Drop for LaneGuard<'_> {
    fn drop(&mut self) {
        self.lanes.release(self.index, self.cool);
    }
}

pub(crate) struct DirectGate {
    limit: usize,
    in_flight: Mutex<usize>,
    wake: Condvar,
    next: Mutex<Instant>,
    interval: Duration,
}

pub(crate) struct DirectGuard<'a> {
    gate: &'a DirectGate,
}

impl DirectGate {
    pub(crate) fn new(per_second: u32) -> Result<Self, LookupError> {
        if per_second == 0 {
            return Err(LookupError::new("deezer rate limit must be at least 1"));
        }
        Ok(Self {
            limit: DIRECT_LANES,
            in_flight: Mutex::new(0),
            wake: Condvar::new(),
            next: Mutex::new(Instant::now()),
            interval: Duration::from_secs(1) / per_second,
        })
    }

    pub(crate) fn enter(&self) -> Result<DirectGuard<'_>, LookupError> {
        let mut in_flight = lock(&self.in_flight)?;
        while *in_flight >= self.limit {
            in_flight = self
                .wake
                .wait(in_flight)
                .map_err(|_| LookupError::new("deezer direct gate poisoned"))?;
        }
        *in_flight += 1;
        drop(in_flight);
        self.reserve_slot()?;
        Ok(DirectGuard { gate: self })
    }

    fn reserve_slot(&self) -> Result<(), LookupError> {
        let mut next = lock(&self.next)?;
        let now = Instant::now();
        let slot = (*next).max(now);
        *next = slot + self.interval;
        drop(next);
        if let Some(wait) = slot.checked_duration_since(Instant::now()) {
            thread::sleep(wait);
        }
        Ok(())
    }
}

impl Drop for DirectGuard<'_> {
    fn drop(&mut self) {
        let Ok(mut in_flight) = self.gate.in_flight.lock() else {
            return;
        };
        *in_flight = in_flight.saturating_sub(1);
        self.gate.wake.notify_one();
    }
}

pub(crate) enum Reply {
    Json(serde_json::Value),
    Empty,
}

enum Transport {
    Direct(DirectGate),
    Proxies {
        urls: Vec<Url>,
        secret: String,
        lanes: ProxyLanes,
    },
}

pub(crate) struct Http {
    api: Client,
    images: Client,
    transport: Transport,
    calls: AtomicU64,
    retries: AtomicU64,
}

impl Http {
    pub(crate) fn open(mode: Mode) -> Result<Self, LookupError> {
        let api = http_client()?;
        let images = http_client()?;
        let transport = match mode {
            Mode::Direct { per_second } => Transport::Direct(DirectGate::new(per_second)?),
            Mode::Proxies { urls, secret } => {
                if urls.is_empty() {
                    return Err(LookupError::new("deezer proxy list is empty"));
                }
                if secret.is_empty() {
                    return Err(LookupError::new("deezer proxy secret is empty"));
                }
                let mut parsed = Vec::new();
                for url in &urls {
                    parsed.push(Url::parse(url).map_err(|err| LookupError::new(err.to_string()))?);
                }
                let lanes = ProxyLanes::open(parsed.len());
                Transport::Proxies {
                    urls: parsed,
                    secret,
                    lanes,
                }
            }
        };
        Ok(Self {
            api,
            images,
            transport,
            calls: AtomicU64::new(0),
            retries: AtomicU64::new(0),
        })
    }

    pub(crate) fn calls(&self) -> u64 {
        self.calls.load(Ordering::Relaxed)
    }

    pub(crate) fn retries(&self) -> u64 {
        self.retries.load(Ordering::Relaxed)
    }

    pub(crate) fn get_json(&self, target: &str) -> Result<Reply, LookupError> {
        let mut attempt = 0u32;
        loop {
            match self.once(target) {
                Ok(reply) => return Ok(reply),
                Err(hit) if self.keep_trying(hit.kind, attempt) => {
                    let kind = hit.kind;
                    attempt += 1;
                    self.retries.fetch_add(1, Ordering::Relaxed);
                    self.pause(kind);
                }
                Err(hit) => return Err(LookupError::new(hit.message)),
            }
        }
    }

    fn keep_trying(&self, kind: Blow, attempt: u32) -> bool {
        attempt + 1 < super::retry::attempts(kind, self.lanes())
    }

    fn lanes(&self) -> u32 {
        match &self.transport {
            Transport::Direct(_) => super::retry::TRIES,
            Transport::Proxies { urls, .. } => u32::try_from(urls.len()).unwrap_or(u32::MAX),
        }
    }

    fn pause(&self, kind: Blow) {
        match (&self.transport, kind) {
            (Transport::Proxies { .. }, Blow::Limited) | (_, Blow::Api) => {}
            (_, Blow::Limited | Blow::Disconnect | Blow::Server) => thread::sleep(RETRY),
        }
    }

    pub(crate) fn thumbnail(&self, url: &str) -> Option<String> {
        let url = url.trim();
        if url.is_empty() {
            return None;
        }
        let response = self.images.get(url).send().ok()?;
        if !response.status().is_success() {
            return None;
        }
        let bytes = response.bytes().ok()?;
        data_url(&bytes)
    }

    fn once(&self, target: &str) -> Result<Reply, Hit> {
        match &self.transport {
            Transport::Direct(gate) => {
                let _permit = gate
                    .enter()
                    .map_err(|err| Hit::new(Blow::Api, err.to_string()))?;
                self.calls.fetch_add(1, Ordering::Relaxed);
                match self.exchange(target, None) {
                    Ok(reply) => Ok(reply),
                    Err(hit) => {
                        if hit.kind == Blow::Limited {
                            tracing::warn!(reason = %hit.message, "deezer rate limit");
                        }
                        Err(hit)
                    }
                }
            }
            Transport::Proxies {
                urls,
                secret,
                lanes,
            } => {
                let mut lane = lanes
                    .acquire()
                    .map_err(|err| Hit::new(Blow::Api, err.to_string()))?;
                let Some(proxy) = urls.get(lane.index()) else {
                    return Err(Hit::new(Blow::Api, "deezer proxy index missing"));
                };
                let url = proxy_target(proxy, target);
                self.calls.fetch_add(1, Ordering::Relaxed);
                match self.exchange(url.as_str(), Some(secret)) {
                    Ok(reply) => Ok(reply),
                    Err(hit) => {
                        if hit.kind == Blow::Limited {
                            tracing::warn!(
                                proxy = lane.index(),
                                reason = %hit.message,
                                "deezer rate limit, cooling this proxy"
                            );
                            lane.cool_for_quota();
                        }
                        Err(hit)
                    }
                }
            }
        }
    }

    fn exchange(&self, url: &str, secret: Option<&str>) -> Result<Reply, Hit> {
        let mut request = self.api.get(url);
        if let Some(secret) = secret {
            request = request.header(PROXY_HEADER, secret);
        }
        let response = request.send().map_err(|err| network(&err))?;
        let status = response.status().as_u16();
        if let Some(kind) = super::retry::http_blow(status) {
            let detail = match response.text() {
                Ok(body) => snippet(&body),
                Err(err) => err.to_string(),
            };
            return Err(Hit::new(kind, status_message(status, &detail)));
        }
        let text = response.text().map_err(|err| network(&err))?;
        let value: serde_json::Value =
            serde_json::from_str(&text).map_err(|err| Hit::new(Blow::Api, err.to_string()))?;
        classify(value)
    }
}

fn status_message(status: u16, detail: &str) -> String {
    if detail.is_empty() {
        return format!("deezer status {status}");
    }
    format!("deezer status {status}: {detail}")
}

fn snippet(body: &str) -> String {
    let mut out = String::new();
    let mut count = 0usize;
    for ch in body.chars() {
        if count >= 120 {
            break;
        }
        let piece = if ch.is_whitespace() { ' ' } else { ch };
        if piece == ' ' && (out.is_empty() || out.ends_with(' ')) {
            continue;
        }
        out.push(piece);
        count += 1;
    }
    out.trim_end().to_owned()
}

fn network(err: &reqwest::Error) -> Hit {
    if err.is_timeout() || err.is_connect() || err.is_request() {
        Hit::new(Blow::Disconnect, err.to_string())
    } else {
        Hit::new(Blow::Api, err.to_string())
    }
}

fn classify(value: serde_json::Value) -> Result<Reply, Hit> {
    let Some(error) = value.get("error") else {
        return Ok(Reply::Json(value));
    };
    let message = error
        .get("message")
        .and_then(serde_json::Value::as_str)
        .unwrap_or("deezer api error");
    match api_message(message) {
        ApiMessage::Limited => Err(Hit::new(Blow::Limited, message)),
        ApiMessage::Missing => Ok(Reply::Empty),
        ApiMessage::Reject => Err(Hit::new(Blow::Api, message)),
    }
}

pub(crate) fn proxy_target(proxy: &Url, target: &str) -> Url {
    let mut url = proxy.clone();
    url.query_pairs_mut().append_pair("target", target);
    url
}

fn http_client() -> Result<Client, LookupError> {
    Client::builder()
        .timeout(Duration::from_secs(5))
        .user_agent(concat!("harmony/", env!("CARGO_PKG_VERSION")))
        .build()
        .map_err(|err| LookupError::new(err.to_string()))
}

fn data_url(bytes: &[u8]) -> Option<String> {
    let image = ImageReader::new(Cursor::new(bytes))
        .with_guessed_format()
        .ok()?
        .decode()
        .ok()?;
    let resized = image.resize_exact(THUMB_SIZE, THUMB_SIZE, FilterType::Triangle);
    let mut jpeg = Vec::new();
    let mut writer = JpegEncoder::new_with_quality(&mut jpeg, THUMB_QUALITY);
    writer.encode_image(&resized).ok()?;
    Some(format!(
        "data:image/jpeg;base64,{}",
        base64::engine::general_purpose::STANDARD.encode(jpeg)
    ))
}

fn lock<T>(mutex: &Mutex<T>) -> Result<std::sync::MutexGuard<'_, T>, LookupError> {
    mutex
        .lock()
        .map_err(|_| LookupError::new("deezer gate poisoned"))
}

#[cfg(test)]
mod tests {
    use std::time::{Duration, Instant};

    use super::{DirectGate, ProxyLanes, proxy_target, snippet, status_message};

    #[test]
    fn a_second_proxy_runs_while_the_first_is_busy() -> Result<(), domain::ports::LookupError> {
        let lanes = ProxyLanes::with_pace(2, Duration::from_millis(80), Duration::from_millis(200));
        let first = lanes.acquire()?;
        let started = Instant::now();
        let second = lanes.acquire()?;
        assert!(
            started.elapsed() < Duration::from_millis(40),
            "{:?}",
            started.elapsed()
        );
        assert_ne!(first.index(), second.index());
        Ok(())
    }

    #[test]
    fn the_same_proxy_waits_out_its_pause() -> Result<(), domain::ports::LookupError> {
        let pause = Duration::from_millis(40);
        let lanes = ProxyLanes::with_pace(1, pause, Duration::from_secs(5));
        drop(lanes.acquire()?);
        let started = Instant::now();
        let _again = lanes.acquire()?;
        assert!(started.elapsed() >= pause, "{:?}", started.elapsed());
        Ok(())
    }

    #[test]
    fn a_rate_limit_sidelines_that_proxy() -> Result<(), domain::ports::LookupError> {
        let quota = Duration::from_millis(80);
        let lanes = ProxyLanes::with_pace(2, Duration::from_millis(50), quota);
        let mut first = lanes.acquire()?;
        first.cool_for_quota();
        drop(first);
        let started = Instant::now();
        let second = lanes.acquire()?;
        assert!(
            started.elapsed() < Duration::from_millis(40),
            "{:?}",
            started.elapsed()
        );
        assert_eq!(second.index(), 1);
        Ok(())
    }

    #[test]
    fn direct_calls_stay_under_the_rate() -> Result<(), domain::ports::LookupError> {
        let gate = DirectGate::new(20)?;
        let started = Instant::now();
        for _ in 0..5 {
            drop(gate.enter()?);
        }
        let elapsed = started.elapsed();
        assert!(elapsed >= Duration::from_millis(190), "{elapsed:?}");
        assert!(elapsed < Duration::from_secs(2), "{elapsed:?}");
        Ok(())
    }

    #[test]
    fn four_direct_calls_block_the_fifth() -> Result<(), domain::ports::LookupError> {
        let gate = DirectGate::new(10_000)?;
        let permits = [gate.enter()?, gate.enter()?, gate.enter()?, gate.enter()?];
        std::thread::scope(|scope| {
            let handle = scope.spawn(|| gate.enter());
            std::thread::sleep(Duration::from_millis(30));
            assert!(!handle.is_finished());
            drop(permits);
            let permit = handle
                .join()
                .map_err(|_| domain::ports::LookupError::new("direct gate thread panicked"))?;
            drop(permit?);
            Ok(())
        })
    }

    #[test]
    fn a_refusal_keeps_a_short_body() {
        let body = snippet("  Quota limit exceeded\n\n<html>");
        assert_eq!(body, "Quota limit exceeded <html>");
        assert_eq!(
            status_message(403, &body),
            "deezer status 403: Quota limit exceeded <html>"
        );
        assert_eq!(status_message(403, ""), "deezer status 403");
    }

    #[test]
    fn proxy_url_puts_the_target_in_the_query() -> Result<(), String> {
        let proxy =
            reqwest::Url::parse("http://proxy-0.example/").map_err(|err| err.to_string())?;
        let url = proxy_target(&proxy, "https://api.deezer.com/track/3135556");
        assert!(
            url.as_str().starts_with("http://proxy-0.example/?target="),
            "{url}"
        );
        Ok(())
    }
}
