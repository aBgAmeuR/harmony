import { buttonVariants } from "@harmony/ui/components/button";
import { cn } from "@harmony/ui/lib/utils";

type YearGridProps = {
  years: number[];
  selectedYear: number;
  onSelect: (year: number) => void;
};

export function YearGrid({ years, selectedYear, onSelect }: YearGridProps) {
  return (
    <div className="grid max-h-48 grid-cols-4 gap-1 overflow-y-auto">
      {years.map((year) => (
        <button
          key={year}
          type="button"
          onClick={() => onSelect(year)}
          className={cn(
            buttonVariants({
              variant: year === selectedYear ? "default" : "ghost",
            }),
            "h-8 text-sm font-normal",
          )}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
