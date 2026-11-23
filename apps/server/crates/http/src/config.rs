//! `GET /api/v1/config`.

use serde::Serialize;

/// `{ "max_upload_bytes": N, "upload_enabled": B }`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[must_use]
pub struct Limits {
    max_upload_bytes: u64,
    upload_enabled: bool,
}

impl Limits {
    #[must_use]
    pub const fn max_upload_bytes(self) -> u64 {
        self.max_upload_bytes
    }

    #[must_use]
    pub const fn upload_enabled(self) -> bool {
        self.upload_enabled
    }
}

pub fn config(max_upload_bytes: u64, upload_enabled: bool) -> Limits {
    Limits {
        max_upload_bytes,
        upload_enabled,
    }
}

#[cfg(test)]
mod tests {
    use super::config;

    #[test]
    fn config_returns_the_byte_limit_and_upload_switch() -> Result<(), serde_json::Error> {
        let limits = config(50, false);
        let value = serde_json::to_value(limits)?;

        assert_eq!(limits.max_upload_bytes(), 50);
        assert!(!limits.upload_enabled());
        assert_eq!(
            value
                .get("max_upload_bytes")
                .and_then(serde_json::Value::as_u64),
            Some(50)
        );
        assert_eq!(
            value
                .get("upload_enabled")
                .and_then(serde_json::Value::as_bool),
            Some(false)
        );
        Ok(())
    }
}
