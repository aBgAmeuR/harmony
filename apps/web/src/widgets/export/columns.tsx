import { Icon, LayoutTable01Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@harmony/ui/components/dropdown-menu";

import { COLUMN_IDS, COLUMNS, type ColumnId } from "@/data/export";

type ColumnsProps = {
  columns: readonly ColumnId[];
  onHidden: (hidden: ColumnId[] | undefined) => void;
};

export const Columns = ({ columns, onHidden }: ColumnsProps) => {
  const toggle = (id: ColumnId, on: boolean) => {
    const hidden = COLUMN_IDS.filter((item) => (item === id ? !on : !columns.includes(item)));
    if (hidden.length < COLUMN_IDS.length) onHidden(hidden.length > 0 ? hidden : undefined);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <Icon icon={LayoutTable01Icon} />
        Columns
        <span className="text-muted-foreground tabular-nums">
          {columns.length}/{COLUMN_IDS.length}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {COLUMN_IDS.map((id) => (
          <DropdownMenuCheckboxItem
            key={id}
            checked={columns.includes(id)}
            onCheckedChange={(on) => toggle(id, on)}
            className="cursor-pointer"
          >
            <span className="flex-1">{id}</span>
            <span className="font-mono text-micro text-muted-foreground">{COLUMNS[id].type}</span>
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={columns.length === COLUMN_IDS.length}
          onClick={() => onHidden(undefined)}
          className="cursor-pointer"
        >
          Show all
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
