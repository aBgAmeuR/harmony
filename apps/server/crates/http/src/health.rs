//! `GET /health`.

#[must_use]
pub fn health() -> &'static str {
    "ok"
}

#[cfg(test)]
mod tests {
    use super::health;

    #[test]
    fn health_is_ok() {
        assert_eq!(health(), "ok");
    }
}
