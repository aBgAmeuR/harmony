export const HOUR_RUNGS = [10, 50, 100, 250, 500, 1000, 2500, 5000, 7000, 10_000] as const;
export const STREAM_RUNGS = [100, 1000, 5000, 10_000, 25_000, 50_000, 100_000] as const;
export const ARTIST_RUNGS = [50, 100, 250, 500, 1000, 2500, 5000] as const;
export const TRACK_RUNGS = [100, 500, 1000, 5000, 10_000] as const;

export type NextMilestone = {
  id: "hours" | "streams" | "artists" | "tracks";
  label: string;
  current: number;
  target: number;
  remaining: number;
  percent: number;
  reached: boolean;
};

export type ListeningStreak = {
  currentDays: number;
  longestDays: number;
  longestStart: string | null;
  longestEnd: string | null;
};

export type ListeningSessions = {
  sessions: number;
  avgMinutes: number;
  longestMinutes: number;
  longestStart: string | null;
};

export type TimelineEvent = {
  id: string;
  date: string;
  label: string;
  entity: string;
  subtitle: string;
  image: string | null;
};

export type Discovery = {
  id: number;
  date: string;
  name: string;
  image: string | null;
  laterRank: number;
};

export type MilestoneSummary = {
  listeningDays: number;
  streams: number;
  rangeStart: string | null;
  firstTrack: string | null;
  firstArtists: string | null;
};
