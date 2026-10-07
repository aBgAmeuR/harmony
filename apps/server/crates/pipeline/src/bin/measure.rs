//! Clock `read` on a Spotify archive and, later, compare that clock to a saved run.
//!
//! Stdout is one JSON object. Notes go to stderr. A comparison without `--lever`
//! is refused: a ratio is not a result until it names a cause.

use std::collections::HashMap;
use std::env;
use std::fs;
use std::hint::black_box;
use std::io::{self, Write};
use std::path::PathBuf;
use std::process::{Command, ExitCode};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Instant;

use tracing::span::{Attributes, Id as SpanId, Record};
use tracing::{Event, Subscriber};

use domain::observe::{Progress, Report};
use domain::package::Id;
use domain::play::History;
use domain::source::{Selection, Source};
use domain::stage::Stage;
use pipeline::Live;
use pipeline::read;
use serde_json::{Value, json};

const HELP: &str = "\
measure — baseline clock for pipeline::read

  measure [--zip PATH] [--warmup N] [--samples N] [--label NAME]
  measure --loop N [--zip PATH]
  measure --against FILE --lever PHRASE [--evidence TEXT] [timing flags]

--zip       archive (default: benches/data_test.zip next to this crate)
--warmup    untimed runs before the samples (default: 3)
--samples   timed runs (default: 30)
--label     name stored in the JSON (default: baseline)
--loop N    run read N times and print nothing but a stderr count.
            Use this under samply, heaptrack, and valgrind.
--against   timings.json from an earlier run
--lever     why the clock moved. Required with --against.
            Example: \"parse: title bytes stay on the stack instead of a String\"
--evidence  which profile supports the lever (samply, heaptrack, cachegrind)

The timed region is read::run only. Copying the archive, Source::open, and
Live setup sit outside it. Resolve, enrich, and persist are not in this binary:
they need Deezer or a catalog, so they are not part of this reference.
";

struct Args {
    zip: PathBuf,
    warmup: u32,
    samples: u32,
    label: String,
    loop_count: u32,
    against: Option<PathBuf>,
    lever: Option<String>,
    evidence: Option<String>,
}

enum Done {
    Help,
    Report,
}

fn main() -> ExitCode {
    match run() {
        Ok(Done::Help | Done::Report) => ExitCode::SUCCESS,
        Err(err) => {
            let _ = writeln!(io::stderr(), "measure: {err}");
            ExitCode::from(1)
        }
    }
}

fn run() -> Result<Done, String> {
    let Some(args) = args()? else {
        print!("{HELP}");
        return Ok(Done::Help);
    };
    if args.loop_count > 0 {
        run_loop(&args)?;
        return Ok(Done::Report);
    }
    let report = time_read(&args)?;
    let pretty = serde_json::to_string_pretty(&report).map_err(|err| err.to_string())?;
    let _ = writeln!(io::stdout(), "{pretty}");
    summarize(&report);
    Ok(Done::Report)
}

fn args() -> Result<Option<Args>, String> {
    let mut zip = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("benches/data_test.zip");
    let mut warmup = 3_u32;
    let mut samples = 30_u32;
    let mut label = "baseline".to_owned();
    let mut loop_count = 0_u32;
    let mut against = None;
    let mut lever = None;
    let mut evidence = None;
    let mut argv = env::args().skip(1);
    while let Some(flag) = argv.next() {
        match flag.as_str() {
            "--help" | "-h" => return Ok(None),
            "--zip" => zip = PathBuf::from(need(&mut argv, "--zip")?),
            "--warmup" => {
                let value = need(&mut argv, "--warmup")?;
                warmup = number(&value, "--warmup")?;
            }
            "--samples" => {
                let value = need(&mut argv, "--samples")?;
                samples = number(&value, "--samples")?;
            }
            "--label" => label = need(&mut argv, "--label")?,
            "--loop" => {
                let value = need(&mut argv, "--loop")?;
                loop_count = number(&value, "--loop")?;
            }
            "--against" => against = Some(PathBuf::from(need(&mut argv, "--against")?)),
            "--lever" => lever = Some(need(&mut argv, "--lever")?),
            "--evidence" => evidence = Some(need(&mut argv, "--evidence")?),
            other => return Err(format!("unknown argument {other} (try --help)")),
        }
    }
    Ok(Some(Args {
        zip,
        warmup,
        samples,
        label,
        loop_count,
        against,
        lever,
        evidence,
    }))
}

fn need(argv: &mut impl Iterator<Item = String>, flag: &str) -> Result<String, String> {
    argv.next()
        .filter(|value| !value.starts_with("--"))
        .ok_or_else(|| format!("{flag} needs a value"))
}

