import { auth } from "@repo/auth";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { Separator } from "@repo/ui/separator";
import { Info } from "lucide-react";

import { MusicItemCard } from "~/components/cards/music-item-card";

import { musicListConfig } from "./config";
import { MusicListError } from "./error";

type MusicListProps = {
  type: keyof typeof musicListConfig;
};

export const MusicList = async ({ type }: MusicListProps) => {
  const listConfig = musicListConfig[type];
  const session = await auth();
  const items = await listConfig.action(session?.user.id);

  if (!items) return <MusicListError />;

  return (
    <div className="flex flex-col">
      {items.map((item, index: number) => (
        <div
          key={`${item.id}-${index}-${listConfig.label}`}
          className="flex flex-col"
        >
          <MusicItemCard
            item={item}
            rank={listConfig.showRank ? index + 1 : undefined}
            showAction={listConfig.showAction}
          />
          {index < items.length - 1 && <Separator />}
        </div>
      ))}
      {items.length === 0 && (
        <Alert variant="info">
          <Info className="size-4" />
          <AlertTitle>No {listConfig.label} found</AlertTitle>
          <AlertDescription>
            You haven't listened to any music during this period
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
