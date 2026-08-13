import { useQuery } from "@tanstack/react-query";

import { useFilter } from "@/lib/filter";
import { query } from "@/lib/query";

import { formatBarCurrent, formatCount, nextMilestoneCopy } from "../format";

export function NextMilestonesWidget() {
  const filter = useFilter();
  const { data = [] } = useQuery(query.milestones.nextMilestones.queryOptions(filter));
  const upcoming = data.filter((bar) => !bar.reached);

  return (
    <section className="min-w-0 space-y-3" aria-labelledby="next-milestones">
      <h2 id="next-milestones" className="text-base font-semibold tracking-tight">
        Next Milestones
      </h2>
      {upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground">You have passed every listed mark.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {upcoming.map((bar) => {
            const { remaining, target } = nextMilestoneCopy(bar);
            const label = `${bar.label}, ${remaining} left before ${target}`;
            return (
              <div key={bar.id} className="min-w-0 space-y-1.5">
                <p className="text-sm text-pretty">
                  <span className="font-semibold text-primary">{remaining}</span>
                  {` left before `}
                  <span>{target}</span>
                </p>
                <div
                  role="progressbar"
                  aria-label={label}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={bar.percent}
                  aria-valuetext={label}
                  className="h-1 overflow-hidden rounded-md bg-muted"
                >
                  <div
                    className="origin-start h-full bg-primary transition-transform duration-200 ease-out motion-reduce:transition-none"
                    style={{ transform: `scaleX(${bar.percent / 100})` }}
                  />
                </div>
                <p className="text-end text-[10px] text-muted-foreground">
                  {formatBarCurrent(bar)} / {formatCount(bar.target)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
