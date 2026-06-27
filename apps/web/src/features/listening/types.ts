import type { HeatmapColumn } from "@harmony/charts";

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

export type MonthlyActivityPoint = {
  name: string;
  value: number;
};

export type DayOfWeekRow = {
  day_index: number;
  value: number;
};

export type DaysOfWeekChartData = {
  metrics: { key: string; label: string }[];
  data: { label: string; values: Record<string, number> }[];
};

export type PeakHourPoint = {
  name: string;
  value: number;
};

export type PlatformPoint = {
  label: string;
  value: number;
};

export type ListeningStyleMetric = {
  label: string;
  value: number;
};

export type TrackEngagementStage = {
  label: string;
  value: number;
};

export type WhenYouListenByYear = Record<number, HeatmapColumn[]>;

export type ReleaseYearPoint = {
  name: string;
  value: number;
};

export type GenreSegment = {
  key: string;
  label: string;
  value: number;
  percentage: number;
};
