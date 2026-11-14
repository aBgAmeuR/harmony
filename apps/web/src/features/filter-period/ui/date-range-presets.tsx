import { Button } from "@harmony/ui/components/button";

import { monthEnd } from "@/features/filter-period/lib";

type DateRangePresetsProps = {
  months: { start: Date }[];
  range: { from: Date; to: Date } | null;
  onSelect: (from: Date, to: Date) => void;
};

export const DateRangePresets = ({ months, range, onSelect }: DateRangePresetsProps) => {
  const first = months[0]?.start;
  const last = months.at(-1)?.start;
  if (!first || !last) return null;

  const end = monthEnd(last);
  const back = (count: number) => months.at(-count)?.start ?? first;
  const year = last.getFullYear();
  const presets = [
    { label: "Latest month", from: last, to: end },
    { label: "Last 3 months", from: back(3), to: end },
    { label: "Last 6 months", from: back(6), to: end },
    { label: String(year), from: new Date(year, 0, 1), to: new Date(year, 11, 31) },
    ...(year - 1 >= first.getFullYear()
      ? [
          {
            label: String(year - 1),
            from: new Date(year - 1, 0, 1),
            to: new Date(year - 1, 11, 31),
          },
        ]
      : []),
    { label: "All time", from: first, to: end },
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {presets.map((preset) => (
        <Button
          key={preset.label}
          type="button"
          variant="secondary"
          aria-pressed={
            range?.from.getTime() === preset.from.getTime() &&
            range.to.getTime() === preset.to.getTime()
          }
          className="cursor-pointer rounded-full px-2.5 aria-pressed:bg-primary/20 aria-pressed:text-primary"
          onClick={() => onSelect(preset.from, preset.to)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
};
