//! `GET /api/v1/packages/{id}/stream`.

use std::sync::mpsc::Receiver;

use domain::observe::{Event, Progress};
use domain::package::IdError;

use crate::error::HttpError;

/// The live snapshot, or [`HttpError::Missing`] when the id is unknown.
///
/// # Errors
///
/// [`HttpError::Missing`] when `id` is not six alphanumeric characters, or no snapshot exists.
pub fn watch(progress: &Progress, id: &str) -> Result<Receiver<Event>, HttpError> {
    let id = match domain::package::Id::parse(id) {
        Ok(id) => id,
        Err(IdError::Length | IdError::Alphabet) => return Err(HttpError::Missing),
    };
    progress.watch(id).ok_or(HttpError::Missing)
}

/// The SSE event name of every snapshot, part of the public stream contract.
pub const EVENT: &str = "pipeline";

#[cfg(test)]
mod tests {
    use std::time::Duration;

    use super::watch;
    use crate::error::HttpError;
    use domain::observe::Progress;
    use domain::package::{Id, IdError};

    #[test]
    fn watch_sends_the_idle_snapshot() -> Result<(), Fixture> {
        let progress = Progress::new();
        let id = Id::parse("Ab3xYz")?;
        progress.open(id);
        let rx = watch(&progress, id.as_str())?;
        let event = rx
            .recv_timeout(Duration::from_millis(200))
            .map_err(|_| Fixture::Quiet)?;
        let value = serde_json::to_value(&event)?;

        assert_eq!(
            value.get("type").and_then(serde_json::Value::as_str),
            Some("snapshot")
        );
        assert_eq!(
            value.get("seq").and_then(serde_json::Value::as_u64),
            Some(0)
        );
        assert_eq!(
            value.get("runStatus").and_then(serde_json::Value::as_str),
            Some("idle")
        );
        Ok(())
    }

    #[test]
    fn watch_misses_an_unknown_or_invalid_id() {
        let progress = Progress::new();

        assert!(matches!(
            watch(&progress, "Ab3xYz"),
            Err(HttpError::Missing)
        ));
        assert!(matches!(watch(&progress, "nope"), Err(HttpError::Missing)));
        assert_eq!(HttpError::Missing.status(), 404);
    }

    #[derive(Debug)]
    #[allow(dead_code, reason = "the test harness reads the error through Debug")]
    enum Fixture {
        Id(IdError),
        Quiet,
        Json(serde_json::Error),
        Http(HttpError),
    }

    impl From<IdError> for Fixture {
        fn from(err: IdError) -> Self {
            Self::Id(err)
        }
    }

    impl From<serde_json::Error> for Fixture {
        fn from(err: serde_json::Error) -> Self {
            Self::Json(err)
        }
    }

    impl From<HttpError> for Fixture {
        fn from(err: HttpError) -> Self {
            Self::Http(err)
        }
    }
}
