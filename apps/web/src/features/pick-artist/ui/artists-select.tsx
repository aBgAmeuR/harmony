import { SearchIcon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxStatus,
  ComboboxTrigger,
} from "@harmony/ui/components/combobox";
import { InputGroupAddon } from "@harmony/ui/components/input-group";
import { Kbd } from "@harmony/ui/components/kbd";
import { Spinner } from "@harmony/ui/components/spinner";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { artistQueries } from "@/entities/artist";
import { Art } from "@/shared/primitives/art";
import { periodLabel, useArtistStore, useDateRangeStore, usePeriod } from "@/shared/scope";

type Option = {
  id: number;
  name: string;
  image: string | null;
  // Minutes listened in the period, absent for the "All artists" entry.
  playtime?: number;
};

type Group = {
  value: string;
  items: Option[];
};

const ALL: Option = { id: 0, name: "All artists", image: null };

const minutes = (value: number): string =>
  value >= 1000 ? `${(value / 60).toFixed(value >= 6000 ? 0 : 1)} h` : `${value} min`;

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

type ArtistsSelectProps = {
  // Replaces the "Artist · All artists" label while no artist is picked.
  placeholder?: string;
  className?: string;
  // Opens the menu on the `a` key.
  hotkey?: boolean;
};

export const ArtistsSelect = ({ placeholder, className, hotkey = false }: ArtistsSelectProps) => {
  const { artist, setArtist } = useArtistStore();
  const mode = useDateRangeStore((s) => s.mode);
  const { from, to } = usePeriod();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: found = [], isLoading } = useQuery({
    ...artistQueries.search.queryOptions({ query, from, to }),
    enabled: open,
  });

  // `a` opens the menu from anywhere but a field.
  useEffect(() => {
    if (!hotkey) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "a" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target)) return;
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey]);

  const searching = query.trim() !== "";
  const groups: Group[] = [
    { value: "", items: [ALL] },
    {
      value: searching ? "Results" : `Top in ${periodLabel(mode, from, to)}`,
      items: found,
    },
  ];

  return (
    <Combobox
      open={open}
      items={groups}
      value={artist ?? ALL}
      onValueChange={(next: Option | null) => {
        setArtist(next && next.id !== ALL.id ? next : null);
        setOpen(false);
      }}
      inputValue={query}
      onInputValueChange={setQuery}
      itemToStringLabel={(option: Option) => option.name}
      isItemEqualToValue={(a: Option, b: Option) => a.id === b.id}
      filter={null}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <ComboboxTrigger
        render={<Button variant="ghost" className={cn("-ms-2! gap-1.5 text-sm", className)} />}
      >
        {artist ? <Art src={artist.image} alt={artist.name} size="xs" /> : null}
        <span className="font-semibold tracking-tight">
          {artist?.name ?? placeholder ?? ALL.name}
        </span>
      </ComboboxTrigger>
      <ComboboxContent className="w-72">
        <ComboboxInput showTrigger={false} placeholder="Search artists..." autoFocus>
          <InputGroupAddon align="inline-start">
            <Icon icon={SearchIcon} className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd>a</Kbd>
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxStatus>
          {isLoading && (
            <div className="flex items-center justify-center gap-1 py-2 text-center text-xs/relaxed text-muted-foreground">
              <Spinner className="size-4" />
              <span>Searching...</span>
            </div>
          )}
        </ComboboxStatus>
        {!isLoading && searching && found.length === 0 && (
          <ComboboxEmpty>No artists found.</ComboboxEmpty>
        )}
        <ComboboxList>
          {(group: Group) =>
            group.items.length > 0 ? (
              <ComboboxGroup key={group.value || "all"} items={group.items}>
                <ComboboxCollection>
                  {(option: Option) => (
                    <ComboboxItem key={option.id} value={option}>
                      {option.id === ALL.id ? null : (
                        <Art src={option.image} alt={option.name} size="xs" />
                      )}
                      <span className="truncate">{option.name}</span>
                      {option.playtime !== undefined ? (
                        <span className="ml-auto pr-5 text-muted-foreground tabular-nums">
                          {minutes(option.playtime)}
                        </span>
                      ) : null}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            ) : null
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
