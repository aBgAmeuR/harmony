import { cn } from "@repo/ui/lib/utils";

type MusicItemCardStatsProps = {
  stat1?: string;
  stat2?: string;
  layout?: "grid" | "list";
};

export const MusicItemCardStats = ({
  stat1,
  stat2,
  layout,
}: MusicItemCardStatsProps) => (
  <div
    className={cn(
      layout === "list"
        ? "hidden space-y-1 flex-col items-start @lg:flex"
        : "flex flex-row items-end justify-between w-full",
    )}
  >
    <p className="text-sm text-muted-foreground">
      {layout === "grid" ? stat1?.replace(" minutes", "min") : stat1}
    </p>
    <p className="text-sm text-muted-foreground">
      {layout === "grid" ? stat2?.replace(" streams", "x") : stat2}
    </p>
  </div>
);
