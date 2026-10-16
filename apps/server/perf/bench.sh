#!/usr/bin/env bash
# Benchmark of pipeline::read, every version in one session.
#
#   ./perf/bench.sh                  # all steps
#   ./perf/bench.sh time summary     # some steps
#   VERSIONS="v0:4d23458 v8:cd4b5d0" ./perf/bench.sh
#
# Steps: env build check time hyperfine heap cache scale summary
# Each version is a commit. It is rebuilt from `git archive`, so the work tree does not matter.
# Output: target/bench/results/ (SUMMARY.md is the report table).
#
# Needs: cargo, python3, hyperfine, heaptrack, valgrind, taskset.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
repo="$(git -C "$root" rev-parse --show-toplevel)"
cd "$root"

read -r -a versions <<<"${VERSIONS:-v0:4d23458 v1:89fd4df v2:e768c8b v3:9af983b v4:80f3afb v5:f8e5884 v6:a6497ac v7:2852603 v8:cd4b5d0}"
bench="$root/target/bench"
out="$bench/results"
small="$root/crates/pipeline/benches/data_test.zip"
big="$bench/big.zip"
export CARGO_TARGET_DIR="$bench/cargo"

label() { echo "${1%%:*}"; }
commit() { echo "${1#*:}"; }
bin() { echo "$bench/bin/$1"; }
say() { printf '\n== %s\n' "$*" >&2; }

# A clock starts only once the 1-minute load average is under 0.3 (builds just ran).
quiet() {
  for _ in $(seq 60); do
    awk -v l="$(cut -d' ' -f1 /proc/loadavg)" 'BEGIN { exit !(l > 0.3) }' || return 0
    sleep 5
  done
  echo "load still above 0.3, measuring anyway" >&2
}

step_env() {
  say env
  mkdir -p "$out"
  {
    echo "date: $(date -Iseconds)"
    grep PRETTY_NAME /etc/os-release
    echo "kernel: $(uname -r)"
    echo "rustc: $(rustc --version)"
    echo "hyperfine: $(hyperfine --version)"
    echo "load: $(cat /proc/loadavg)"
    lscpu | grep -E 'Model name|^CPU\(s\)|Thread|Core|L1d|L2|L3'
    echo "simd: $(grep -o -w -E 'avx2|avx512f|pclmulqdq|sse4_2' /proc/cpuinfo | sort -u | tr '\n' ' ')"
  } >"$out/env.txt"
  cat "$out/env.txt" >&2
  if awk -v l="$(cut -d' ' -f1 /proc/loadavg)" 'BEGIN { exit !(l > 0.5) }' && [[ -z "${FORCE:-}" ]]; then
    echo "load average above 0.5: stop other jobs, or FORCE=1" >&2
    exit 1
  fi
}

# Big archive: 10 files of 16 000 plays, built from the small one. Same input, same bytes.
# Copy k of the plays appends " k" to the title, so 70 % of titles stay distinct, as in the real file.
fixture() {
  [[ -f "$big" ]] && return 0
  mkdir -p "$bench"
  python3 - "$small" "$big" <<'PY'
import json, sys, zipfile
source, target = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(source) as archive:
    names = archive.namelist()
    audio = next(name for name in names if "Streaming_History_Audio_" in name)
    plays = json.loads(archive.read(audio))
    others = [(n, archive.read(n)) for n in names if n != audio and not n.endswith("/")]
folder = audio.rsplit("/", 1)[0]
with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as zip_out:
    copy = 0
    for index in range(10):
        batch = []
        for _ in range(20):
            for play in plays:
                item = dict(play)
                if copy and item.get("master_metadata_track_name") is not None:
                    item["master_metadata_track_name"] += f" {copy}"
                batch.append(item)
            copy += 1
        name = f"{folder}/Streaming_History_Audio_{2015 + index}_{index}.json"
        body = json.dumps(batch, indent=2, ensure_ascii=False).encode()
        zip_out.writestr(zipfile.ZipInfo(name, (2025, 1, 1, 0, 0, 0)), body, zipfile.ZIP_DEFLATED)
    for name, body in others:
        zip_out.writestr(zipfile.ZipInfo(name, (2025, 1, 1, 0, 0, 0)), body, zipfile.ZIP_DEFLATED)
PY
}