fn number(text: &str, flag: &str) -> Result<u32, String> {
    text.parse::<u32>()
        .map_err(|_| format!("{flag} expects an integer, got {text}"))
}

fn time_read(args: &Args) -> Result<Value, String> {
    if args.samples == 0 {
        return Err("--samples must be at least 1".to_owned());
    }
    if args.against.is_some() && lever_of(args)?.is_none() {
        return Err(
            "--against needs --lever naming the cause. A bare ratio is not a result. \
             Example: --lever \"parse: title bytes stay on the stack instead of a String\""
                .to_owned(),
        );
    }
    let lever = lever_of(args)?;
    let bytes = fs::read(&args.zip).map_err(|err| format!("{}: {err}", args.zip.display()))?;
    let zip_bytes = bytes.len();
    let progress = Progress::new();

    for _ in 0..args.warmup {
        let _ = black_box(once(&bytes, &progress)?);
    }

    let mut walls = Vec::with_capacity(usize_from(args.samples));
    let mut stages = StageBook::new();
    let mut plays = 0_usize;
    for _ in 0..args.samples {
        let (elapsed, history, report) = once(&bytes, &progress)?;
        plays = history.len();
        walls.push(nanos(elapsed)?);
        stages.record(&report);
        black_box(history);
    }

    let read = spread(&walls)?;
    let spans = time_spans(&bytes, &progress, args.samples)?;
    let mut body = json!({
        "schema": 1,
        "label": args.label,
        "optimized": !cfg!(debug_assertions),
        "rustc": rustc_version(),
        "cpu": cpu_model(),
        "zip": args.zip.display().to_string(),
        "zip_bytes": zip_bytes,
        "warmup": args.warmup,
        "samples": args.samples,
        "scope": "read",
        "scope_note": "read::run only. Zip copy, Source::open, and Live setup are outside the clock. Resolve, enrich, and persist are not measured.",
        "plays": plays,
        "read": read,
        "stages": stages.json(),
        "stage_timer": "Live::end stores whole milliseconds. On this archive every step is under 1 ms, so those medians are 0. spans is a second pass and is not the baseline clock.",
        "spans": spans,
    });
    if cfg!(debug_assertions) {
        let _ = writeln!(
            io::stderr(),
            "dev build: opt-level 0. These numbers are not a baseline. Rebuild with --profile profiling."
        );
    } else {
        let _ = writeln!(io::stderr(), "optimized build (debug assertions off)");
    }
    if let Some(path) = &args.against {
        let prior = fs::read_to_string(path).map_err(|err| format!("{}: {err}", path.display()))?;
        let prior: Value = serde_json::from_str(&prior).map_err(|err| format!("against: {err}"))?;
        let phrase = lever.ok_or_else(|| "missing --lever".to_owned())?;
        let comparison = compare(&prior, &read, &phrase, args.evidence.as_deref())?;
        let Some(object) = body.as_object_mut() else {
            return Err("report is not an object".to_owned());
        };
        object.insert("comparison".to_owned(), comparison);
    }
    Ok(body)
}

fn lever_of(args: &Args) -> Result<Option<String>, String> {
    let Some(lever) = args.lever.as_ref() else {
        return Ok(None);
    };
    let phrase = lever.trim();
    if phrase.len() < 20 {
        return Err(
            "--lever must be a full phrase naming the cause, not a ratio. \
             Example: \"parse: title bytes stay on the stack instead of a String\""
                .to_owned(),
        );
    }
    Ok(Some(phrase.to_owned()))
}

fn once(
    bytes: &[u8],
    progress: &Progress,
) -> Result<(std::time::Duration, History, Report), String> {
    let owned = bytes.to_vec();
    let source = Source::open("data_test.zip".to_owned(), owned, Selection::All, u64::MAX)
        .map_err(|err| err.to_string())?;
    let id = Id::generate();
    progress.open(id);
    let mut report = Report::new();
    let mut live = Live::new(id, progress, &mut report);
    let started = Instant::now();
    let history = read::run(source, &mut live).map_err(|err| err.to_string())?;
    let elapsed = started.elapsed();
    Ok((elapsed, history, report))
}

