import type { Discovery } from "@/data/discoveries";

import { parseDay } from "@/shared/lib/date";

import type { DiscoveryList } from "./list";

import { FreshHistory, LoadFailed, useDiscoveries } from "./discoveries";
import {
  awayLabel,
  backLabel,
  Band,
  FindRow,
  FindTable,
  ReleaseGap,
  spanLabel,
  weeksLabel,
} from "./rows";

type Month = { key: string; label: string; rows: Discovery[] };

const byMonth = (rows: readonly Discovery[]) => {
  const months = new Map<string, Month>();
  const sorted = rows.toSorted((a, b) => a.start.localeCompare(b.start) || a.id - b.id);
  for (const row of sorted) {
    const key = row.start.slice(0, 7);
    const month = months.get(key) ?? {
      key,
      label: parseDay(row.start).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      rows: [],
    };
    month.rows.push(row);
    months.set(key, month);
  }
  return [...months.values()];
};

const PassedList = ({ rows }: { rows: readonly Discovery[] }) =>
  byMonth(rows).map((month) => (
    <section key={month.key} aria-labelledby={`month-${month.key}`} className="mt-2 flex flex-col">
      <Band
        id={`month-${month.key}`}
        title={month.label}
        count={month.rows.length === 1 ? "1 artist" : `${month.rows.length} artists`}
      />
      <FindTable>
        {month.rows.map((row) => (
          <FindRow
            key={row.id}
            find={row}
            opens="artist"
            rank={parseDay(row.start).getDate()}
            when={spanLabel(row.start, row.last)}
            note={weeksLabel(row.weeks)}
          />
        ))}
      </FindTable>
    </section>
  ));

export const SeeAll = ({ list }: { list: DiscoveryList }) => {
  const { failed, summary, found, returns, atRelease } = useDiscoveries();
  if (failed) return <LoadFailed />;
  if (!summary || !found || !returns || !atRelease) return null;
  if (summary.fresh) return <FreshHistory />;

  return (
    <div className="flex flex-col border-t border-border pt-1 pb-8">
      {list === "passed" ? <PassedList rows={found.filter((row) => row.passed)} /> : null}
      {list === "release" ? (
        <FindTable>
          {atRelease.map((row, index) => (
            <FindRow
              key={row.id}
              find={row}
              opens="album"
              sub={row.sub}
              rank={index + 1}
              when={<ReleaseGap row={row} />}
              note={weeksLabel(row.weeks)}
            />
          ))}
        </FindTable>
      ) : null}
      {list === "back" ? (
        <FindTable>
          {returns.map((row) => (
            <FindRow
              key={row.id}
              find={row}
              opens="artist"
              when={backLabel(row)}
              note={awayLabel(row.away)}
            />
          ))}
        </FindTable>
      ) : null}
    </div>
  );
};
