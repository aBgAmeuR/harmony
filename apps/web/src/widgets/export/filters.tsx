import { Add01Icon, ArrowDown01Icon, Cancel01Icon, FilterIcon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@harmony/ui/components/dropdown-menu";
import { Input } from "@harmony/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@harmony/ui/components/popover";
import { useState } from "react";

import {
  COLUMN_IDS,
  COLUMNS,
  needsValue,
  OPS,
  type ColumnId,
  type ExportOp,
  type ExportRule,
} from "@/data/export";

const OP_LABELS = {
  contains: "contains",
  is: "is",
  not: "is not",
  gt: ">",
  lt: "<",
  empty: "is empty",
  filled: "is not empty",
} as const;

const PLACEHOLDERS = {
  text: "value",
  int: "0",
  timestamp: "2024-01-31",
  date: "2024-01-31",
  bool: "",
} as const;

const fresh = (column: ColumnId) => {
  const { type } = COLUMNS[column];
  return { column, op: OPS[type][0], value: type === "bool" ? "true" : "" };
};

type PickProps<T extends string> = {
  value: T;
  options: readonly T[];
  label: (option: T) => string;
  onPick: (option: T) => void;
};

const Pick = <T extends string>({ value, options, label, onPick }: PickProps<T>) => (
  <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="outline" className="w-full justify-between" />}>
      <span className="truncate">{label(value)}</span>
      <Icon icon={ArrowDown01Icon} size={12} className="text-muted-foreground" />
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-44">
      <DropdownMenuRadioGroup
        value={value}
        onValueChange={(next) => {
          const option = options.find((item) => item === next);
          if (option) onPick(option);
        }}
      >
        {options.map((option) => (
          <DropdownMenuRadioItem key={option} value={option} className="cursor-pointer">
            {label(option)}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

type RuleRowProps = {
  rule: ExportRule;
  first: boolean;
  onChange: (rule: ExportRule) => void;
  onType: (rule: ExportRule) => void;
  onCommit: () => void;
  onRemove: () => void;
};

const RuleRow = ({ rule, first, onChange, onType, onCommit, onRemove }: RuleRowProps) => {
  const { type } = COLUMNS[rule.column];
  const ops: readonly ExportOp[] = OPS[type];
  return (
    <div className="grid grid-cols-12 items-center gap-1">
      <span className="col-span-1 pr-1 text-right text-muted-foreground">
        {first ? "where" : "and"}
      </span>
      <div className="col-span-4">
        <Pick
          value={rule.column}
          options={COLUMN_IDS}
          label={(id) => id}
          onPick={(column) => onChange(fresh(column))}
        />
      </div>
      <div className="col-span-3">
        <Pick
          value={rule.op}
          options={ops}
          label={(op) => OP_LABELS[op]}
          onPick={(op) => onChange({ ...rule, op })}
        />
      </div>
      <div className="col-span-3">
        {type === "bool" ? (
          <Pick
            value={rule.value === "false" ? "false" : "true"}
            options={["true", "false"]}
            label={(value) => value}
            onPick={(value) => onChange({ ...rule, value })}
          />
        ) : needsValue(rule.op) ? (
          <Input
            value={rule.value}
            aria-label={`Value for ${rule.column}`}
            placeholder={PLACEHOLDERS[type]}
            onChange={(event) => onType({ ...rule, value: event.target.value })}
            onBlur={onCommit}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
          />
        ) : null}
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Remove rule"
        onClick={onRemove}
        className="col-span-1 justify-self-end"
      >
        <Icon icon={Cancel01Icon} />
      </Button>
    </div>
  );
};

type FiltersProps = {
  rules: readonly ExportRule[];
  onRules: (rules: ExportRule[]) => void;
};

export const Filters = ({ rules, onRules }: FiltersProps) => {
  const [draft, setDraft] = useState(rules);
  const commit = (next: readonly ExportRule[]) => {
    const clean = next.map((rule) => ({ ...rule, value: rule.value.trim() }));
    setDraft(clean);
    onRules(clean);
  };
  const replace = (list: readonly ExportRule[], index: number, next: ExportRule) =>
    list.map((rule, at) => (at === index ? next : rule));
  const remove = (list: readonly ExportRule[], index: number) =>
    list.filter((_, at) => at !== index);

  return (
    <>
      <Popover
        onOpenChange={(open) => {
          if (open) setDraft(rules);
          else commit(draft);
        }}
      >
        <PopoverTrigger render={<Button variant="outline" />}>
          <Icon icon={FilterIcon} />
          Filter
          {rules.length > 0 ? (
            <span className="text-primary tabular-nums">{rules.length}</span>
          ) : null}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-xl gap-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Filters</span>
            <span className="text-muted-foreground">Every rule must match</span>
          </div>
          {draft.length === 0 ? (
            <p className="py-2 text-muted-foreground">No filters. Every play is shown.</p>
          ) : (
            draft.map((rule, index) => (
              <RuleRow
                key={`${index}-${rule.column}`}
                rule={rule}
                first={index === 0}
                onChange={(next) => commit(replace(draft, index, next))}
                onType={(next) => setDraft(replace(draft, index, next))}
                onCommit={() => commit(draft)}
                onRemove={() => commit(remove(draft, index))}
              />
            ))
          )}
          <div className="flex items-center border-t border-border pt-2">
            <Button variant="ghost" onClick={() => commit([...draft, fresh("track")])}>
              <Icon icon={Add01Icon} />
              Add rule
            </Button>
            <Button
              variant="ghost"
              disabled={draft.length === 0}
              onClick={() => commit([])}
              className="ml-auto"
            >
              Clear all
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {rules.map((rule, index) => (
        <span
          key={`${index}-${rule.column}`}
          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-muted/50 pr-0.5 pl-2 text-xs"
        >
          <span className="text-foreground">{rule.column}</span>
          <span className="text-muted-foreground">{OP_LABELS[rule.op]}</span>
          {needsValue(rule.op) ? <span className="text-primary">{rule.value || "…"}</span> : null}
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Remove filter"
            onClick={() => onRules(remove(rules, index))}
          >
            <Icon icon={Cancel01Icon} />
          </Button>
        </span>
      ))}
    </>
  );
};