fn time_spans(bytes: &[u8], progress: &Progress, samples: u32) -> Result<Value, String> {
    let recorder = Arc::new(Recorder::default());
    tracing::subscriber::set_global_default(SpanSub(Arc::clone(&recorder)))
        .map_err(|err| format!("tracing subscriber: {err}"))?;
    let mut by_name: HashMap<&'static str, Vec<u64>> = HashMap::new();
    for _ in 0..samples {
        let (_elapsed, history, _report) = once(bytes, progress)?;
        black_box(history);
        for (name, ns) in recorder.take()? {
            by_name.entry(name).or_default().push(ns);
        }
    }
    let mut rows = Vec::new();
    for name in [
        "extract_archive",
        "parse_interactions",
        "normalize_interactions",
    ] {
        let Some(samples_ns) = by_name.remove(name) else {
            continue;
        };
        rows.push(brief(name, &samples_ns)?);
    }
    let mut extra: Vec<&str> = by_name.keys().copied().collect();
    extra.sort_unstable();
    for name in extra {
        let Some(samples_ns) = by_name.remove(name) else {
            continue;
        };
        rows.push(brief(name, &samples_ns)?);
    }
    Ok(json!({
        "note": "Second pass. A tracing subscriber times the spans inside read. Do not compare these medians to read.median_ns.",
        "rows": rows,
    }))
}

fn brief(name: &str, samples: &[u64]) -> Result<Value, String> {
    let mut sorted = samples.to_vec();
    sorted.sort_unstable();
    Ok(json!({
        "name": name,
        "median_ns": median(&sorted).ok_or_else(|| format!("no span samples for {name}"))?,
        "min_ns": sorted.first().copied().ok_or_else(|| format!("no span samples for {name}"))?,
        "p95_ns": percentile(&sorted, 95).ok_or_else(|| format!("no span samples for {name}"))?,
        "max_ns": sorted.last().copied().ok_or_else(|| format!("no span samples for {name}"))?,
    }))
}

#[derive(Default)]
struct Recorder {
    next: AtomicU64,
    open: Mutex<HashMap<u64, OpenSpan>>,
    done: Mutex<Vec<(&'static str, u64)>>,
}

struct OpenSpan {
    name: &'static str,
    entered: Option<Instant>,
    total_ns: u128,
}

impl Recorder {
    fn take(&self) -> Result<Vec<(&'static str, u64)>, String> {
        let mut done = self
            .done
            .lock()
            .map_err(|_| "span recorder lock poisoned".to_owned())?;
        Ok(std::mem::take(&mut *done))
    }
}

struct SpanSub(Arc<Recorder>);

impl Subscriber for SpanSub {
    fn enabled(&self, metadata: &tracing::Metadata<'_>) -> bool {
        metadata.is_span()
    }

    fn new_span(&self, attrs: &Attributes<'_>) -> SpanId {
        let id = self
            .0
            .next
            .fetch_add(1, Ordering::Relaxed)
            .saturating_add(1);
        if let Ok(mut open) = self.0.open.lock() {
            open.insert(
                id,
                OpenSpan {
                    name: attrs.metadata().name(),
                    entered: None,
                    total_ns: 0,
                },
            );
        }
        SpanId::from_u64(id)
    }

