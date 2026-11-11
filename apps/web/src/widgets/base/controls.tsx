import {
  ArrowDown01Icon,
  ArrowDown02Icon,
  ArrowUp02Icon,
  GridViewIcon,
  Icon,
  SlidersHorizontalIcon,
  ListViewIcon,
  type IconSvgElement,
} from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@harmony/ui/components/dropdown-menu";

import { bases, EXPLORER_BASES, type ExplorerBaseId, type ViewType } from "@/data/bases";

import type { View, ViewState } from "./view";

type ControlProps = { view: View; onChange: (patch: ViewState) => void };

export const BaseMenu = ({
  view,
  onBase,
}: {
  view: View;
  onBase: (base: ExplorerBaseId) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={
        <Button
          variant="ghost"
          className="px-1.5 text-sm font-semibold tracking-tight text-foreground"
        />
      }
    >
      {view.base.title}
      <Icon icon={ArrowDown01Icon} className="text-muted-foreground" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="w-40">
      <DropdownMenuRadioGroup
        value={view.base.id}
        onValueChange={(base: ExplorerBaseId) => onBase(base)}
      >
        {EXPLORER_BASES.map((id) => (
          <DropdownMenuRadioItem key={id} value={id}>
            {bases[id].title}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

const LAYOUTS: Record<ViewType, { label: string; icon: IconSvgElement }> = {
  table: { label: "List", icon: ListViewIcon },
  gallery: { label: "Gallery", icon: GridViewIcon },
};

type SortOption = { name: string; label: string };
type SortSection = { label: string; options: SortOption[] };

// The sorts of a base by what they measure. Rows are not sorted by name: search finds them.
const sortSections = (view: View): SortSection[] => {
  const sections: Record<string, SortOption[]> = {
    Listening: [],
    Behaviour: [],
    Dates: [],
    Other: [],
  };
  for (const [name, prop] of Object.entries(view.base.props)) {
    const section =
      prop.kind === "date"
        ? "Dates"
        : prop.kind === "percent"
          ? "Behaviour"
          : prop.kind === "text" || prop.kind === "flag"
            ? "Other"
            : "Listening";
    sections[section]?.push({ name, label: prop.label });
  }
  return Object.entries(sections)
    .filter(([, options]) => options.length > 0)
    .map(([label, options]) => ({ label, options }));
};

const sortLabel = (view: View): string =>
  sortSections(view)
    .flatMap((section) => section.options)
    .find((option) => option.name === view.sort)?.label ??
  (view.sort === "name" ? "Name" : view.sort);

// Dates read as newest and oldest, everything else as highest and lowest.
const orderLabels = (view: View): [string, string] =>
  view.base.props[view.sort]?.kind === "date"
    ? ["Newest first", "Oldest first"]
    : ["Highest first", "Lowest first"];

// Two radio items side by side, the checked one raised.
const SEGMENT =
  "justify-center pr-2 data-checked:bg-background data-checked:text-foreground [&>[data-slot=dropdown-menu-radio-item-indicator]]:hidden";

// A square with a big icon over its label, the checked one tinted green.
const TILE =
  "justify-center cursor-pointer gap-1 py-3 rounded-lg border border-border px-0 data-checked:border-primary/60 data-checked:bg-primary/10 data-checked:text-foreground [&>[data-slot=dropdown-menu-radio-item-indicator]]:hidden";

// The sort of the rows: the order on top, then what they are sorted by, in sections.
export const SortChip = ({ view, onChange }: ControlProps) => {
  const [high, low] = orderLabels(view);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" aria-label={`Sorted by ${sortLabel(view)}`} />}
      >
        <Icon icon={view.desc ? ArrowDown02Icon : ArrowUp02Icon} />
        {sortLabel(view)}
        <Icon icon={ArrowDown01Icon} className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuRadioGroup
          value={view.desc ? "desc" : "asc"}
          onValueChange={(dir: string) => onChange({ desc: dir === "desc" })}
          className="mb-1 grid grid-cols-2 gap-0.5 rounded-md bg-muted p-0.5 text-muted-foreground"
        >
          <DropdownMenuRadioItem value="desc" className={SEGMENT}>
            {high}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="asc" className={SEGMENT}>
            {low}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        {sortSections(view).map((section) => (
          <DropdownMenuRadioGroup
            key={section.label}
            value={view.sort}
            onValueChange={(sort: string) => onChange({ sort })}
          >
            <DropdownMenuLabel>{section.label}</DropdownMenuLabel>
            {section.options.map((option) => (
              <DropdownMenuRadioItem key={option.name} value={option.name}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// How the rows are shown: the layout, then the bars and rank changes of a list.
export const ViewMenu = ({ view, onChange }: ControlProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="ghost" />}>
      <Icon icon={SlidersHorizontalIcon} />
      View
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-42">
      {view.base.views.length > 1 ? (
        <>
          <DropdownMenuRadioGroup
            value={view.view}
            onValueChange={(next: ViewType) => onChange({ view: next })}
            className="grid auto-cols-fr grid-flow-col gap-1 text-muted-foreground"
          >
            {view.base.views.map((type) => (
              <DropdownMenuRadioItem key={type} value={type} className={TILE}>
                <Icon icon={LAYOUTS[type].icon} className="size-3!" />
                {LAYOUTS[type].label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
        </>
      ) : null}
      <DropdownMenuCheckboxItem
        disabled={view.view !== "table"}
        checked={view.bars}
        onCheckedChange={(on: boolean) => onChange({ bars: on ? undefined : false })}
        className="cursor-pointer"
      >
        Bars behind rows
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        disabled={view.view !== "table"}
        checked={view.diffs}
        onCheckedChange={(on: boolean) => onChange({ diffs: on ? undefined : false })}
        className="cursor-pointer"
      >
        Rank changes
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
