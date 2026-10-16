//! Artist names shared by every play that repeats them.

use std::collections::HashSet;
use std::hash::{BuildHasherDefault, Hasher};
use std::sync::Arc;

/// One `Arc<str>` per distinct artist. A history replays few artists (106 for 799 plays in the
/// test export), so most plays clone a pointer instead of allocating a copy.
///
/// Titles are not interned: 558 of those 799 are distinct, and a miss costs a hash, an insert and
/// the allocation anyway. Kept per batch, on one thread: no lock.
#[derive(Debug, Default)]
pub struct Names {
    seen: HashSet<Arc<str>, BuildHasherDefault<NameHasher>>,
}

impl Names {
    #[must_use]
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            seen: HashSet::with_capacity_and_hasher(capacity, BuildHasherDefault::default()),
        }
    }

    /// The shared copy of `text`, created on first sight.
    pub fn get(&mut self, text: &str) -> Arc<str> {
        if let Some(shared) = self.seen.get(text) {
            return Arc::clone(shared);
        }
        let shared: Arc<str> = Arc::from(text);
        self.seen.insert(Arc::clone(&shared));
        shared
    }
}

/// Multiply-rotate hash over 8-byte words (the `FxHash` scheme), for short names.
///
/// `SipHash`, the std default, resists collision flooding and costs about 1.5 cycles per byte plus
/// a finalization. Here the input is the uploader's own history, in a table that lives one batch.
#[derive(Debug, Default, Clone, Copy)]
pub struct NameHasher {
    hash: u64,
}

const SEED: u64 = 0x51_7c_c1_b7_27_22_0a_95;

impl NameHasher {
    fn add(&mut self, word: u64) {
        self.hash = (self.hash.rotate_left(5) ^ word).wrapping_mul(SEED);
    }
}

impl Hasher for NameHasher {
    fn write(&mut self, bytes: &[u8]) {
        let mut words = bytes.chunks_exact(8);
        for word in &mut words {
            let mut buffer = [0_u8; 8];
            buffer.copy_from_slice(word);
            self.add(u64::from_le_bytes(buffer));
        }
        let rest = words.remainder();
        if !rest.is_empty() {
            let mut buffer = [0_u8; 8];
            if let Some(head) = buffer.get_mut(..rest.len()) {
                head.copy_from_slice(rest);
            }
            self.add(u64::from_le_bytes(buffer));
        }
    }

    fn write_u8(&mut self, byte: u8) {
        self.add(u64::from(byte));
    }

    fn finish(&self) -> u64 {
        self.hash
    }
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use super::Names;

    #[test]
    fn equal_names_share_one_allocation() {
        let mut names = Names::default();
        let first = names.get("Artist");
        let second = names.get("Artist");
        assert!(Arc::ptr_eq(&first, &second));
        assert!(!Arc::ptr_eq(&first, &names.get("Other")));
    }
}