step_build() {
  say build
  mkdir -p "$bench/bin" "$bench/src"
  for version in "${versions[@]}"; do
    local name src
    name="$(label "$version")"
    src="$bench/src/$name"
    rm -rf "$src" && mkdir -p "$src"
    # -m: files get the extraction time, not the commit time. With a shared target dir,
    # Cargo would otherwise take old sources for fresh and skip the build.
    git -C "$repo" archive "$(commit "$version")" apps/server | tar -x -m -C "$src"
    (cd "$src/apps/server" && cargo build --quiet --profile profiling -p pipeline --bin measure)
    cp "$CARGO_TARGET_DIR/profiling/measure" "$(bin "$name")"
    echo "$name built from $(commit "$version")" >&2
  done
}

# Same output on every version: 732 plays kept on the small archive, 146 400 on the big one.
step_check() {
  say check
  fixture
  mkdir -p "$out"
  : >"$out/check.txt"
  for version in "${versions[@]}"; do
    local name kept_small kept_big
    name="$(label "$version")"
    kept_small="$("$(bin "$name")" --zip "$small" --loop 1 2>&1 | grep -o '[0-9]* plays kept')"
    kept_big="$("$(bin "$name")" --zip "$big" --loop 1 2>&1 | grep -o '[0-9]* plays kept')"
    echo "$name: small $kept_small, big $kept_big" | tee -a "$out/check.txt" >&2
    [[ "$kept_small" == "732 plays kept" && "$kept_big" == "146400 plays kept" ]] || {
      echo "$name changed the output" >&2
      exit 1
    }
  done
}

# Clock of read::run only (archive copy outside), versions one after another.
step_time() {
  say time
  fixture
  quiet
  mkdir -p "$out/time"
  for version in "${versions[@]}"; do
    local name
    name="$(label "$version")"
    "$(bin "$name")" --zip "$small" --warmup 5 --samples 50 --label "$name" >"$out/time/$name-small.json" 2>/dev/null
    "$(bin "$name")" --zip "$big" --warmup 2 --samples 15 --label "$name" >"$out/time/$name-big.json" 2>/dev/null
    echo "$name timed" >&2
  done
}

# Whole process. -N: no shell between hyperfine and the binary.
step_hyperfine() {
  say hyperfine
  fixture
  quiet
  mkdir -p "$out/hyperfine"
  local small_runs=() big_runs=()
  for version in "${versions[@]}"; do
    local name
    name="$(label "$version")"
    small_runs+=(--command-name "$name" "$(bin "$name") --zip $small --loop 20")
    big_runs+=(--command-name "$name" "$(bin "$name") --zip $big --loop 1")
  done
  hyperfine -N --warmup 3 --runs 30 --style basic --export-json "$out/hyperfine/small.json" "${small_runs[@]}"
  hyperfine -N --warmup 2 --runs 30 --style basic --export-json "$out/hyperfine/big.json" "${big_runs[@]}"
}

