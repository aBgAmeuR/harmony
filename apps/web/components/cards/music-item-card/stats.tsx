type MusicItemCardStatsProps = {
  stat1?: string | React.ReactNode;
  stat2?: string | React.ReactNode;
  layout?: "grid" | "list";
};

export const MusicItemCardStats = ({
  stat1,
  stat2,
  layout,
}: MusicItemCardStatsProps) => (
  <div
    className={
      layout === "grid"
        ? "space-y-1 flex-col items-start hidden @lg:flex"
        : "space-y-1 flex-col items-start flex"
    }
  >
    <p className="text-sm text-muted-foreground">{stat1}</p>
    <p className="text-sm text-muted-foreground">{stat2}</p>
  </div>
);
