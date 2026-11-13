import {
  ArrowDown01Icon,
  ArrowDown02Icon,
  ArrowUp02Icon,
  GridViewIcon,
  Icon,
  ListViewIcon,
  SlidersHorizontalIcon,
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

import { bases, EXPLORER_BASES } from "@/data/bases";

import { oneOf, switchBase, type View, type ViewState } from "./view";

type Props = { view: View; onChange: (patch: ViewState) => void };

const LAYOUTS = {
  table: { label: "List", icon: ListViewIcon },
  gallery: { label: "Gallery", icon: GridViewIcon },
} as const;

const SECTIONS = ["Listening", "Behaviour", "Dates", "Other"] as const;

const SECTION_OF = {
  count: "Listening",
  compact: "Listening",
  minutes: "Listening",
  ratio: "Listening",
  percent: "Behaviour",
  date: "Dates",
  text: "Other",
  flag: "Other",
} as const;

export const BaseMenu = ({ view, onChange }: Props) => (
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
        onValueChange={(value) => {
          const base = oneOf(EXPLORER_BASES, value);
          if (base) onChange(switchBase(view, base));
        }}
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

export const SortChip = ({ view, onChange }: Props) => {
  const props = Object.entries(view.base.props);
  const sorted = view.base.props[view.sort];
  const order =
    sorted?.kind === "date"
      ? { desc: "Newest first", asc: "Oldest first" }
      : { desc: "Highest first", asc: "Lowest first" };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" />}>
        <Icon icon={view.desc ? ArrowDown02Icon : ArrowUp02Icon} />
        {sorted?.label}
        <Icon icon={ArrowDown01Icon} className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuRadioGroup
          value={view.desc ? "desc" : "asc"}
          onValueChange={(dir) => onChange({ desc: dir === "desc" })}
          className="mb-1 grid grid-cols-2 gap-0.5 rounded-md bg-muted p-0.5 text-muted-foreground"
        >
          {Object.entries(order).map(([dir, label]) => (
            <DropdownMenuRadioItem
              key={dir}
              value={dir}
              variant="toggle"
              className="justify-center data-checked:bg-background data-checked:text-foreground"
            >
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {SECTIONS.map((section) => {
          const options = props.filter(([, prop]) => SECTION_OF[prop.kind] === section);
          return (
            options.length > 0 && (
              <DropdownMenuRadioGroup
                key={section}
                value={view.sort}
                onValueChange={(sort) =>
                  onChange({ sort: oneOf(Object.keys(view.base.props), sort) })
                }
              >
                <DropdownMenuLabel>{section}</DropdownMenuLabel>
                {options.map(([name, prop]) => (
                  <DropdownMenuRadioItem key={name} value={name}>
                    {prop.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            )
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ViewMenu = ({ view, onChange }: Props) => (
  <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="ghost" />}>
      <Icon icon={SlidersHorizontalIcon} />
      View
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-42">
      {view.base.views.length > 1 && (
        <>
          <DropdownMenuRadioGroup
            value={view.view}
            onValueChange={(value) => onChange({ view: oneOf(view.base.views, value) })}
            className="grid auto-cols-fr grid-flow-col gap-1 text-muted-foreground"
          >
            {view.base.views.map((type) => (
              <DropdownMenuRadioItem
                key={type}
                value={type}
                variant="toggle"
                className="cursor-pointer justify-center gap-1 rounded-lg border border-border px-0 py-3 data-checked:border-primary/60 data-checked:bg-primary/10 data-checked:text-foreground"
              >
                <Icon icon={LAYOUTS[type].icon} className="size-3" />
                {LAYOUTS[type].label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuCheckboxItem
        disabled={view.view !== "table"}
        checked={view.bars}
        onCheckedChange={(on) => onChange({ bars: on ? true : undefined })}
        className="cursor-pointer"
      >
        Bars behind rows
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        disabled={view.view !== "table"}
        checked={view.diffs}
        onCheckedChange={(on) => onChange({ diffs: on ? undefined : false })}
        className="cursor-pointer"
      >
        Rank changes
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
