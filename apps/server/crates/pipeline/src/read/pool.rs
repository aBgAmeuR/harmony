//! Fixed pool of scoped workers over a list of items, results in input order.
//!
//! One worker per core, never more workers than items. A single item runs on the
//! caller thread: spawning costs more than it saves on a one-file archive.

use std::num::NonZeroUsize;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::{Mutex, OnceLock, PoisonError};
use std::thread;

/// Workers for `len` items: the cores of [`cores`], capped by `len`.
/// One item never asks the kernel anything.
pub fn workers(len: usize) -> usize {
    if len <= 1 {
        return 1;
    }
    cores().min(len)
}

/// `available_parallelism` (cores after cgroup and affinity limits), read once per process.
///
/// Each call opens `/proc/self/cgroup` and walks the `cpu.max` files: about 17 syscalls.
/// Three calls per `read` cost about 0.1 ms on this VM, 9 % of a one-file archive.
fn cores() -> usize {
    static CORES: OnceLock<usize> = OnceLock::new();
    *CORES.get_or_init(|| thread::available_parallelism().map_or(1, NonZeroUsize::get))
}

/// Applies `work` to every item and keeps the input order.
///
/// Workers take the next index from an atomic counter, so a slow item does not hold a whole share.
/// The first error raises `stop`: every worker finishes the item in hand and takes no new one.
pub fn map<T, R, E, F>(items: Vec<T>, work: F) -> Result<Vec<R>, E>
where
    T: Send,
    R: Send,
    E: Send,
    F: Fn(T) -> Result<R, E> + Sync,
{
    let count = workers(items.len());
    if count == 1 {
        return items.into_iter().map(work).collect();
    }

    let len = items.len();
    let queue: Vec<Mutex<Option<T>>> = items
        .into_iter()
        .map(|item| Mutex::new(Some(item)))
        .collect();
    let next = AtomicUsize::new(0);
    let stop = AtomicBool::new(false);
    let done: Mutex<Vec<(usize, R)>> = Mutex::new(Vec::with_capacity(len));
    let failed: Mutex<Option<E>> = Mutex::new(None);

    thread::scope(|scope| {
        for _ in 0..count {
            scope.spawn(|| {
                while !stop.load(Ordering::Acquire) {
                    let index = next.fetch_add(1, Ordering::Relaxed);
                    let Some(slot) = queue.get(index) else {
                        break;
                    };
                    let Some(item) = slot.lock().unwrap_or_else(PoisonError::into_inner).take()
                    else {
                        break;
                    };
                    match work(item) {
                        Ok(value) => done
                            .lock()
                            .unwrap_or_else(PoisonError::into_inner)
                            .push((index, value)),
                        Err(err) => {
                            stop.store(true, Ordering::Release);
                            failed
                                .lock()
                                .unwrap_or_else(PoisonError::into_inner)
                                .get_or_insert(err);
                        }
                    }
                }
            });
        }
    });

    if let Some(err) = failed.into_inner().unwrap_or_else(PoisonError::into_inner) {
        return Err(err);
    }
    let mut done = done.into_inner().unwrap_or_else(PoisonError::into_inner);
    done.sort_unstable_by_key(|(index, _)| *index);
    Ok(done.into_iter().map(|(_, value)| value).collect())
}

#[cfg(test)]
mod tests {
    use super::map;

    #[test]
    fn keeps_input_order() {
        let items: Vec<u32> = (0..100).collect();
        let doubled = map(items, |item| Ok::<_, ()>(item * 2));
        assert_eq!(doubled, Ok((0..100).map(|item| item * 2).collect()));
    }

    #[test]
    fn an_error_stops_the_pool() {
        let items: Vec<u32> = (0..100).collect();
        let out = map(items, |item| if item == 3 { Err(item) } else { Ok(item) });
        assert_eq!(out, Err(3));
    }
}
