import { Cancel01Icon, FilterIcon, Icon, PlusSignIcon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Input } from "@harmony/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@harmony/ui/components/popover";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { Filter, Op } from "@/data/filter";

import { type Base } from "@/data/bases";
import { fields, isField, type FieldId } from "@/data/filter";
import { platformLabel } from "@/shared/lib/format";
import { Art } from "@/shared/primitives/art";

import type { ViewRule } from "./view";

import { baseQueries } from "./api";
import { isNumeric } from "./value";

// Fields a view can filter plays on, in menu order. Tracks are filtered from their own pages.
const FIELD_MENU: readonly FieldId[] = [
  "artist",
  "albumArtist",
  "album",
  "genre",
  "platform",
  "albumType",
  "releaseYear",
  "shuffle",
  "skipped",
  "offline",
];

type Kind = "pick" | "number" | "flag" | "percent";

const kindOf = (base: Base, field: string): Kind => {
  if (isField(field)) {
    const { type } = fields[field];
    if (type === "flag") return "flag";
    return type === "number" ? "number" : "pick";
  }
  return base.props[field]?.kind === "percent" ? "percent" : "number";
};

const labelOf = (base: Base, field: string): string =>
  isField(field) ? fields[field].label : (base.props[field]?.label ?? field);

const OP_WORD: Record<Op, string> = { is: "is", not: "is not", gt: ">", lt: "<" };

// "Artist is Daft Punk", "Streams > 10", "Not shuffle".
const ruleText = (base: Base, rule: ViewRule): string => {
  const label = labelOf(base, rule.field);
  const kind = kindOf(base, rule.field);
  if (kind === "flag") return rule.op === "not" ? `Not ${label.toLowerCase()}` : label;
  const shown =
    kind === "percent"
      ? `${Math.round(Number(rule.value) * 1000) / 10}%`
      : rule.field === "platform"
        ? platformLabel(String(rule.value))
        : (rule.label ?? String(rule.value));
  return `${label} ${OP_WORD[rule.op]} ${shown}`;
};

type FormProps = {
  base: Base;
  field: string;
  rule?: ViewRule;
  // The plays the view counts: values are listed from these.
  scope: Filter;
  onSave: (rule: ViewRule) => void;
};

const OpSwitch = ({ ops, op, onOp }: { ops: readonly Op[]; op: Op; onOp: (op: Op) => void }) => (
  <div className="flex gap-1">
    {ops.map((value) => (
      <Button
        key={value}
        size="sm"
        variant={value === op ? "secondary" : "ghost"}
        onClick={() => onOp(value)}
      >
        {OP_WORD[value]}
      </Button>
    ))}
  </div>
);

const RuleForm = ({ base, field, rule, scope, onSave }: FormProps) => {
  const kind = kindOf(base, field);
  const [op, setOp] = useState<Op>(rule?.op ?? (kind === "pick" || kind === "flag" ? "is" : "gt"));
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState(
    rule ? String(kind === "percent" ? Number(rule.value) * 100 : rule.value) : "",
  );
  const picking = kind === "pick" && isField(field);
  const { data: values = [] } = useQuery({
    ...baseQueries.values({ field: isField(field) ? field : "artist", search, filter: scope }),
    enabled: picking,
  });

  const label = labelOf(base, field);

  if (kind === "flag") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium">{label}</p>
        <OpSwitch
          ops={["is", "not"]}
          op={op}
          onOp={(next) => onSave({ field, op: next, value: true })}
        />
      </div>
    );
  }

  if (picking) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium">{label}</p>
          <OpSwitch ops={["is", "not"]} op={op} onOp={setOp} />
        </div>
        <Input
          autoFocus
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`Search ${label.toLowerCase()}...`}
        />
        <div className="flex max-h-64 flex-col overflow-y-auto">
          {values.map((value) => (
            <button
              key={value.value}
              type="button"
              onClick={() => onSave({ field, op, value: value.value, label: value.label })}
              className={cn(
                "flex items-center gap-2 rounded-sm px-1.5 py-1 text-left text-xs outline-none hover:bg-muted focus-visible:bg-muted",
                rule?.value === value.value && "text-primary",
              )}
            >
              {value.image !== null || field === "artist" || field === "album" ? (
                <Art src={value.image} alt={value.label} size="xs" />
              ) : null}
              <span className="truncate">{value.label}</span>
            </button>
          ))}
          {values.length === 0 ? (
            <p className="px-1.5 py-1 text-xs text-muted-foreground">Nothing found.</p>
          ) : null}
        </div>
      </div>
    );
  }

  const save = () => {
    const number = Number(amount);
    if (amount.trim() === "" || !Number.isFinite(number)) return;
    onSave({ field, op, value: kind === "percent" ? number / 100 : number });
  };

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium">{label}</p>
        <OpSwitch
          ops={kind === "number" && isField(field) ? ["is", "gt", "lt"] : ["gt", "lt"]}
          op={op}
          onOp={setOp}
        />
      </div>
      <div className="flex gap-2">
        <Input
          autoFocus
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder={kind === "percent" ? "Percent" : "Value"}
        />
        <Button type="submit">Apply</Button>
      </div>
    </form>
  );
};