    fn record(&self, _span: &SpanId, _values: &Record<'_>) {}

    fn record_follows_from(&self, _span: &SpanId, _follows: &SpanId) {}

    fn event(&self, _event: &Event<'_>) {}

    fn enter(&self, span: &SpanId) {
        let Ok(mut open) = self.0.open.lock() else {
            return;
        };
        if let Some(state) = open.get_mut(&span.into_u64()) {
            state.entered = Some(Instant::now());
        }
    }

    fn exit(&self, span: &SpanId) {
        let Ok(mut open) = self.0.open.lock() else {
            return;
        };
        let Some(state) = open.get_mut(&span.into_u64()) else {
            return;
        };
        let Some(started) = state.entered.take() else {
            return;
        };
        state.total_ns = state.total_ns.saturating_add(started.elapsed().as_nanos());
    }

    fn try_close(&self, id: SpanId) -> bool {
        let Ok(mut open) = self.0.open.lock() else {
            return false;
        };
        let Some(state) = open.remove(&id.into_u64()) else {
            return false;
        };
        drop(open);
        let mut total = state.total_ns;
        if let Some(started) = state.entered {
            total = total.saturating_add(started.elapsed().as_nanos());
        }
        let Ok(ns) = u64::try_from(total) else {
            return true;
        };
        if let Ok(mut done) = self.0.done.lock() {
            done.push((state.name, ns));
        }
        true
    }
}

fn run_loop(args: &Args) -> Result<(), String> {
    let bytes = fs::read(&args.zip).map_err(|err| format!("{}: {err}", args.zip.display()))?;
    let progress = Progress::new();
    let mut plays = 0_usize;
    for _ in 0..args.loop_count {
        let (_elapsed, history, _report) = once(&bytes, &progress)?;
        plays = history.len();
        black_box(history);
    }
    let _ = writeln!(
        io::stderr(),
        "looped read {} times, {} plays kept",
        args.loop_count,
        plays
    );
    Ok(())
}

struct StageBook {
    rows: Vec<StageRow>,
}

struct StageRow {
    stage: Stage,
    ms: Vec<u64>,
    read: u64,
    keep: u64,
    dropped: u64,
    stable: bool,
}

impl StageBook {
    fn new() -> Self {
        Self {
            rows: Stage::ALL
                .into_iter()
                .map(|stage| StageRow {
                    stage,
                    ms: Vec::new(),
                    read: 0,
                    keep: 0,
                    dropped: 0,
                    stable: true,
                })
                .collect(),
        }
    }

    fn record(&mut self, report: &Report) {
        for metric in report.metrics() {
            let Some(row) = self.rows.iter_mut().find(|row| row.stage == metric.stage()) else {
                continue;
            };
            if row.ms.is_empty() {
                row.read = metric.read();
                row.keep = metric.keep();
                row.dropped = metric.dropped();
            } else if row.read != metric.read()
                || row.keep != metric.keep()
                || row.dropped != metric.dropped()
            {
                row.stable = false;
            }
            row.ms.push(metric.ms());
        }
    }

    fn json(&self) -> Value {
        let rows: Vec<Value> = self
            .rows
            .iter()
            .filter(|row| !row.ms.is_empty())
            .map(|row| {
                json!({
                    "id": row.stage.step_id(),
                    "label": row.stage.label(),
                    "unit": "ms",
                    "median_ms": median(&row.ms).unwrap_or(0),
                    "min_ms": row.ms.iter().copied().min().unwrap_or(0),
                    "max_ms": row.ms.iter().copied().max().unwrap_or(0),
                    "read": row.read,
                    "keep": row.keep,
                    "dropped": row.dropped,
                    "counts_stable": row.stable,
                })
            })
            .collect();
        Value::Array(rows)
    }
}

fn spread(samples: &[u64]) -> Result<Value, String> {
    let mut sorted = samples.to_vec();
    sorted.sort_unstable();
    let median_ns = median(&sorted).ok_or_else(|| "no samples".to_owned())?;
    let mean_ns = mean(samples).ok_or_else(|| "no samples".to_owned())?;
    let p95_ns = percentile(&sorted, 95).ok_or_else(|| "no samples".to_owned())?;
    let min_ns = sorted
        .first()
        .copied()
        .ok_or_else(|| "no samples".to_owned())?;
    let max_ns = sorted
        .last()
        .copied()
        .ok_or_else(|| "no samples".to_owned())?;
    Ok(json!({
        "unit": "ns",
        "min_ns": min_ns,
        "median_ns": median_ns,
        "mean_ns": mean_ns,
        "p95_ns": p95_ns,
        "max_ns": max_ns,
        "samples_ns": samples,
    }))
}

fn compare(
    prior: &Value,
    read: &Value,
    lever: &str,
    evidence: Option<&str>,
) -> Result<Value, String> {
    let baseline = prior
        .pointer("/read/median_ns")
        .and_then(Value::as_u64)
        .ok_or_else(|| "against file has no read.median_ns".to_owned())?;
    let current = read
        .get("median_ns")
        .and_then(Value::as_u64)
        .ok_or_else(|| "current run has no median".to_owned())?;
    if baseline == 0 || current == 0 {
        return Err("cannot compare a zero median".to_owned());
    }
    let time_ratio_millis = ratio_millis(current, baseline)?;
    let speedup_millis = ratio_millis(baseline, current)?;
    Ok(json!({
        "baseline_median_ns": baseline,
        "current_median_ns": current,
        "time_ratio_millis": time_ratio_millis,
        "speedup_millis": speedup_millis,
        "lever": lever,
        "evidence": evidence.unwrap_or("wall clock only; no profile attached"),
        "rule": "1000 milli-units means unchanged. speedup_millis is 1000 * baseline / current (10000 = ten times faster). The number is not the explanation: lever says what moved, evidence names the profile that shows it.",
    }))
}

fn ratio_millis(numerator: u64, denominator: u64) -> Result<u64, String> {
    let scaled = u128::from(numerator)
        .checked_mul(1000)
        .ok_or_else(|| "ratio overflow".to_owned())?;
    u64::try_from(scaled / u128::from(denominator)).map_err(|_| "ratio does not fit u64".to_owned())
}

fn summarize(report: &Value) {
    let Some(median_ns) = report.pointer("/read/median_ns").and_then(Value::as_u64) else {
        return;
    };
    let p95 = report
        .pointer("/read/p95_ns")
        .and_then(Value::as_u64)
        .unwrap_or(0);
    let plays = report.get("plays").and_then(Value::as_u64).unwrap_or(0);
    let _ = writeln!(
        io::stderr(),
        "read median {} ms, p95 {} ms, {} plays kept",
        ms(median_ns),
        ms(p95),
        plays
    );
    let Some(stages) = report.get("stages").and_then(Value::as_array) else {
        return;
    };
    for stage in stages {
        let id = stage.get("id").and_then(Value::as_str).unwrap_or("?");
        let stage_ms = stage.get("median_ms").and_then(Value::as_u64).unwrap_or(0);
        let keep = stage.get("keep").and_then(Value::as_u64).unwrap_or(0);
        let dropped = stage.get("dropped").and_then(Value::as_u64).unwrap_or(0);
        let _ = writeln!(
            io::stderr(),
            "  {id}: median {stage_ms} ms (timer resolution 1 ms), keep {keep}, dropped {dropped}"
        );
    }
    let Some(rows) = report.pointer("/spans/rows").and_then(Value::as_array) else {
        return;
    };
    for row in rows {
        let name = row.get("name").and_then(Value::as_str).unwrap_or("?");
        let span_ns = row.get("median_ns").and_then(Value::as_u64).unwrap_or(0);
        let _ = writeln!(io::stderr(), "  span {name}: median {} ms", ms(span_ns));
    }
}

fn ms(ns: u64) -> String {
    let whole = ns / 1_000_000;
    let frac = (ns % 1_000_000) / 10_000;
    format!("{whole}.{frac:02}")
}

fn nanos(elapsed: std::time::Duration) -> Result<u64, String> {
    u64::try_from(elapsed.as_nanos()).map_err(|_| "elapsed time does not fit u64".to_owned())
}

fn usize_from(value: u32) -> usize {
    usize::try_from(value).unwrap_or(0)
}

fn median(samples: &[u64]) -> Option<u64> {
    let mut sorted = samples.to_vec();
    sorted.sort_unstable();
    let len = sorted.len();
    if len == 0 {
        return None;
    }
    if len % 2 == 1 {
        return sorted.get(len / 2).copied();
    }
    let left = u128::from(sorted.get(len / 2 - 1).copied()?);
    let right = u128::from(sorted.get(len / 2).copied()?);
    u64::try_from(u128::midpoint(left, right)).ok()
}

fn mean(samples: &[u64]) -> Option<u64> {
    if samples.is_empty() {
        return None;
    }
    let sum = samples
        .iter()
        .fold(0_u128, |acc, sample| acc + u128::from(*sample));
    let len = u128::try_from(samples.len()).ok()?;
    u64::try_from(sum / len).ok()
}

fn percentile(sorted: &[u64], pct: u64) -> Option<u64> {
    let len = u64::try_from(sorted.len()).ok()?;
    if len == 0 || pct > 100 {
        return None;
    }
    let rank = pct.saturating_mul(len).div_ceil(100).saturating_sub(1);
    let index = usize::try_from(rank).ok()?;
    sorted.get(index).copied()
}

fn rustc_version() -> String {
    let Ok(output) = Command::new("rustc").arg("--version").output() else {
        return "unknown".to_owned();
    };
    String::from_utf8(output.stdout)
        .map_or_else(|_| "unknown".to_owned(), |text| text.trim().to_owned())
}

fn cpu_model() -> String {
    let Ok(text) = fs::read_to_string("/proc/cpuinfo") else {
        return "unknown".to_owned();
    };
    for line in text.lines() {
        let Some(rest) = line.strip_prefix("model name") else {
            continue;
        };
        let Some((_name, value)) = rest.split_once(':') else {
            continue;
        };
        return value.trim().to_owned();
    }
    "unknown".to_owned()
}

#[cfg(test)]
mod tests {
    use super::{mean, median, percentile};

    #[test]
    fn median_of_an_odd_count_is_the_middle() {
        assert_eq!(median(&[1, 4, 9]), Some(4));
    }

    #[test]
    fn median_of_an_even_count_averages_the_middle_pair() {
        assert_eq!(median(&[4, 1, 3, 2]), Some(2));
    }

    #[test]
    fn percentile_uses_nearest_rank() {
        let sorted = [10_u64, 20, 30, 40, 50];
        assert_eq!(percentile(&sorted, 95), Some(50));
        assert_eq!(percentile(&sorted, 0), Some(10));
    }

    #[test]
    fn mean_truncates_the_remainder() {
        assert_eq!(mean(&[1, 2]), Some(1));
    }
}
