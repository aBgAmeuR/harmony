//! Public package id: six ASCII alphanumeric bytes.

use rand::Rng;

const LEN: usize = 6;

/// Public id. `parse` and `generate` are the only constructors.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Id([u8; LEN]);

/// `Id::parse` rejected a string.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
pub enum IdError {
    #[error("package id must be 6 characters")]
    Length,
    #[error("package id must be alphanumeric")]
    Alphabet,
}

impl Id {
    /// # Errors
    ///
    /// [`IdError::Length`] when `value` is not 6 bytes.
    /// [`IdError::Alphabet`] when a byte is not ASCII alphanumeric.
    pub fn parse(value: &str) -> Result<Self, IdError> {
        let Ok(bytes) = <[u8; LEN]>::try_from(value.as_bytes()) else {
            return Err(IdError::Length);
        };
        if !bytes.iter().all(u8::is_ascii_alphanumeric) {
            return Err(IdError::Alphabet);
        }
        Ok(Self(bytes))
    }

    /// Six random alphanumeric bytes. The store retries when the id is taken.
    #[must_use]
    pub fn generate() -> Self {
        let mut bytes = [0_u8; LEN];
        let mut rng = rand::rng();
        for slot in &mut bytes {
            *slot = rng.sample(rand::distr::Alphanumeric);
        }
        Self(bytes)
    }

    #[must_use]
    pub const fn as_str(&self) -> &str {
        match std::str::from_utf8(&self.0) {
            Ok(text) => text,
            // Constructors only store ASCII alphanumeric bytes.
            Err(_) => "",
        }
    }
}

impl std::fmt::Display for Id {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter.write_str(self.as_str())
    }
}

#[cfg(test)]
mod tests {
    use super::{Id, IdError};

    #[test]
    fn parse_accepts_six_alphanumeric_characters() -> Result<(), IdError> {
        let id = Id::parse("Ab3xYz")?;

        assert_eq!(id.as_str(), "Ab3xYz");
        Ok(())
    }

    #[test]
    fn parse_rejects_the_wrong_length() {
        assert_eq!(Id::parse("short"), Err(IdError::Length));
        assert_eq!(Id::parse("toolong1"), Err(IdError::Length));
    }

    #[test]
    fn parse_rejects_a_symbol() {
        assert_eq!(Id::parse("Ab3xY-"), Err(IdError::Alphabet));
    }

    #[test]
    fn generate_roundtrips_through_parse() {
        let id = Id::generate();
        let parsed = Id::parse(id.as_str());

        assert_eq!(parsed, Ok(id));
    }
}
