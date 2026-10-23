//! Snapshot the web already parses. `push` updates it and logs at once.
//! `watch` sends that snapshot immediately, then at most once per interval,
//! and only when it changed. `Done` and `Fail` wait for the next send.

use std::collections::HashMap;
use std::sync::{Arc, Condvar, Mutex};
use std::thread;
use std::time::{Duration, Instant};

use chrono::{SecondsFormat, Utc};
use serde::Serialize;

use super::{Metric, Report};
use crate::fail::Fail;
use crate::package;
use crate::stage::Stage;

const INTERVAL: Duration = Duration::from_secs(1);

/// What a step tells the snapshot.
#[derive(Debug)]
pub enum Note {
    Start(Stage),
    Tick {
        stage: Stage,
        current: u64,
        total: u64,
        failed: u64,
    },
    End(Metric),
    Fail(Fail),
    Done(Report),
}

/// JSON object sent on the `pipeline` stream. One shape: `snapshot`.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Event {
    #[serde(rename = "type")]
    kind: Kind,
    seq: u64,
    steps: Vec<Step>,
    run_status: Run,
    #[serde(skip_serializing_if = "Option::is_none")]
    started_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    ended_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    stats: Option<Stats>,
}

#[derive(Debug, Clone, Copy, Serialize)]
enum Kind {
    #[serde(rename = "snapshot")]
    Snapshot,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
enum Run {
    Idle,
    Running,
    Done,
    Error,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
enum StepStatus {
    Pending,
    Running,
    Done,
    Error,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct Step {
    id: &'static str,
    label: &'static str,
    status: StepStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    started_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    ended_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    progress: Option<Tick>,
    #[serde(skip_serializing_if = "Option::is_none")]
    output: Option<Counts>,
}

#[derive(Debug, Clone, Serialize)]
struct Tick {
    current: u64,
    total: u64,
    failed: u64,
}

#[derive(Debug, Clone, Serialize)]
struct Counts {
    read: u64,
    keep: u64,
    #[serde(rename = "drop")]
    dropped: u64,
}

#[derive(Debug, Clone, Serialize)]
struct Stats {
    calls: u64,
    retries: u64,
    misses: u64,
    ms: u64,
}

struct RunState {
    event: Event,
    dirty: bool,
    terminal: bool,
}

struct Inner {
    interval: Duration,
    runs: Mutex<HashMap<package::Id, RunState>>,
    wake: Condvar,
}

/// One snapshot per package. `open` starts it `idle` with seven pending steps.
#[must_use]
pub struct Progress {
    inner: Arc<Inner>,
}

impl Progress {
    pub fn new() -> Self {
        Self::with_interval(INTERVAL)
    }

    pub fn with_interval(interval: Duration) -> Self {
        Self {
            inner: Arc::new(Inner {
                interval,
                runs: Mutex::new(HashMap::new()),
                wake: Condvar::new(),
            }),
        }
    }

    #[must_use]
    pub fn interval(&self) -> Duration {
        self.inner.interval
    }

    pub fn open(&self, id: package::Id) {
        let Ok(mut runs) = self.inner.runs.lock() else {
            return;
        };
        runs.insert(id, RunState::idle());
    }

    pub fn push(&self, id: package::Id, note: Note) {
        let Ok(mut runs) = self.inner.runs.lock() else {
            return;
        };
        let Some(run) = runs.get_mut(&id) else {
            return;
        };
        apply(id, run, note);
        self.inner.wake.notify_all();
    }

    #[must_use]
    pub fn get(&self, id: package::Id) -> Option<Event> {
        let runs = self.inner.runs.lock().ok()?;
        runs.get(&id).map(|run| run.event.clone())
    }

