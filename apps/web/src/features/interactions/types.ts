export type MonthlyListen = {
  label: string;
  value: number;
};

export type Interaction = {
  timestamp: string;
  platform: "web_player" | "android" | "ios" | "linux" | "windows" | "not_applicable" | "other";
  msPlayed: number;
  shuffle: boolean;
  skipped: boolean;
  offline: boolean;
};
