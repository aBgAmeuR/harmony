import { Suspense } from "react";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { ArrowRight } from "lucide-react";

import { ListSkeleton } from "~/components/list-skeleton";
import { MusicList } from "~/components/lists/music-list";
import { musicListConfig } from "~/components/lists/music-list/config";

const options = {
  dashboardArtists: {
    label: "Top Artists",
    description: "Top artists you've listened to",
    href: "/rankings/artists",
  },
  dashboardTracks: {
    label: "Top Tracks",
    description: "Top tracks you've listened to",
    href: "/rankings/tracks",
  },
} as const;

type RankingListProps = {
  type: keyof typeof options;
  className?: string;
  demoData?: Awaited<
    ReturnType<(typeof musicListConfig.dashboardArtists)["action"]>
  >;
};

export const RankingList = ({
  type,
  className,
  demoData,
}: RankingListProps) => {
  const { label, description, href } = options[type];

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1.5">
          <CardTitle>{label}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button className="group" variant="secondary" asChild>
          <a href={href}>
            View All
            <ArrowRight
              className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
          </a>
        </Button>
      </CardHeader>
      <CardContent className="pb-2">
        <Suspense fallback={<ListSkeleton length={5} />}>
          <MusicList type={type} listLength={5} demoData={demoData} />
        </Suspense>
      </CardContent>
    </Card>
  );
};
