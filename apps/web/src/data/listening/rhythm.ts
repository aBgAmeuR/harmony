import { db } from "@harmony/duckdb";

import type { Rhythm } from "./types";

import { buildListeningFilter, type ListeningRangeParams } from "./listening-filter";

type HourRow = { t: number; minutes: number };

// Minutes listened by weekday and by hour, in the listener's time zone.
export const rhythmFn = async (params: ListeningRangeParams): Promise<Rhythm> => {
  const { artistJoin, where } = buildListeningFilter(params);

  // Plays are stored in UTC. They come back per UTC hour so the browser can place each hour in
  // local time, daylight saving included.
  const rows = await db.query<HourRow>(`
    SELECT
      epoch(date_trunc('hour', i.ts))::DOUBLE AS t,
      (SUM(i.ms_played) / 60000.0)::DOUBLE AS minutes
    FROM interactions i
    ${artistJoin}
    ${where}
    GROUP BY 1
  `);

  const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const row of rows) {
    const date = new Date(row.t * 1000);
    const cells = grid[(date.getDay() + 6) % 7];
    const hour = date.getHours();
    if (cells) cells[hour] = (cells[hour] ?? 0) + row.minutes;
  }

  const days = grid.map((cells) => cells.reduce((sum, value) => sum + value, 0));
  const hours = Array.from({ length: 24 }, (_, hour) =>
    grid.reduce((sum, cells) => sum + (cells[hour] ?? 0), 0),
  );

  return { grid, days, hours };
};
