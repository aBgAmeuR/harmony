import { ArrowDown01Icon, GridViewIcon, Icon, LeftToRightListBulletIcon, ListViewIcon } from "@harmony/icons";
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
  table: { label: "List", icon: LeftToRightListBulletIcon },
  gallery: { label: "Gallery", icon: GridViewIcon },
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

export const ViewMenu = ({ view, onChange }: Props) => (
  <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="View options" />}>
      <Icon icon={LAYOUTS[view.view].icon} />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      {view.base.views.length > 1 && (
        <>
          <DropdownMenuRadioGroup
            value={view.view}
            onValueChange={(value) => onChange({ view: oneOf(view.base.views, value) })}
          >
            <DropdownMenuLabel>Layout</DropdownMenuLabel>
            {view.base.views.map((type) => (
              <DropdownMenuRadioItem key={type} value={type} className="cursor-pointer">
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
