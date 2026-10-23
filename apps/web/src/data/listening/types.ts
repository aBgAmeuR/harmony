export type ListeningHabitTrendPoint = {
  date: Date;
  value: number;
};

export type ListeningHabitMetric = {
  value: number;
  trend: ListeningHabitTrendPoint[];
};

export type ListeningHabitTrendRow = {
  month: string | Date;
  value: number;
};

export type ListeningHabitValueRow = {
  value: number | null;
};

export type OverTimeUnit = "day" | "week" | "month";

// Minutes listened in one bucket, which starts on `start` (YYYY-MM-DD).
export type OverTimePoint = {
  start: string;
  value: number;
};

export type OverTime = {
  unit: OverTimeUnit;
  points: OverTimePoint[];
  // Day of the newest play in the package (YYYY-MM-DD), null when it is empty.
  last: string | null;
};

// Minutes listened in local time: by weekday, Monday first, and by hour, midnight first.
export type Rhythm = {
  // grid[day][hour]
  grid: number[][];
  days: number[];
  hours: number[];
};

export type PlatformPoint = {
  label: string;
  value: number;
};

export type ListeningStyleMetric = {
  key: "finished" | "skipped" | "shuffle" | "offline";
  label: string;
  // Share of the plays, between 0 and 1.
  value: number;
};

export type TrackEngagementStage = {
  label: string;
  value: number;
};

export type ReleaseYearPoint = {
  name: string;
  value: number;
  // The most played album released that year.
  album: string | null;
};

export type GenreSegment = {
  key: string;
  label: string;
  value: number;
  // Share of the plays that have a genre, between 0 and 1.
  share: number;
};
