#!/usr/bin/env bash
# Execution profiles of the same binary `time.sh` clocks.
# samply: CPU samples. heaptrack: heap allocations. valgrind cachegrind: cache misses.
# `--loop` repeats `read` so a short archive still shows up in the profile.
# The loop also copies the zip each iteration. That copy is outside the wall clock in timings.json.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

profile="${PROFILE:-profiling}"
zip="${ZIP:-crates/pipeline/benches/data_test.zip}"
out="${OUT:-perf/runs/000-baseline/profiles}"
cpu_loops="${CPU_LOOPS:-400}"
heap_loops="${HEAP_LOOPS:-40}"
cache_loops="${CACHE_LOOPS:-8}"

mkdir -p "$out"
cargo build --profile "$profile" -p pipeline --bin measure
target_dir="${CARGO_TARGET_DIR:-$root/target}"
bin="${target_dir}/${profile}/measure"
notes="$out/notes.txt"
: >"$notes"

run_cpu() {
  if ! command -v samply >/dev/null 2>&1; then
    echo "samply: not installed" | tee -a "$notes"
    return 0
  fi
  local paranoid="unknown"
  if [[ -r /proc/sys/kernel/perf_event_paranoid ]]; then
    paranoid="$(cat /proc/sys/kernel/perf_event_paranoid)"
  fi
  if [[ "$paranoid" =~ ^-?[0-9]+$ ]] && ((paranoid > 1)); then
    echo "samply: skipped. perf_event_paranoid is ${paranoid}; a non-root user needs 1 or lower." | tee -a "$notes"
    echo "samply: echo 1 | sudo tee /proc/sys/kernel/perf_event_paranoid" | tee -a "$notes"
    echo "samply: that lasts until reboot. Then rerun ./perf/profile.sh cpu" | tee -a "$notes"
    return 0
  fi
  echo "samply: recording ${cpu_loops} iterations" | tee -a "$notes"
  if samply record --no-open -o "$out/samply.json.gz" -- \
    "$bin" --zip "$zip" --loop "$cpu_loops"; then
    echo "samply: $out/samply.json.gz" | tee -a "$notes"
  else
    echo "samply: record failed. Heap and cache still run." | tee -a "$notes"
  fi
}

run_heap() {
  if ! command -v heaptrack >/dev/null 2>&1; then
    echo "heaptrack: not installed" | tee -a "$notes"
    return 0
  fi
  echo "heaptrack: recording ${heap_loops} iterations" | tee -a "$notes"
  # -r skips heaptrack_gui, which aborts when there is no display.
  # The raw capture is interpreted below into a file heaptrack_print can read.
  if ! heaptrack -r -o "$out/heaptrack" "$bin" --zip "$zip" --loop "$heap_loops"; then
    echo "heaptrack: record failed. Cache still runs." | tee -a "$notes"
    return 0
  fi
  local interpreter="/usr/lib/heaptrack/libexec/heaptrack_interpret"
  if [[ ! -x "$interpreter" ]]; then
    echo "heaptrack: raw capture kept, interpreter missing at $interpreter" | tee -a "$notes"
    return 0
  fi
  zstd -dc "$out/heaptrack.raw.zst" | "$interpreter" | zstd -c >"$out/heaptrack.zst"
  echo "heaptrack: $out/heaptrack.zst" | tee -a "$notes"
  if command -v heaptrack_print >/dev/null 2>&1; then
    heaptrack_print -f "$out/heaptrack.zst" --print-allocators=0 --print-temporary=0 -n 8 \
      >"$out/heap-peaks.txt" || true
    echo "heaptrack: $out/heap-peaks.txt" | tee -a "$notes"
  fi
}

run_cache() {
  if ! command -v valgrind >/dev/null 2>&1; then
    echo "valgrind: not installed" | tee -a "$notes"
    return 0
  fi
  echo "cachegrind: recording ${cache_loops} iterations" | tee -a "$notes"
  if ! valgrind --tool=cachegrind --cachegrind-out-file="$out/cachegrind.out" \
    "$bin" --zip "$zip" --loop "$cache_loops"; then
    echo "cachegrind: record failed" | tee -a "$notes"
    return 0
  fi
  if command -v cg_annotate >/dev/null 2>&1; then
    cg_annotate --auto=yes --show-percs=no "$out/cachegrind.out" >"$out/cachegrind.txt" || true
    echo "cachegrind: $out/cachegrind.txt" | tee -a "$notes"
  else
    echo "cachegrind: $out/cachegrind.out" | tee -a "$notes"
  fi
}

case "${1:-all}" in
  cpu) run_cpu ;;
  heap) run_heap ;;
  cache) run_cache ;;
  all)
    run_cpu
    run_heap
    run_cache
    ;;
  *)
    echo "usage: profile.sh [cpu|heap|cache|all]" >&2
    exit 1
    ;;
esac