# Allocations are deterministic. Per call = (11 loops - 1 loop) / 10: setup and regex compilation cancel out.
step_heap() {
  say heap
  fixture
  mkdir -p "$out/heap" "$bench/heap"
  for version in "${versions[@]}"; do
    local name
    name="$(label "$version")"
    for run in "small 1" "small 11" "big 1"; do
      read -r archive loops <<<"$run"
      local zip="$small" raw="$bench/heap/$name-$archive-$loops"
      [[ "$archive" == big ]] && zip="$big"
      heaptrack -r -o "$raw" "$(bin "$name")" --zip "$zip" --loop "$loops" >/dev/null 2>&1 </dev/null
      zstd -q -dc "$raw.raw.zst" | /usr/lib/heaptrack/libexec/heaptrack_interpret | zstd -q -c >"$raw.zst"
      heaptrack_print -f "$raw.zst" --print-peaks=0 --print-allocators=0 --print-temporary=0 --print-leaks=0 2>/dev/null |
        grep -E 'calls to allocation|temporary memory|peak heap' >"$out/heap/$name-$archive-$loops.txt"
    done
    echo "$name heap done" >&2
  done
}

# Instructions and cache misses are deterministic. Per call = (9 loops - 1 loop) / 8.
step_cache() {
  say cache
  mkdir -p "$out/cache" "$bench/cache"
  for version in "${versions[@]}"; do
    local name
    name="$(label "$version")"
    for loops in 1 9; do
      valgrind --tool=cachegrind --cache-sim=yes --cachegrind-out-file="$bench/cache/$name-$loops.out" \
        "$(bin "$name")" --zip "$small" --loop "$loops" >/dev/null 2>"$out/cache/$name-$loops.txt"
    done
    echo "$name cache done" >&2
  done
}

# Last version on the big archive, 1 to N CPUs. available_parallelism follows the taskset mask.
step_scale() {
  say scale
  fixture
  quiet
  mkdir -p "$out/scale"
  local name
  name="$(label "${versions[-1]}")"
  for ((cpus = 1; cpus <= $(nproc); cpus++)); do
    taskset -c "0-$((cpus - 1))" "$(bin "$name")" --zip "$big" --warmup 2 --samples 15 \
      --label "$name-$cpus" >"$out/scale/$cpus.json" 2>/dev/null
    echo "$cpus cpus done" >&2
  done
}

