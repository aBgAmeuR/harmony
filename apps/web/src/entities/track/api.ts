import { aggregate, series, totals, unitFor } from "@/data/aggregate";
import { listFn } from "@/data/bases";
import { itemFn } from "@/data/items";
import { streakFn } from "@/data/streak";
import { behaviorFn, vsAverageFn } from "@/data/track";
import { rangeDays, type Range } from "@/shared/lib/date";
import { platformLabel, toDate } from "@/shared/lib/format";
import { query } from "@/shared/lib/query";

type TrackRange = { trackId: number; range: Range };

const ofTrack = ({ trackId, range }: TrackRange) => ({
  ...range,
  rules: [{ field: "track", op: "is", value: trackId }] as const,
});

const overviewFn = (args: TrackRange) =>
  totals(ofTrack(args), ["streams", "playtime", "completion", "skipRate"]);

const historyFn = async (args: TrackRange) => {
  const filter = ofTrack(args);
  const [streak, bounds, item] = await Promise.all([
    streakFn(filter),
    totals(filter, ["firstPlayed", "lastPlayed"]),
    itemFn({ kind: "track", id: args.trackId }),
  ]);
  return {
    longestStreakDays: streak.longestDays,
    longestStreakStart: streak.longestStart,
    firstPlayed: bounds.firstPlayed,
    lastPlayed: bounds.lastPlayed,
    firstPlayedOnRelease:
      bounds.firstPlayed !== null && bounds.firstPlayed.slice(0, 10) === item?.releaseDate,
  };
};

export type ChartPoint = { name: string; value: number };

export type DayPart = {
  key: "morning" | "afternoon" | "evening" | "night";
  label: string;
  share: number;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const DAY_PARTS = [
  { key: "morning", label: "Morning", from: 5, to: 12 },
  { key: "afternoon", label: "Afternoon", from: 12, to: 17 },
  { key: "evening", label: "Evening", from: 17, to: 21 },
] as const;

const dayPartOf = (hour: number) =>
  DAY_PARTS.find((part) => hour >= part.from && hour < part.to)?.key ?? "night";

// Minutes per bucket of the period, plays per weekday and per part of the day, in local time.
const listeningFn = async (args: TrackRange) => {
  const filter = ofTrack(args);
  const unit = unitFor(rangeDays(args.range));
  const [trend, hours] = await Promise.all([
    series(filter, ["playtime"], unit),
    aggregate({ by: "hour", measures: ["streams"], filter }),
  ]);

  const weekly = WEEKDAYS.map((name) => ({ name, value: 0 }));
  const parts = new Map<DayPart["key"], number>();
  let total = 0;
  for (const row of hours) {
    const date = new Date(row.key * 1000);
    const day = weekly[(date.getDay() + 6) % 7];
    if (day) day.value += row.streams;
    const part = dayPartOf(date.getHours());
    parts.set(part, (parts.get(part) ?? 0) + row.streams);
    total += row.streams;
  }

  const label = (start: string) =>
    toDate(start).toLocaleDateString(
      "en-US",
      unit === "month" ? { month: "short", year: "numeric" } : { day: "2-digit", month: "short" },
    );

  return {
    monthly: trend.points.map((point) => ({
      name: label(point.key),
      value: Math.round(point.playtime),
    })),
    weekly,
    dayParts: [...DAY_PARTS, { key: "night", label: "Night" } as const].map(
      ({ key, label: name }) => ({
        key,
        label: name,
        share: total > 0 ? (parts.get(key) ?? 0) / total : 0,
      }),
    ),
  };
};

const devicesFn = async (args: TrackRange) => {
  const rows = await aggregate<"streams", string>({
    by: "platform",
    measures: ["streams"],
    filter: ofTrack(args),
  });
  const total = rows.reduce((sum, row) => sum + row.streams, 0);
  if (total === 0) return [];
  const shares = rows
    .sort((a, b) => b.streams - a.streams || a.key.localeCompare(b.key))
    .map((row) => ({ label: platformLabel(row.key), share: row.streams / total }));
  if (shares.length <= 2) return shares;
  const rest = shares.slice(2).reduce((sum, device) => sum + device.share, 0);
  return [...shares.slice(0, 2), { label: "Others", share: rest }];
};

export type Interaction = {
  timestamp: string;
  platform: string;
  msPlayed: number;
  shuffle: boolean;
  skipped: boolean;
  offline: boolean;
};

const interactionsFn = async (args: TrackRange) => {
  const { rows } = await listFn({
    base: "plays",
    filter: ofTrack(args),
    sort: "played",
    desc: true,
    limit: 100_000,
  });
  return rows.map((row) => ({
    timestamp: String(row.played),
    platform: String(row.platform ?? "other"),
    msPlayed: Math.round(Number(row.playtime) * 60000),
    shuffle: row.shuffle === true,
    skipped: row.skipped === true,
    offline: row.offline === true,
  }));
};

export const trackQueries = {
  get: query("track", (trackId: number) => itemFn({ kind: "track", id: trackId })),
  overview: query("track-overview", overviewFn),
  history: query("track-history", historyFn),
  listening: query("track-listening", listeningFn),
  behavior: query("track-behavior", behaviorFn),
  vsAverage: query("track-vs-average", vsAverageFn),
  devices: query("track-devices", devicesFn),
  interactions: query("track-interactions", interactionsFn),
};
