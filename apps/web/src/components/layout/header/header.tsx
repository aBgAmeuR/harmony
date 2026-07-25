import { ArrowRightIcon, Icon } from "@harmony/icons";

import { ArtistsSelect } from "./artists-select";
import { DateRangeFilter } from "./date-range-filter";

type HeaderProps = {
  title: string;
  showArtistSelect?: boolean;
};

export function Header({ title, showArtistSelect = true }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-2 px-4 py-2">
      <div className="flex items-center gap-1">
        <h4 className="font-semibold tracking-tight">{title}</h4>

        {showArtistSelect && (
          <>
            {/* <span className="pe-1 pb-0.5 text-muted-foreground">/</span> */}
            <Icon icon={ArrowRightIcon} className="size-4 pt-0.5 text-muted-foreground" />
            <ArtistsSelect />
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        {/* <Button variant="ghost">
          <Icon icon={FilterIcon} />
          Filters
        </Button> */}
        {/* <ViewModeToggle size="sm" /> */}
        <DateRangeFilter />
      </div>
    </header>
  );
}
