//! Choose the catalog id whose artist and title both score at least 0.8.

use std::cmp::Ordering;

use super::Score;
use crate::catalog::Id;

const MIN: f64 = 0.8;

/// One search row `find` may keep.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Guess {
    id: Id,
    artist: String,
    title: String,
}

impl Guess {
    #[must_use]
    pub fn new(id: Id, artist: impl Into<String>, title: impl Into<String>) -> Self {
        Self {
            id,
            artist: artist.into(),
            title: title.into(),
        }
    }

    #[must_use]
    pub const fn id(&self) -> Id {
        self.id
    }

    #[must_use]
    pub fn artist(&self) -> &str {
        &self.artist
    }

    #[must_use]
    pub fn title(&self) -> &str {
        &self.title
    }
}

/// Best pair of scores, or nothing when no row clears the threshold.
#[must_use]
pub fn pick(artist: &str, title: &str, guesses: &[Guess]) -> Option<Id> {
    let mut best: Option<(Id, f64)> = None;
    for guess in guesses {
        let Some(title_score) = pair(title, guess.title()) else {
            continue;
        };
        let Some(artist_score) = pair(artist, guess.artist()) else {
            continue;
        };
        if below(title_score) || below(artist_score) {
            continue;
        }
        let sum = title_score.get() + artist_score.get();
        if let Some((_, best_sum)) = best
            && sum.total_cmp(&best_sum) != Ordering::Greater
        {
            continue;
        }
        best = Some((guess.id(), sum));
    }
    best.map(|(id, _sum)| id)
}

fn pair(left: &str, right: &str) -> Option<Score> {
    let value = strsim::jaro_winkler(&left.to_lowercase(), &right.to_lowercase());
    Score::new(value).ok()
}

fn below(score: Score) -> bool {
    score.get().total_cmp(&MIN) == Ordering::Less
}

#[cfg(test)]
mod tests {
    use super::{Guess, pick};
    use crate::catalog::Id;

    fn guess(id: u32, title: &str, artist: &str) -> Guess {
        Guess::new(Id::new(id), artist, title)
    }

    #[test]
    fn pick_prefers_the_artist_over_a_similar_title() {
        let guesses = vec![
            guess(2, "me n my kup (808 mix)", "JadonGot556"),
            guess(1, "Me N My Kup", "Ken Carson"),
            guess(3, "Me n my kup", "LuhMaru"),
        ];

        assert_eq!(
            pick("Ken Carson", "Me N My Kup", &guesses),
            Some(Id::new(1))
        );
    }

    #[test]
    fn pick_rejects_the_same_title_from_another_artist() {
        let guesses = vec![guess(3, "Me n my kup", "LuhMaru")];

        assert_eq!(pick("Ken Carson", "Me N My Kup", &guesses), None);
    }
}
