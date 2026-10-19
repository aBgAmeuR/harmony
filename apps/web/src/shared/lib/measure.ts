import type { Kind } from "@/utils/format";

// The quantities the app measures, with one label and one format each.
export const measure = {
  playtime: { label: "Time listened", kind: "minutes" },
  streams: { label: "Streams", kind: "count" },
  artists: { label: "Artists", kind: "count" },
  tracks: { label: "Tracks played", kind: "count" },
  days: { label: "Active days", kind: "count" },
  skipRate: { label: "Skip rate", kind: "percent" },
  completion: { label: "Avg completion", kind: "percent" },
} as const satisfies Record<string, { label: string; kind: Kind }>;
