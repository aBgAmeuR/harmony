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