    /// Current snapshot, then later snapshots at most once per interval.
    ///
    /// The stream ends after the send that includes `Done` or `Fail`.
    /// A watcher that connects after that still receives the snapshot immediately.
    #[must_use]
    pub fn watch(&self, id: package::Id) -> Option<std::sync::mpsc::Receiver<Event>> {
        self.get(id)?;
        let (tx, rx) = std::sync::mpsc::channel();
        let inner = Arc::clone(&self.inner);
        thread::spawn(move || serve(&inner, id, tx));
        Some(rx)
    }
}

impl Default for Progress {
    fn default() -> Self {
        Self::new()
    }
}

impl RunState {
    fn idle() -> Self {
        let steps = Stage::ALL
            .into_iter()
            .map(|stage| Step {
                id: stage.step_id(),
                label: stage.label(),
                status: StepStatus::Pending,
                started_at: None,
                ended_at: None,
                error: None,
                progress: None,
                output: None,
            })
            .collect();
        Self {
            event: Event {
                kind: Kind::Snapshot,
                seq: 0,
                steps,
                run_status: Run::Idle,
                started_at: None,
                ended_at: None,
                stats: None,
            },
            dirty: false,
            terminal: false,
        }
    }
}

fn apply(id: package::Id, run: &mut RunState, note: Note) {
    run.event.seq = run.event.seq.saturating_add(1);
    run.dirty = true;
    let at = Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true);
    match note {
        Note::Start(stage) => {
            if run.event.run_status == Run::Idle {
                run.event.run_status = Run::Running;
                run.event.started_at = Some(at.clone());
            }
            if let Some(step) = step_mut(&mut run.event, stage) {
                step.status = StepStatus::Running;
                step.started_at = Some(at);
            }
            tracing::info!(id = %id, stage = %stage, "stage start");
        }
        Note::Tick {
            stage,
            current,
            total,
            failed,
        } => {
            if let Some(step) = step_mut(&mut run.event, stage) {
                step.progress = Some(Tick {
                    current,
                    total,
                    failed,
                });
            }
            tracing::info!(id = %id, stage = %stage, current, total, failed, "stage tick");
        }
        Note::End(metric) => {
            if let Some(step) = step_mut(&mut run.event, metric.stage()) {
                step.status = StepStatus::Done;
                step.ended_at = Some(at);
                step.progress = None;
                step.output = Some(Counts {
                    read: metric.read(),
                    keep: metric.keep(),
                    dropped: metric.dropped(),
                });
            }
            tracing::info!(
                id = %id,
                stage = %metric.stage(),
                ms = metric.ms(),
                read = metric.read(),
                keep = metric.keep(),
                drop = metric.dropped(),
                "stage end"
            );
        }
        Note::Fail(fail) => {
            run.event.run_status = Run::Error;
            run.event.ended_at = Some(at.clone());
            run.terminal = true;
            if let Some(step) = step_mut(&mut run.event, fail.stage()) {
                step.status = StepStatus::Error;
                step.ended_at = Some(at);
                step.error = Some(fail.message().to_owned());
            }
            tracing::error!(id = %id, stage = %fail.stage(), message = fail.message(), "stage fail");
        }
        Note::Done(report) => {
            run.event.run_status = Run::Done;
            run.event.ended_at = Some(at);
            run.event.stats = Some(Stats {
                calls: report.calls(),
                retries: report.retries(),
                misses: report.misses(),
                ms: report.ms(),
            });
            run.terminal = true;
            tracing::info!(
                id = %id,
                calls = report.calls(),
                retries = report.retries(),
                misses = report.misses(),
                ms = report.ms(),
                "run done"
            );
        }
    }
}

fn step_mut(event: &mut Event, stage: Stage) -> Option<&mut Step> {
    let index = Stage::ALL.iter().position(|item| *item == stage)?;
    event.steps.get_mut(index)
}

fn serve(inner: &Inner, id: package::Id, tx: std::sync::mpsc::Sender<Event>) {
    publish(inner, id, &tx);
    drop(tx);
}

fn publish(inner: &Inner, id: package::Id, tx: &std::sync::mpsc::Sender<Event>) {
    let Some((event, terminal)) = snapshot(inner, id) else {
        return;
    };
    if tx.send(event).is_err() {
        return;
    }
    if terminal {
        return;
    }
    let mut last = Instant::now();
    loop {
        let Ok(mut runs) = inner.runs.lock() else {
            return;
        };
        loop {
            let Some(run) = runs.get(&id) else {
                return;
            };
            if run.dirty {
                break;
            }
            runs = match inner.wake.wait(runs) {
                Ok(guard) => guard,
                Err(_) => return,
            };
        }
        let wait = inner.interval.saturating_sub(last.elapsed());
        if !wait.is_zero() {
            let Ok((guard, result)) = inner.wake.wait_timeout(runs, wait) else {
                return;
            };
            runs = guard;
            if !result.timed_out() {
                continue;
            }
        }
        let Some(run) = runs.get_mut(&id) else {
            return;
        };
        if !run.dirty {
            continue;
        }
        let event = run.event.clone();
        let terminal = run.terminal;
        run.dirty = false;
        drop(runs);
        if tx.send(event).is_err() {
            return;
        }
        last = Instant::now();
        if terminal {
            return;
        }
    }
}

fn snapshot(inner: &Inner, id: package::Id) -> Option<(Event, bool)> {
    let runs = inner.runs.lock().ok()?;
    let run = runs.get(&id)?;
    Some((run.event.clone(), run.terminal))
}

#[cfg(test)]
mod tests {
    use std::sync::mpsc::TryRecvError;
    use std::time::Duration;