step_summary() {
  say summary
  python3 - "$out" "${versions[@]}" <<'PY' | tee "$out/SUMMARY.md"
import json, math, re, statistics, sys
from pathlib import Path

out, labels = Path(sys.argv[1]), [v.split(":")[0] for v in sys.argv[2:]]

def num(x, d=3):
    return f"{x:,.{d}f}".replace(",", " ").replace(".", ",")

def stats(values):
    values = sorted(values)
    mean = statistics.fmean(values)
    sd = statistics.stdev(values) if len(values) > 1 else 0.0
    return dict(n=len(values), median=statistics.median(values), mean=mean, sd=sd, var=sd * sd,
                cv=100 * sd / mean, min=values[0], p95=values[max(0, math.ceil(0.95 * len(values)) - 1)],
                max=values[-1])

def clock(archive, unit):
    rows, base = [], None
    for name in labels:
        path = out / "time" / f"{name}-{archive}.json"
        if not path.exists():
            continue
        s = stats([ns / 1e6 for ns in json.loads(path.read_text())["read"]["samples_ns"]])
        base = base or s["median"]
        rows.append(f"| {name} | {s['n']} | {num(s['median'], unit)} | {num(s['mean'], unit)} | {num(s['sd'], unit)} | "
                    f"{num(s['var'], unit + 2)} | {num(s['cv'], 1)} % | {num(s['min'], unit)} | {num(s['p95'], unit)} | "
                    f"{num(s['max'], unit)} | ×{num(base / s['median'], 2)} |")
    if rows:
        print(f"\n## read::run, {archive} archive (ms)\n")
        print("| Version | n | Median | Mean | Std dev | Variance | CV | Min | p95 | Max | vs first |")
        print("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |")
        print("\n".join(rows))

def hyperfine(archive):
    path = out / "hyperfine" / f"{archive}.json"
    if not path.exists():
        return
    print(f"\n## hyperfine, {archive} archive (ms, whole process)\n")
    print("| Version | Runs | Median | Mean | Std dev | Variance | Min | Max | vs first |")
    print("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |")
    base = None
    for result in json.loads(path.read_text())["results"]:
        s = stats([t * 1e3 for t in result["times"]])
        base = base or s["median"]
        print(f"| {result['command']} | {s['n']} | {num(s['median'], 2)} | {num(s['mean'], 2)} | {num(s['sd'], 2)} | "
              f"{num(s['var'], 2)} | {num(s['min'], 2)} | {num(s['max'], 2)} | ×{num(base / s['median'], 2)} |")

def heap_value(path, pattern):
    match = re.search(pattern, path.read_text()) if path.exists() else None
    return match.group(1) if match else None

def heap():
    rows = []
    for name in labels:
        one = heap_value(out / "heap" / f"{name}-small-1.txt", r"calls to allocation functions: (\d+)")
        eleven = heap_value(out / "heap" / f"{name}-small-11.txt", r"calls to allocation functions: (\d+)")
        big = heap_value(out / "heap" / f"{name}-big-1.txt", r"calls to allocation functions: (\d+)")
        peak = heap_value(out / "heap" / f"{name}-big-1.txt", r"peak heap memory consumption: (\S+)")
        if one and eleven:
            rows.append(f"| {name} | {(int(eleven) - int(one)) // 10:,} | {int(big or 0):,} | {peak} |".replace(",", " "))
    if rows:
        print("\n## Allocations (Heaptrack, deterministic)\n")
        print("| Version | Allocations / call, small | Allocations, big | Peak heap, big |")
        print("| --- | ---: | ---: | ---: |")
        print("\n".join(rows))

def cache():
    rows = []
    for name in labels:
        counts = {}
        for loops in (1, 9):
            path = out / "cache" / f"{name}-{loops}.txt"
            if not path.exists():
                break
            text = path.read_text()
            for key, pattern in (("ir", r"I\s+refs:\s+([\d,]+)"), ("d1", r"D1\s+misses:\s+([\d,]+)"),
                                 ("lld", r"LLd misses:\s+([\d,]+)")):
                match = re.search(pattern, text)
                counts[(key, loops)] = int(match.group(1).replace(",", "")) if match else 0
        if len(counts) == 6:
            per = {key: (counts[(key, 9)] - counts[(key, 1)]) // 8 for key in ("ir", "d1", "lld")}
            rows.append(f"| {name} | {per['ir']:,} | {per['d1']:,} | {per['lld']:,} |".replace(",", " "))
    if rows:
        print("\n## Instructions and cache (Cachegrind, deterministic, per call)\n")
        print("| Version | Instructions | L1d misses | LLd misses |")
        print("| --- | ---: | ---: | ---: |")
        print("\n".join(rows))

def scale():
    files = sorted((out / "scale").glob("*.json"), key=lambda p: int(p.stem)) if (out / "scale").exists() else []
    if not files:
        return
    print("\n## Scalability, big archive (10 files)\n")
    print("| CPUs | Median (ms) | Speedup | Ideal | Efficiency |")
    print("| ---: | ---: | ---: | ---: | ---: |")
    base = None
    for path in files:
        cpus = int(path.stem)
        median = statistics.median(ns / 1e6 for ns in json.loads(path.read_text())["read"]["samples_ns"])
        base = base or median
        ideal = 10 / math.ceil(10 / cpus)
        print(f"| {cpus} | {num(median, 1)} | ×{num(base / median, 2)} | ×{num(ideal, 2)} | {num(100 * base / median / cpus, 0)} % |")

print("# Benchmark of pipeline::read")
env = out / "env.txt"
if env.exists():
    print("\n```text\n" + env.read_text().strip() + "\n```")
clock("small", 3)
clock("big", 1)
hyperfine("small")
hyperfine("big")
heap()
cache()
scale()
PY
}

steps=("$@")
((${#steps[@]})) || steps=(env build check time hyperfine heap cache scale summary)
for step in "${steps[@]}"; do
  "step_$step"
done
