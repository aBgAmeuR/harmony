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
