import { auth } from "@repo/auth";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { Separator } from "@repo/ui/separator";
import { Info } from "lucide-react";

import { ErrorRankList } from "./error-rank-list";
import {
  getRankingAlbums,
  getRankingArtists,
  getRankingTracks,
} from "./get-ranking-data";
import { RankingCard } from "./ranking-card";

const actions = {
  tracks: getRankingTracks,
  artists: getRankingArtists,
  albums: getRankingAlbums,
} as const;

type RankListProps = {
  type: keyof typeof actions;
};

export const RankList = async ({ type }: RankListProps) => {
  const session = await auth();
  const items = await actions[type](session?.user.id);

  if (!items) return <ErrorRankList />;

  return (
    <div className="flex flex-col">
      {items.map((item, index: number) => (
        <div key={item.href}>
          <RankingCard
            type={type.slice(0, -1) as "track" | "artist" | "album"}
            item={item}
            rank={index + 1}
          />
          {index < items.length - 1 && <Separator />}
        </div>
      ))}
      {items.length === 0 && (
        <Alert variant="info">
          <Info className="size-4" />
          <AlertTitle>No {type} found</AlertTitle>
          <AlertDescription>
            You haven't listened to any music during this period
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
