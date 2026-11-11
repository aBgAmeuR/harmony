import type { PlatformPoint, StyleMetric } from "@/widgets/listening/api";

// The demo package's 2026 plays, as `listeningStyleFn` and `platformsFn` return them.
export const STYLE: StyleMetric[] = [
  { key: "finished", label: "Finished", value: 0.875 },
  { key: "skipped", label: "Skipped", value: 0.0905 },
  { key: "shuffle", label: "Shuffle", value: 0.1934 },
  { key: "offline", label: "Offline", value: 0.1166 },
];

export const PLATFORMS: PlatformPoint[] = [
  { label: "iOS", value: 12375 },
  { label: "Windows", value: 11854 },
];
