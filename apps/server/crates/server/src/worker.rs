//! One worker. `open` wakes it. It claims a job, runs the pipeline, then puts the file.

use std::sync::Arc;

use adapters::deezer::Deezer;
use adapters::fs::Fs;
use adapters::s3::S3;
use domain::fail::Fail;
use domain::job::{Job, Running};
use domain::observe::{Note, Progress, Report};
use domain::ports::{Blob, GetError, PutError, Store};
use pipeline::{Live, Stamp};
use tokio::sync::{Notify, watch};

/// Local directory or S3. The route and the worker share one of these.
pub(crate) enum Shelf {
    Dir(Fs),
    Bucket(S3),
}

impl Blob for Shelf {
    fn put(
        &self,
        id: domain::package::Id,
        artifact: &domain::artifact::Artifact,
    ) -> Result<(), PutError> {
        match self {
            Self::Dir(fs) => fs.put(id, artifact),
            Self::Bucket(s3) => s3.put(id, artifact),
        }
    }

    fn get(&self, id: domain::package::Id) -> Result<domain::artifact::Artifact, GetError> {
        match self {
            Self::Dir(fs) => fs.get(id),
            Self::Bucket(s3) => s3.get(id),
        }
    }
}

/// Shared by the routes and the worker.
#[derive(Clone)]
pub(crate) struct App {
    pub(crate) store: Arc<Store>,
    pub(crate) progress: Arc<Progress>,
    pub(crate) wake: Arc<Notify>,
    pub(crate) blob: Arc<Shelf>,
    pub(crate) deezer: Arc<Deezer>,
    pub(crate) max_upload_bytes: u64,
    pub(crate) public_url: Option<String>,
}

pub(crate) async fn listen(app: App, mut stop: watch::Receiver<bool>) {
    loop {
        tokio::select! {
            changed = stop.changed() => {
                if changed.is_err() || *stop.borrow() {
                    break;
                }
            }
            () = app.wake.notified() => {
                while let Some(job) = app.store.claim() {
                    if *stop.borrow() {
                        break;
                    }
                    let app = app.clone();
                    let calls_at = app.deezer.calls();
                    let retries_at = app.deezer.retries();
                    let handle = tokio::task::spawn_blocking(move || {
                        let calls = app.deezer.calls().saturating_sub(calls_at);
                        let retries = app.deezer.retries().saturating_sub(retries_at);
                        run_job(
                            app.store.as_ref(),
                            app.progress.as_ref(),
                            app.blob.as_ref(),
                            app.deezer.as_ref(),
                            job,
                            calls,
                            retries,
                        );
                    });
                    if handle.await.is_err() {
                        break;
                    }
                }
            }
        }
    }
}

pub(crate) fn run_job(
    store: &Store,
    progress: &Progress,
    blob: &impl Blob,
    lookup: &(impl domain::ports::Lookup + Sync),
    job: Job<Running>,
    calls: u64,
    retries: u64,
) {
    let id = job.id();
    let (source, pending) = job.split();
    let stamp = Stamp::new(pending.wall(), pending.began());
    let mut report = Report::new();
    let path = std::env::temp_dir().join(format!("harmony-{id}.duckdb"));
    let outcome = {
        let mut live = Live::new(id, progress, &mut report);
        pipeline::run(source, &pending.package(), &stamp, &mut live, lookup, &path)
    };
    match outcome {
        Ok(artifact) => {
            report.tally(calls, retries, report.misses());
            finish(store, progress, blob, pending, artifact, report);
        }
        Err(fail) => {
            let _ = std::fs::remove_file(&path);
            store.fail(pending, fail);
        }
    }
}

fn finish(
    store: &Store,
    progress: &Progress,
    blob: &impl Blob,
    pending: domain::job::Pending,
    artifact: domain::artifact::Artifact,
    report: Report,
) {
    let id = pending.id();
    tracing::info!(
        id = %id,
        calls = report.calls(),
        retries = report.retries(),
        misses = report.misses(),
        ms = report.ms(),
        "package report"
    );
    match blob.put(id, &artifact) {
        Ok(()) => {
            let _ = std::fs::remove_file(artifact.path());
            progress.push(id, Note::Done(report.clone()));
            store.done(pending, artifact, report);
        }
        Err(err) => {
            let fail = Fail::from(err);
            progress.push(id, Note::Fail(fail.clone()));
            let _ = std::fs::remove_file(artifact.path());
            store.fail(pending, fail);
        }
    }
}

#[cfg(test)]
mod tests {
    use adapters::fs::Fs;
    use adapters::memory::Memory;
    use domain::catalog::Catalog;
    use domain::observe::Progress;
    use domain::package::State;
    use domain::ports::Store;
    use domain::source::{Selection, Source};

    use super::run_job;

    #[test]
    fn a_zip_without_history_fails_the_package() -> Result<(), Fixture> {
        let store = Store::new();
        let source = Source::open(
            "history.zip".to_owned(),
            b"PK\x03\x04".to_vec(),
            Selection::All,
            1000,
        )?;
        let opened = store.open(source)?;
        let progress = Progress::new();
        progress.open(opened.id());
        let job = store.claim().ok_or(Fixture::Missing)?;
        let lookup = Memory::ready(
            Vec::new(),
            Catalog::new(Vec::new(), Vec::new(), Vec::new(), Vec::new()),
        );
        let root = tempfile::tempdir().map_err(|_| Fixture::Missing)?;
        let blob = Fs::open(root.path())?;

        run_job(&store, &progress, &blob, &lookup, job, 0, 0);

        let settled = store.get(opened.id())?;
        assert_eq!(settled.state(), State::Failed);
        assert!(settled.fail().is_some());
        let event = progress.get(opened.id()).ok_or(Fixture::Missing)?;
        let value = serde_json::to_value(event)?;
        assert_eq!(
            value.get("runStatus").and_then(serde_json::Value::as_str),
            Some("error")
        );
        Ok(())
    }

    #[derive(Debug)]
    #[allow(
        dead_code,
        reason = "the harness prints this only when a fixture fails"
    )]
    enum Fixture {
        Source(domain::source::SourceError),
        Open(domain::ports::OpenError),
        Missing,
        Get(domain::ports::Missing),
        Put(domain::ports::PutError),
        Json(serde_json::Error),
    }

    impl From<domain::source::SourceError> for Fixture {
        fn from(err: domain::source::SourceError) -> Self {
            Self::Source(err)
        }
    }

    impl From<domain::ports::OpenError> for Fixture {
        fn from(err: domain::ports::OpenError) -> Self {
            Self::Open(err)
        }
    }

    impl From<domain::ports::Missing> for Fixture {
        fn from(err: domain::ports::Missing) -> Self {
            Self::Get(err)
        }
    }

    impl From<domain::ports::PutError> for Fixture {
        fn from(err: domain::ports::PutError) -> Self {
            Self::Put(err)
        }
    }

    impl From<serde_json::Error> for Fixture {
        fn from(err: serde_json::Error) -> Self {
            Self::Json(err)
        }
    }
}