type RulesProps = {
  base: Base;
  rules: readonly ViewRule[];
  // The plays the view counts: values are listed from these.
  scope: Filter;
  onRules: (rules: ViewRule[]) => void;
};

// The filter chips of a view: one per rule, each editable in place, plus "Filter" to add one.
export const Rules = ({ base, rules, scope, onRules }: RulesProps) => {
  const [adding, setAdding] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);

  const numericProps = Object.entries(base.props)
    .filter(([, prop]) => isNumeric(prop))
    .map(([name]) => name);

  return (
    <>
      {rules.map((rule, index) => (
        <Popover
          key={`${rule.field}-${index}`}
          open={editing === index}
          onOpenChange={(next) => setEditing(next ? index : null)}
        >
          <div className="flex h-7 items-center rounded-md bg-primary/15 text-xs text-primary">
            <PopoverTrigger className="h-full rounded-l-md pr-1 pl-2 outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring/50">
              {ruleText(base, rule)}
            </PopoverTrigger>
            <button
              type="button"
              aria-label="Remove filter"
              onClick={() => onRules(rules.filter((_, at) => at !== index))}
              className="flex h-full items-center rounded-r-md px-1 outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Icon icon={Cancel01Icon} className="size-3" />
            </button>
          </div>
          <PopoverContent align="start" className="w-64">
            <RuleForm
              base={base}
              field={rule.field}
              rule={rule}
              scope={scope}
              onSave={(next) => {
                onRules(rules.map((item, at) => (at === index ? next : item)));
                setEditing(null);
              }}
            />
          </PopoverContent>
        </Popover>
      ))}
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setAdding(null);
        }}
      >
        <PopoverTrigger render={<Button variant="ghost" />}>
          <Icon icon={rules.length > 0 ? PlusSignIcon : FilterIcon} />
          Filter
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          {adding ? (
            <RuleForm
              base={base}
              field={adding}
              scope={scope}
              onSave={(rule) => {
                onRules([...rules, rule]);
                setOpen(false);
                setAdding(null);
              }}
            />
          ) : (
            <div className="flex flex-col">
              <p className="px-1.5 pb-1 text-xs text-muted-foreground">Plays</p>
              {FIELD_MENU.map((field) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => setAdding(field)}
                  className="rounded-sm px-1.5 py-1 text-left text-xs outline-none hover:bg-muted focus-visible:bg-muted"
                >
                  {fields[field].label}
                </button>
              ))}
              <p className="px-1.5 pt-2 pb-1 text-xs text-muted-foreground">{base.title}</p>
              {numericProps.map((prop) => (
                <button
                  key={prop}
                  type="button"
                  onClick={() => setAdding(prop)}
                  className="rounded-sm px-1.5 py-1 text-left text-xs outline-none hover:bg-muted focus-visible:bg-muted"
                >
                  {base.props[prop]?.label}
                </button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
};
