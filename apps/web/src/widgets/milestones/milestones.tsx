import { ArrowRight01Icon, Icon } from "@harmony/icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { within } from "@/data/milestones";
import { format } from "@/shared/lib/format";
import { Band } from "@/shared/primitives/band";
import { Empty } from "@/shared/primitives/empty";
import { periodLabel, useDateRangeStore, usePeriod } from "@/shared/scope";

import { milestoneQueries } from "./api";
import { HoursCurve } from "./curve-chart";
import { BestRow, MarkList, NextRow, Rows } from "./rows";
import { MilestoneStats } from "./stats";

const PREVIEW = 8;

export const FROM = "/app/$packageId/milestones";

export const usePeriodLabel = () => {
  const mode = useDateRangeStore((store) => store.mode);
  const { from, to } = usePeriod();
  return periodLabel(mode, from, to);
};

export const useMilestones = () => {
  const range = usePeriod();
  const marks = useQuery(milestoneQueries.marks());
  const records = useQuery(milestoneQueries.records());
  const next = useQuery(milestoneQueries.next());
  const curve = useQuery(milestoneQueries.curve());
  const streak = useQuery(milestoneQueries.streak());
  return {
    range,
    failed: [marks, records, next, curve, streak].some((query) => query.isError),
    marks: marks.data,
    records: records.data,
    next: next.data,
    curve: curve.data,
    streak: streak.data,
  };
};

export const LoadFailed = () => (
  <Empty className="h-40">
    <p>Your milestones could not be loaded.</p>
  </Empty>
);

export const Milestones = () => {
  const label = usePeriodLabel();
  const { range, failed, marks, records, next, curve, streak } = useMilestones();
  if (failed) return <LoadFailed />;
  if (!marks || !records || !next || !curve || !streak) return null;
  if (!next.first || !next.last) {
    return (
      <Empty className="h-40">
        <p>This package has no plays yet.</p>
      </Empty>
    );
  }

  const shown = marks.filter((mark) => within(mark.date, range));
  const set = records.filter((best) => within(best.finish, range)).length;

  return (
    <>
      <MilestoneStats
        marks={shown.length}
        total={marks.length}
        set={set}
        records={records.length}
        hours={next.hours}
        first={next.first}
        streak={streak.currentDays}
        best={streak.longestDays}
      />
      <div className="flex flex-col gap-3 pt-3 pb-8">
        <HoursCurve
          curve={curve}
          marks={marks}
          hours={next.hours}
          first={next.first}
          last={next.last}
          range={range}
        />
        <section aria-labelledby="up-next" className="flex flex-col">
          <Band id="up-next" title="Up next" count={next.rows.length}>
            <span className="ml-auto text-muted-foreground">
              At your pace over the last {next.paceDays} days of the export
            </span>
          </Band>
          <Rows>
            {next.rows.map((row) => (
              <NextRow key={`${row.kind}-${row.id}`} row={row} />
            ))}
          </Rows>
        </section>
        <section aria-labelledby="records" className="flex flex-col">
          <Band id="records" title="Records" count={records.length}>
            <span className="ml-auto text-muted-foreground">{set} set in this period</span>
          </Band>
          <Rows>
            {records.map((best) => (
              <BestRow key={best.id} best={best} range={range} last={next.last} />
            ))}
          </Rows>
        </section>
        <section aria-labelledby="in-period" className="flex flex-col">
          <Band id="in-period" title={label} count={format.count(shown.length)}>
            {shown.length > PREVIEW ? (
              <Link
                from={FROM}
                to="."
                search={(prev) => ({ ...prev, list: "period" })}
                className="ml-auto inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                See all
                <Icon icon={ArrowRight01Icon} size={12} />
              </Link>
            ) : null}
          </Band>
          {shown.length === 0 ? (
            <p className="px-3 py-3 text-xs text-muted-foreground">None in this period.</p>
          ) : (
            <MarkList marks={shown.slice(0, PREVIEW)} />
          )}
        </section>
      </div>
    </>
  );
};
