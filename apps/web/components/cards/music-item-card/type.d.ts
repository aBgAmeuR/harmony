export type MusicItemCardProps = {
  item: {
    id: string;
    href: string;
    image?: string;
    name: string;
    artists?: string;
    stat1?: string;
    stat2?: string;
  };
  rank?: number;
  showAction?: boolean;
  actionHref?: string;
  layout?: "grid" | "list";
};
