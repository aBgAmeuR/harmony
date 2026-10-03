//! 403 and 429 are a rate limit: try another lane, once per proxy.
//! Disconnect and 5xx get three tries. A Deezer API error is not retried.
//! Quota text is a rate limit, same as 429.

pub(crate) const TRIES: u32 = 3;

/// Why one HTTP attempt failed.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum Blow {
    Disconnect,
    Limited,
    Server,
    Api,
}

/// What a Deezer `error.message` means.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum ApiMessage {
    Limited,
    Missing,
    Reject,
}

pub(crate) struct Hit {
    pub kind: Blow,
    pub message: String,
}

impl Hit {
    pub(crate) fn new(kind: Blow, message: impl Into<String>) -> Self {
        Self {
            kind,
            message: message.into(),
        }
    }
}

/// How many HTTP attempts this failure is worth.
///
/// `lanes` is the proxy pool. Direct calls pass [`TRIES`].
#[must_use]
pub(crate) const fn attempts(kind: Blow, lanes: u32) -> u32 {
    match kind {
        Blow::Api => 1,
        Blow::Disconnect | Blow::Server => TRIES,
        Blow::Limited => {
            if lanes > TRIES {
                lanes
            } else {
                TRIES
            }
        }
    }
}

/// `None` when the status is success and the body should be parsed.
#[must_use]
pub(crate) const fn http_blow(status: u16) -> Option<Blow> {
    if status == 403 || status == 429 {
        return Some(Blow::Limited);
    }
    if status >= 500 && status < 600 {
        return Some(Blow::Server);
    }
    if status >= 200 && status < 300 {
        return None;
    }
    Some(Blow::Api)
}

#[must_use]
pub(crate) fn api_message(message: &str) -> ApiMessage {
    if message == "Quota limit exceeded" {
        ApiMessage::Limited
    } else if message == "no data" {
        ApiMessage::Missing
    } else {
        ApiMessage::Reject
    }
}

#[cfg(test)]
mod tests {
    use super::{ApiMessage, Blow, TRIES, api_message, attempts, http_blow};

    #[test]
    fn a_rate_limit_tries_every_proxy_and_transport_errors_try_three_times() {
        assert_eq!(attempts(Blow::Limited, 35), 35);
        assert_eq!(attempts(Blow::Limited, 1), TRIES);
        assert_eq!(attempts(Blow::Disconnect, 35), TRIES);
        assert_eq!(attempts(Blow::Server, 35), TRIES);
    }

    #[test]
    fn an_api_error_is_not_retried() {
        assert_eq!(attempts(Blow::Api, 35), 1);
    }

    #[test]
    fn forbidden_and_too_many_requests_are_rate_limits() {
        assert_eq!(http_blow(403), Some(Blow::Limited));
        assert_eq!(http_blow(429), Some(Blow::Limited));
        assert_eq!(http_blow(500), Some(Blow::Server));
        assert_eq!(http_blow(400), Some(Blow::Api));
        assert_eq!(http_blow(200), None);
    }

    #[test]
    fn quota_text_is_a_rate_limit_and_no_data_is_a_miss() {
        assert_eq!(api_message("Quota limit exceeded"), ApiMessage::Limited);
        assert_eq!(api_message("no data"), ApiMessage::Missing);
        assert_eq!(api_message("unknown"), ApiMessage::Reject);
    }
}
