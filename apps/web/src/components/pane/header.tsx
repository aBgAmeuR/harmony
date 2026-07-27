import { ArrowRightIcon, Icon } from "@harmony/icons";
import { PropsWithChildren } from "react";

import { ArtistsSelect } from "../layout/header/artists-select";

type PaneHeaderProps = PropsWithChildren<{
  title: string;
  artistSelect?: boolean;
}>;

export function PaneHeader({ title, artistSelect = false, children }: PaneHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-2 px-4 py-2">
      <div className="flex items-center gap-1">
        <h4 className="font-semibold tracking-tight">{title}</h4>
        {artistSelect && (
          <>
            <Icon icon={ArrowRightIcon} className="size-4 pt-0.5 text-muted-foreground" />
            <ArtistsSelect />
          </>
        )}
      </div>
      <div className="flex items-center gap-1">{children}</div>
    </header>
  );
}
