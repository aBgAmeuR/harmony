//! Similarity in `0..=1`. `NaN` and anything outside that range is not a score.

use std::cmp::Ordering;

/// A similarity that `matching` may compare.
#[derive(Debug, Clone, Copy)]
pub struct Score(f64);

/// `Score::new` rejected a float.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
pub enum ScoreError {
    #[error("score is NaN")]
    Nan,
    #[error("score is outside 0..=1")]
    Range,
}

impl Score {
    /// # Errors
    ///
    /// [`ScoreError::Nan`] when `value` is NaN.
    /// [`ScoreError::Range`] when `value` is outside `0..=1`.
    pub fn new(value: f64) -> Result<Self, ScoreError> {
        if value.is_nan() {
            return Err(ScoreError::Nan);
        }
        if !(0.0..=1.0).contains(&value) {
            return Err(ScoreError::Range);
        }
        Ok(Self(value))
    }

    #[must_use]
    pub const fn get(self) -> f64 {
        self.0
    }
}

impl PartialEq for Score {
    fn eq(&self, other: &Self) -> bool {
        self.0.to_bits() == other.0.to_bits()
    }
}

impl Eq for Score {}

impl PartialOrd for Score {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Score {
    fn cmp(&self, other: &Self) -> Ordering {
        match self.0.partial_cmp(&other.0) {
            Some(order) => order,
            // `new` rejects NaN, so this arm does not run for a built `Score`.
            None => Ordering::Equal,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{Score, ScoreError};

    #[test]
    fn new_accepts_the_closed_unit_interval() {
        let low = Score::new(0.0);
        let high = Score::new(1.0);
        let mid = Score::new(0.8);

        assert!(matches!(
            (&low, &mid, &high),
            (Ok(low), Ok(mid), Ok(high)) if low < mid && mid < high
        ));
        assert!(mid.is_ok_and(|score| score.get().to_bits() == 0.8_f64.to_bits()));
    }

    #[test]
    fn new_rejects_nan_and_out_of_range() {
        assert_eq!(Score::new(f64::NAN), Err(ScoreError::Nan));
        assert_eq!(Score::new(-0.01), Err(ScoreError::Range));
        assert_eq!(Score::new(1.01), Err(ScoreError::Range));
    }
}
