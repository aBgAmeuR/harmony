import { db } from "@harmony/duckdb";

import type { PlatformPoint } from "../types";

const PLATFORM_LABELS: Record<string, string> = {
  android: "Android",
  ios: "iOS",
  linux: "Linux",
  other: "Other",
  web_player: "Web",
  windows: "Windows",
  not_applicable: "N/A",
};

export const platformsFn = async (): Promise<PlatformPoint[]> => {
  const rows = await db.query<{ platform: string; value: number }>(`
    SELECT
      i.platform,
      COUNT(*)::INTEGER AS value
    FROM interactions i
    WHERE i.platform IS NOT NULL
    GROUP BY i.platform
    ORDER BY value DESC
  `);

  return rows.map((row) => ({
    label: PLATFORM_LABELS[row.platform] ?? row.platform,
    value: row.value,
  }));
};
