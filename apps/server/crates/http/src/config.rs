//! `GET /api/v1/config`.

use serde::Serialize;

/// `{ "max_upload_bytes": N }`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[must_use]
pub struct Limits {
    max_upload_bytes: u64,
}

impl Limits {
    #[must_use]
    pub const fn max_upload_bytes(self) -> u64 {
        self.max_upload_bytes
    }
}

pub fn config(max_upload_bytes: u64) -> Limits {
    Limits { max_upload_bytes }
}

#[cfg(test)]
mod tests {
    use super::config;

    #[test]
    fn config_returns_the_byte_limit() -> Result<(), serde_json::Error> {
        let limits = config(50);
        let value = serde_json::to_value(limits)?;

        assert_eq!(limits.max_upload_bytes(), 50);
        assert_eq!(
            value
                .get("max_upload_bytes")
                .and_then(serde_json::Value::as_u64),
            Some(50)
        );
        Ok(())
    }
}
