import { within } from "@/data/milestones";
import { format } from "@/shared/lib/format";
import { Band } from "@/shared/primitives/band";
import { Empty } from "@/shared/primitives/empty";

import { LoadFailed, useMilestones } from "./milestones";
import { MarkList } from "./rows";

export const SeeAll = () => {
  const { range, failed, marks } = useMilestones();
  if (failed) return <LoadFailed />;
  if (!marks) return null;

  const months = [
    ...Map.groupBy(
      marks.filter((mark) => within(mark.date, range)),
      (mark) => mark.date.slice(0, 7),
    ),
  ];
  if (months.length === 0) {
    return (
      <Empty className="h-40">
        <p>No milestones in this period.</p>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col border-t border-border pt-1 pb-8">
      {months.map(([month, rows]) => (
        <section key={month} aria-labelledby={`month-${month}`} className="mt-2 flex flex-col">
          <Band id={`month-${month}`} title={format.month(`${month}-01`)} count={rows.length} />
          <MarkList marks={rows} />
        </section>
      ))}
    </div>
  );
};
