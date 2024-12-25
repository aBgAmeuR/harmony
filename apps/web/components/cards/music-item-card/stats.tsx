type MusicItemCardStatsProps = {
  stat1?: string | React.ReactNode;
  stat2?: string | React.ReactNode;
};

export const MusicItemCardStats = ({
  stat1,
  stat2,
}: MusicItemCardStatsProps) => (
  <div className="space-y-1 flex flex-col items-start">
    <p className="text-sm text-muted-foreground">{stat1}</p>
    <p className="text-sm text-muted-foreground">{stat2}</p>
  </div>
);
