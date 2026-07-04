import { CatalogImage } from "@/components/catalog/catalog-image";
import type { Catalog } from "@/components/catalog/catalog";
import { artistsQueries } from "@/features/artists/queries";
import { SearchIcon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxStatus,
  ComboboxTrigger,
  ComboboxValue,
} from "@harmony/ui/components/combobox";
import { InputGroupAddon } from "@harmony/ui/components/input-group";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Spinner } from "@harmony/ui/components/spinner";
import { useArtistStore } from "@/lib/stores/artist-store";

type Artist = Pick<Catalog, "id" | "name" | "image">;

export function ArtistsSelect() {
  const { artist, setArtist } = useArtistStore();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: artists = [], isLoading } = useQuery(
    artistsQueries.search.queryOptions({ query: searchQuery }),
  );

  return (
    <Combobox
      items={artists}
      value={artist}
      onValueChange={setArtist}
      inputValue={searchQuery}
      onInputValueChange={setSearchQuery}
      itemToStringLabel={(artist) => artist.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
      filter={null}
      onOpenChange={(open) => !open && setSearchQuery("")}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="ghost"
            className={cn("gap-1.5 -ms-2! text-sm", artist && "px-1!")}
          />
        }
      >
        <ComboboxValue>
          {(artist: Artist | null) => (
            <>
              {artist && (
                <CatalogImage
                  image={artist.image}
                  alt={artist.name}
                  className="size-5"
                />
              )}
              <span className="font-semibold tracking-tight text-muted-foreground">
                {artist?.name ?? "All Artists"}
              </span>
            </>
          )}
        </ComboboxValue>
      </ComboboxTrigger>
      <ComboboxContent className="w-auto">
        <ComboboxInput
          showTrigger={false}
          showClear
          placeholder="Search artists..."
        >
          <InputGroupAddon align="inline-start">
            <Icon icon={SearchIcon} className="text-muted-foreground" />
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxStatus>
          {isLoading && (
            <div className="flex items-center justify-center gap-1 py-2 text-center text-xs/relaxed text-muted-foreground">
              <Spinner className="size-4" />
              <span className="text-xs text-muted-foreground">
                Searching...
              </span>
            </div>
          )}
        </ComboboxStatus>
        {!isLoading && <ComboboxEmpty>No artists found.</ComboboxEmpty>}
        <ComboboxList>
          {(item: Artist) => (
            <ComboboxItem key={item.id} value={item}>
              <CatalogImage
                image={item.image}
                alt={item.name}
                className="size-5"
              />
              <span className="truncate">{item.name}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
