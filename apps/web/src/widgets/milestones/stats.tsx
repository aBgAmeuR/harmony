import { format } from "@/shared/lib/format";
import { Stat } from "@/shared/primitives/stat";

type StatsProps = {
  marks: number;
  total: number;
  set: number;
  records: number;
  hours: number;
  first: string;
  streak: number;
  best: number;
};

export const MilestoneStats = ({
  marks,
  total,
  set,
  records,
  hours,
  first,
  streak,
  best,
}: StatsProps) => {
  const tiles = [
    { label: "Milestones", value: marks, kind: "count", hint: `${format.count(total)} in all` },
    { label: "Records set", value: set, kind: "count", hint: `of ${records} personal bests` },
    {
      label: "Hours listened",
      value: hours * 60,
      kind: "minutes",
      hint: `since ${format.date(first)}`,
    },
    {
      label: "Latest streak",
      value: streak,
      kind: "count",
      hint: `days, best ${format.count(best)}`,
    },
  ] as const;

  return (
    <div className="flex flex-wrap border-y border-border">
      {tiles.map((tile) => (
        <Stat
          key={tile.label}
          className="min-w-40 flex-1 gap-1.5 border-r border-border px-3 py-3 last:border-r-0"
        >
          <Stat.Label className="text-xs">{tile.label}</Stat.Label>
          <span className="flex items-baseline gap-1.5">
            <Stat.Value value={tile.value} kind={tile.kind} size="lg" />
            <Stat.Hint className="truncate text-xs">{tile.hint}</Stat.Hint>
          </span>
        </Stat>
      ))}
    </div>
  );
};
