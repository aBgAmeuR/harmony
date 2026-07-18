import { db } from "@harmony/duckdb";

import { interactionDateConditions, joinWhere } from "@/lib/sql/date-range";

export type DeviceShare = {
  label: string;
  percentage: number;
};

export type TrackDevicesMetrics = {
  devices: DeviceShare[];
};

type PlatformRow = {
  platform: string;
  value: number;
};

type TrackDevicesParams = {
  trackId: number;
  from: Date;
  to: Date;
};

const PLATFORM_LABELS: Record<string, string> = {
  android: "Android",
  ios: "iOS",
  linux: "Linux",
  other: "Other",
  web_player: "Web",
  windows: "Windows",
  not_applicable: "N/A",
};

function toPrimaryDevices(rows: PlatformRow[]): DeviceShare[] {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  if (total === 0) return [];

  const withPercent = rows.map((row) => ({
    label: PLATFORM_LABELS[row.platform] ?? row.platform,
    percentage: Math.round((row.value / total) * 100),
  }));

  if (withPercent.length <= 2) {
    return withPercent;
  }

  const top = withPercent.slice(0, 2);
  const othersPercentage = withPercent.slice(2).reduce((sum, device) => sum + device.percentage, 0);

  return [...top, { label: "Others", percentage: othersPercentage }];
}

export const trackDevicesFn = async ({
  trackId,
  from,
  to,
}: TrackDevicesParams): Promise<TrackDevicesMetrics> => {
  const conditions = [
    ...interactionDateConditions(from, to),
    `i.track_id = ${trackId}`,
    "i.platform IS NOT NULL",
  ];

  const rows = await db.query<PlatformRow>(`
    SELECT
      i.platform,
      COUNT(*)::INTEGER AS value
    FROM interactions i
    ${joinWhere(conditions)}
    GROUP BY i.platform
    ORDER BY value DESC
  `);

  return {
    devices: toPrimaryDevices(rows),
  };
};
