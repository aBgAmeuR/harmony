#!/usr/bin/env bash
# Wall-clock baseline for pipeline::read. Stdout of `measure` is timings.json.
# Rebuild with the profiling profile so the number matches later samply / heaptrack / cachegrind runs.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

profile="${PROFILE:-profiling}"
zip="${ZIP:-crates/pipeline/benches/data_test.zip}"
out="${OUT:-perf/runs/000-baseline}"
warmup="${WARMUP:-3}"
samples="${SAMPLES:-30}"
label="${LABEL:-baseline}"

mkdir -p "$out"
cargo build --profile "$profile" -p pipeline --bin measure
target_dir="${CARGO_TARGET_DIR:-$root/target}"
bin="${target_dir}/${profile}/measure"

"$bin" \
  --zip "$zip" \
  --warmup "$warmup" \
  --samples "$samples" \
  --label "$label" \
  >"$out/timings.json"

echo "wrote $out/timings.json" >&2
