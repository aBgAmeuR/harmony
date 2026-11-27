import { Icon, Menu08Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuFilter,
  DropdownMenuInput,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuList,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@harmony/ui/components/dropdown-menu";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import type { Filter, Rule } from "@/data/filter";

import { fields, type FieldId } from "@/data/filter";
import { Art } from "@/shared/primitives/art";

import { baseQueries } from "./api";
import { oneOf, type View, type ViewRule, type ViewState } from "./view";

const SECTIONS = ["Listening", "Behaviour", "Dates"] as const;

const SECTION_OF = {
  count: "Listening",
  compact: "Listening",
  minutes: "Listening",
  ratio: "Listening",
  percent: "Behaviour",
  date: "Dates",
  text: null,
  flag: null,
} as const;

const PICKERS = ["artist", "album", "genre"] as const;

const FLAGS = {
  shuffle: ["Shuffle on", "Shuffle off"],
  skipped: ["Only skipped", "Not skipped"],
  offline: ["Only offline", "Not offline"],
} as const;

type EntryProps = {
  label: string;
  value?: string;
  set?: boolean;
  className?: string;
  children: ReactNode;
};

const Entry = ({ label, value, set, className, children }: EntryProps) => (
  <DropdownMenuSub>
    <DropdownMenuSubTrigger className="cursor-pointer">
      <span className="flex-1">{label}</span>
      <span className={cn("text-muted-foreground", set && "text-primary")}>{value ?? "Any"}</span>
    </DropdownMenuSubTrigger>
    <DropdownMenuSubContent className={cn("w-48", className)}>{children}</DropdownMenuSubContent>
  </DropdownMenuSub>
);

const summary = ([first, ...rest]: readonly ViewRule[]) => {
  if (!first) return undefined;
  if (rest.length > 0) return `${rest.length + 1} selected`;
  return first.label ?? String(first.value);
};

type ValuesProps = {
  field: FieldId;
  rules: readonly ViewRule[];
  scope: Filter;
  search?: string;
  any: string;
  onRules: (rules: ViewRule[]) => void;
};

const Values = ({ field, rules, scope, search = "", any, onRules }: ValuesProps) => {
  const { data: values = [] } = useQuery(baseQueries.values({ field, search, filter: scope }));
  const picked = new Set(rules.map((rule) => String(rule.value)));
  const missing =
    search === ""
      ? rules.filter((rule) => !values.some((value) => String(value.value) === String(rule.value)))
      : [];
  const shown = [
    ...missing.map((rule) => ({
      value: rule.value,
      label: rule.label ?? String(rule.value),
      image: null,
    })),
    ...values,
  ];

  return (
    <>
      {search === "" ? (
        <DropdownMenuCheckboxItem
          checked={rules.length === 0}
          onCheckedChange={() => onRules([])}
          className="cursor-pointer"
        >
          {any}
        </DropdownMenuCheckboxItem>
      ) : null}
      {shown.map((value) => (
        <DropdownMenuCheckboxItem
          key={String(value.value)}
          checked={picked.has(String(value.value))}
          onCheckedChange={(checked) =>
            onRules(
              checked
                ? [...rules, { field, op: "is", value: value.value, label: value.label }]
                : rules.filter((rule) => String(rule.value) !== String(value.value)),
            )
          }
          className="cursor-pointer"
        >
          {value.image !== null || field === "artist" || field === "album" ? (
            <Art src={value.image} alt={value.label} size="xs" />
          ) : null}
          <span className="truncate">{value.label}</span>
        </DropdownMenuCheckboxItem>
      ))}
    </>
  );
};

type PickerProps = {
  field: FieldId;
  rules: readonly ViewRule[];
  scope: Filter;
  onRules: (rules: ViewRule[]) => void;
};

const Picker = ({ field, rules, scope, onRules }: PickerProps) => {
  const [search, setSearch] = useState("");
  const label = fields[field].label;
  const value = summary(rules);

  return (
    <DropdownMenuFilter value={search} onValueChange={setSearch} filter={null}>
      <Entry label={label} value={value} set={value !== undefined} className="w-60">
        <DropdownMenuInput
          aria-label={`Search ${label.toLowerCase()}s`}
          placeholder={`Search ${label.toLowerCase()}s...`}
        />
        <DropdownMenuList>
          <Values
            field={field}
            rules={rules}
            scope={scope}
            search={search.trim()}
            any="Any"
            onRules={onRules}
          />
        </DropdownMenuList>
      </Entry>
    </DropdownMenuFilter>
  );
};

type Props = {
  view: View;
  scope: Filter;
  fixed: readonly Rule[];
  onChange: (patch: ViewState) => void;
};

export const FilterMenu = ({ view, scope, fixed, onChange }: Props) => {
  const props = Object.entries(view.base.props);
  const sorted = view.base.props[view.sort];
  const order =
    sorted?.kind === "date"
      ? { desc: "Newest first", asc: "Oldest first" }
      : { desc: "Highest first", asc: "Lowest first" };

  const shown = (field: FieldId) => !fixed.some((rule) => rule.field === field);
  const of = (field: FieldId) => view.rules.filter((rule) => rule.field === field);
  const set = (field: FieldId) => (next: ViewRule[]) => {
    const rules = [...view.rules.filter((rule) => rule.field !== field), ...next];
    onChange({ rules: rules.length > 0 ? rules : undefined });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Sort and filter" className="relative" />
        }
      >
        <Icon icon={Menu08Icon} />
        {view.rules.length > 0 ? (
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" />
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <Entry label="Sort by" value={sorted?.label} className="w-44">
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
                    <DropdownMenuRadioItem key={name} value={name} className="cursor-pointer">
                      {prop.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              )
            );
          })}
        </Entry>
        <Entry label="Order" value={view.desc ? order.desc : order.asc}>
          <DropdownMenuRadioGroup
            value={view.desc ? "desc" : "asc"}
            onValueChange={(dir) => onChange({ desc: dir === "desc" })}
          >
            {Object.entries(order).map(([dir, label]) => (
              <DropdownMenuRadioItem key={dir} value={dir} className="cursor-pointer">
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </Entry>
        <DropdownMenuSeparator />
        {PICKERS.filter(shown).map((field) => (
          <Picker key={field} field={field} rules={of(field)} scope={scope} onRules={set(field)} />
        ))}
        <DropdownMenuSeparator />
        {(["platform", "releaseDecade"] as const).map((field) => (
          <Entry
            key={field}
            label={fields[field].label}
            value={summary(of(field)) ?? "All"}
            set={of(field).length > 0}
          >
            <Values field={field} rules={of(field)} scope={scope} any="All" onRules={set(field)} />
          </Entry>
        ))}
        <DropdownMenuSeparator />
        {(["shuffle", "skipped", "offline"] as const).map((field) => {
          const [rule] = of(field);
          const [on, off] = FLAGS[field];
          return (
            <Entry
              key={field}
              label={fields[field].label}
              value={rule ? (rule.op === "not" ? off : on) : undefined}
              set={rule !== undefined}
            >
              <DropdownMenuRadioGroup
                value={rule?.op ?? ""}
                onValueChange={(next) => {
                  const op = oneOf(["is", "not"] as const, next);
                  set(field)(op ? [{ field, op, value: true }] : []);
                }}
              >
                <DropdownMenuRadioItem value="" className="cursor-pointer">
                  Any
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="is" className="cursor-pointer">
                  {on}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="not" className="cursor-pointer">
                  {off}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </Entry>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={view.rules.length === 0}
          onClick={() => onChange({ rules: undefined })}
          className="cursor-pointer"
        >
          Clear filters
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
