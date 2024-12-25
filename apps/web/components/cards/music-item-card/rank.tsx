type MusicItemCardRankProps = {
  rank: number;
};

export const MusicItemCardRank = ({ rank }: MusicItemCardRankProps) => (
  <span className="w-6 text-right text-sm font-medium text-muted-foreground">
    {rank}
  </span>
);
