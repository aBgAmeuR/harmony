import { ArrowDown01Icon, FilterIcon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";

import { ViewModeToggle } from "./view-mode-toggle";

type HeaderProps = {
  title: string;
};

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold tracking-tight">{title}</h4>
        <span className="pb-0.5 text-muted-foreground">/</span>
        <Button variant="ghost" className="-ms-1!">
          <h4 className="font-semibold tracking-tight text-muted-foreground">All Artists</h4>
          <Icon icon={ArrowDown01Icon} className="text-muted-foreground" />
        </Button>
        {/* <Button variant="ghost"  className="px-1! -ms-1!">
            <CatalogImage
              image={'https://api.deezer.com/artist/10002824/image'}
              alt="Playboi Carti"
              className="size-5"
            />
            <h4 className="font-semibold tracking-tight text-muted-foreground">Playboi Carti</h4>
            <HugeiconsIcon icon={ArrowDown01Icon} className="text-muted-foreground" />
          </Button> */}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost">
          <Icon icon={FilterIcon} />
          Filters
        </Button>
        <ViewModeToggle size="sm" />
        <Button variant="secondary">12 Jan 2024 - 15 Mar 2026</Button>
      </div>
    </header>
  );
}
