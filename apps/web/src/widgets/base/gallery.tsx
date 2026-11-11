import { cn } from "@harmony/ui/lib/utils";

import type { ListRow } from "@/data/bases";

import { Art } from "@/shared/primitives/art";

import type { View } from "./view";

import { Value } from "./value";

type GalleryProps = {
  view: View;
  rows: ListRow[];
  selected: (row: ListRow) => boolean;
  onOpen: (row: ListRow) => void;
};

// Deezer serves its `/image` links at 120px by default: the gallery asks for the 500px picture.
const DEEZER_IMAGE = /^https:\/\/api\.deezer\.com\/[a-z]+\/\d+\/image$/;
const big = (src: string | null): string | null =>
  src && DEEZER_IMAGE.test(src) ? `${src}?size=big` : src;

// Covers in a grid, with the sorted property under each name.
export const Gallery = ({ view, rows, selected, onOpen }: GalleryProps) => {
  const prop = view.base.props[view.sort];
  return (
    <div className="grid grid-cols-4 gap-y-3 sm:grid-cols-6">
      {rows.map((row) => (
        <button
          key={row.id}
          type="button"
          onClick={() => onOpen(row)}
          className={cn(
            "group flex min-w-0 flex-col gap-2 rounded-lg p-1 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50",
            selected(row) && "bg-muted/50",
          )}
        >
          <Art
            src={big(row.cover ?? row.image)}
            alt={row.name}
            size="fill"
            fallback={view.base.id === "artists" ? "initials" : "icon"}
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm text-foreground">{row.name}</span>
            {row.description ? (
              <span className="truncate text-xs text-muted-foreground">{row.description}</span>
            ) : null}
            {prop ? (
              <span className="text-xs text-muted-foreground">
                <Value row={row} name={view.sort} prop={prop} />
              </span>
            ) : null}
          </div>
        </button>
      ))}
    </div>
  );
};