    use super::{Note, Progress};
    use crate::fail::Fail;
    use crate::observe::{Metric, Report};
    use crate::package::Id;
    use crate::stage::Stage;

    #[derive(Debug)]
    #[allow(
        dead_code,
        reason = "the harness prints this only when a fixture fails"
    )]
    enum Fixture {
        Id(crate::package::IdError),
        Json(serde_json::Error),
        Missing,
        Recv(std::sync::mpsc::RecvTimeoutError),
    }

    impl From<crate::package::IdError> for Fixture {
        fn from(error: crate::package::IdError) -> Self {
            Self::Id(error)
        }
    }

    impl From<serde_json::Error> for Fixture {
        fn from(error: serde_json::Error) -> Self {
            Self::Json(error)
        }
    }

    impl From<std::sync::mpsc::RecvTimeoutError> for Fixture {
        fn from(error: std::sync::mpsc::RecvTimeoutError) -> Self {
            Self::Recv(error)
        }
    }

    fn id() -> Result<Id, Fixture> {
        Ok(Id::parse("Ab3xYz")?)
    }

    fn at<'a>(value: &'a serde_json::Value, key: &str) -> Result<&'a serde_json::Value, Fixture> {
        value.get(key).ok_or(Fixture::Missing)
    }

    fn progress() -> Progress {
        Progress::with_interval(Duration::from_millis(60))
    }

    #[test]
    fn the_default_interval_is_one_second() {
        assert_eq!(Progress::new().interval(), Duration::from_secs(1));
    }

    #[test]
    fn open_is_an_idle_snapshot_of_seven_steps() -> Result<(), Fixture> {
        let progress = Progress::new();
        let id = id()?;
        progress.open(id);
        let value = serde_json::to_value(progress.get(id).ok_or(Fixture::Missing)?)?;

        assert_eq!(at(&value, "type")?, "snapshot");
        assert_eq!(at(&value, "seq")?, 0);
        assert_eq!(at(&value, "runStatus")?, "idle");
        assert!(value.get("startedAt").is_none());
        let steps = at(&value, "steps")?.as_array().ok_or(Fixture::Missing)?;
        assert_eq!(steps.len(), 7);
        let first = steps.first().ok_or(Fixture::Missing)?;
        assert_eq!(at(first, "id")?, "extract_archive");
        assert_eq!(at(first, "label")?, "Extract archive");
        assert_eq!(at(first, "status")?, "pending");
        let last = steps.get(6).ok_or(Fixture::Missing)?;
        assert_eq!(at(last, "id")?, "persist_interactions");
        Ok(())
    }

    #[test]
    fn end_records_read_keep_and_drop() -> Result<(), Fixture> {
        let progress = Progress::new();
        let id = id()?;
        progress.open(id);
        progress.push(id, Note::Start(Stage::Parse));
        progress.push(id, Note::End(Metric::new(Stage::Parse, 12, 8, 5, 3)));
        let value = serde_json::to_value(progress.get(id).ok_or(Fixture::Missing)?)?;

        assert_eq!(at(&value, "runStatus")?, "running");
        assert!(value.get("startedAt").is_some());
        let steps = at(&value, "steps")?.as_array().ok_or(Fixture::Missing)?;
        let parse = steps.get(1).ok_or(Fixture::Missing)?;
        assert_eq!(at(parse, "status")?, "done");
        let output = at(parse, "output")?;
        assert_eq!(at(output, "read")?, 8);
        assert_eq!(at(output, "keep")?, 5);
        assert_eq!(at(output, "drop")?, 3);
        Ok(())
    }

    #[test]
    fn ticks_collapse_into_one_send_per_interval() -> Result<(), Fixture> {
        let progress = progress();
        let id = id()?;
        progress.open(id);
        let rx = progress.watch(id).ok_or(Fixture::Missing)?;
        let _idle = rx.recv_timeout(Duration::from_millis(200))?;

        progress.push(
            id,
            Note::Tick {
                stage: Stage::Resolve,
                current: 1,
                total: 10,
                failed: 0,
            },
        );
        progress.push(
            id,
            Note::Tick {
                stage: Stage::Resolve,
                current: 9,
                total: 10,
                failed: 2,
            },
        );
        std::thread::sleep(Duration::from_millis(20));
        assert!(matches!(rx.try_recv(), Err(TryRecvError::Empty)));

        let value = serde_json::to_value(rx.recv_timeout(Duration::from_millis(200))?)?;
        assert_eq!(at(&value, "seq")?, 2);
        let steps = at(&value, "steps")?.as_array().ok_or(Fixture::Missing)?;
        let resolve = steps.get(3).ok_or(Fixture::Missing)?;
        let tick = at(resolve, "progress")?;
        assert_eq!(at(tick, "current")?, 9);
        assert_eq!(at(tick, "failed")?, 2);
        assert!(matches!(rx.try_recv(), Err(TryRecvError::Empty)));
        Ok(())
    }

    #[test]
    fn fail_waits_for_the_interval_then_closes() -> Result<(), Fixture> {
        let progress = progress();
        let id = id()?;
        progress.open(id);
        let rx = progress.watch(id).ok_or(Fixture::Missing)?;
        let _idle = rx.recv_timeout(Duration::from_millis(200))?;

        progress.push(
            id,
            Note::Fail(Fail::new(Stage::Persist, "disk full".to_owned())),
        );
        std::thread::sleep(Duration::from_millis(20));
        assert!(matches!(rx.try_recv(), Err(TryRecvError::Empty)));

        let value = serde_json::to_value(rx.recv_timeout(Duration::from_millis(200))?)?;
        assert_eq!(at(&value, "runStatus")?, "error");
        assert!(value.get("endedAt").is_some());
        let steps = at(&value, "steps")?.as_array().ok_or(Fixture::Missing)?;
        let persist = steps.get(6).ok_or(Fixture::Missing)?;
        assert_eq!(at(persist, "status")?, "error");
        assert_eq!(at(persist, "error")?, "disk full");
        assert!(rx.recv_timeout(Duration::from_millis(40)).is_err());
        Ok(())
    }

    #[test]
    fn done_puts_the_report_on_the_snapshot() -> Result<(), Fixture> {
        let progress = Progress::new();
        let id = id()?;
        progress.open(id);
        let mut report = Report::new();
        report.push(Metric::new(Stage::Extract, 4, 1, 1, 0));
        report.tally(8, 1, 2);
        progress.push(id, Note::Done(report));
        let value = serde_json::to_value(progress.get(id).ok_or(Fixture::Missing)?)?;

        assert_eq!(at(&value, "runStatus")?, "done");
        let stats = at(&value, "stats")?;
        assert_eq!(at(stats, "calls")?, 8);
        assert_eq!(at(stats, "retries")?, 1);
        assert_eq!(at(stats, "misses")?, 2);
        assert_eq!(at(stats, "ms")?, 4);
        Ok(())
    }
}
