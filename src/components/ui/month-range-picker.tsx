"use client";

import * as React from "react";
import { format } from "date-fns/format";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Button, buttonVariants } from "./button";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const addMonths = (input: Date, months: number) => {
  const date = new Date(input);
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  date.setDate(
    Math.min(
      input.getDate(),
      getDaysInMonth(date.getFullYear(), date.getMonth() + 1)
    )
  );
  return date;
};
const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

type Month = {
  number: number;
  name: string;
  yearOffset: number;
};

const MONTHS: Month[][] = [
  [
    { number: 0, name: "Jan", yearOffset: 0 },
    { number: 1, name: "Feb", yearOffset: 0 },
    { number: 2, name: "Mar", yearOffset: 0 },
    { number: 3, name: "Apr", yearOffset: 0 },
    { number: 0, name: "Jan", yearOffset: 1 },
    { number: 1, name: "Feb", yearOffset: 1 },
    { number: 2, name: "Mar", yearOffset: 1 },
    { number: 3, name: "Apr", yearOffset: 1 }
  ],
  [
    { number: 4, name: "May", yearOffset: 0 },
    { number: 5, name: "Jun", yearOffset: 0 },
    { number: 6, name: "Jul", yearOffset: 0 },
    { number: 7, name: "Aug", yearOffset: 0 },
    { number: 4, name: "May", yearOffset: 1 },
    { number: 5, name: "Jun", yearOffset: 1 },
    { number: 6, name: "Jul", yearOffset: 1 },
    { number: 7, name: "Aug", yearOffset: 1 }
  ],
  [
    { number: 8, name: "Sep", yearOffset: 0 },
    { number: 9, name: "Oct", yearOffset: 0 },
    { number: 10, name: "Nov", yearOffset: 0 },
    { number: 11, name: "Dec", yearOffset: 0 },
    { number: 8, name: "Sep", yearOffset: 1 },
    { number: 9, name: "Oct", yearOffset: 1 },
    { number: 10, name: "Nov", yearOffset: 1 },
    { number: 11, name: "Dec", yearOffset: 1 }
  ]
];

const QUICK_SELECTORS: QuickSelector[] = [
  {
    label: "This year",
    startMonth: new Date(new Date().getFullYear(), 0),
    endMonth: new Date(new Date().getFullYear(), 11)
  },
  {
    label: "Last year",
    startMonth: new Date(new Date().getFullYear() - 1, 0),
    endMonth: new Date(new Date().getFullYear() - 1, 11)
  },
  {
    label: "Last 6 months",
    startMonth: new Date(addMonths(new Date(), -6)),
    endMonth: new Date()
  },
  {
    label: "Last 12 months",
    startMonth: new Date(addMonths(new Date(), -12)),
    endMonth: new Date()
  }
];

type QuickSelector = {
  label: string;
  startMonth: Date;
  endMonth: Date;
  variant?: ButtonVariant;
  onClick?: (selector: QuickSelector) => void;
};

type MonthRangeCalProps = {
  selectedMonthRange?: { start: Date; end: Date };
  onStartMonthSelect?: (date: Date) => void;
  onMonthRangeSelect?: ({ start, end }: { start: Date; end: Date }) => void;
  onYearForward?: () => void;
  onYearBackward?: () => void;
  callbacks?: {
    yearLabel?: (year: number) => string;
    monthLabel?: (month: Month) => string;
  };
  variant?: {
    calendar?: {
      main?: ButtonVariant;
      selected?: ButtonVariant;
    };
    chevrons?: ButtonVariant;
  };
  minDate?: Date;
  maxDate?: Date;
  quickSelectors?: QuickSelector[];
  showQuickSelectors?: boolean;
};

type ButtonVariant =
  | "default"
  | "outline"
  | "ghost"
  | "link"
  | "destructive"
  | "secondary"
  | null
  | undefined;

function MonthRangePicker({
  onMonthRangeSelect,
  onStartMonthSelect,
  callbacks,
  selectedMonthRange,
  onYearBackward,
  onYearForward,
  variant,
  minDate,
  maxDate,
  showQuickSelectors,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & MonthRangeCalProps) {
  const isMobile = useIsMobile();

  const buttonLabel = selectedMonthRange
    ? selectedMonthRange.start.getTime() === selectedMonthRange.end.getTime()
      ? format(selectedMonthRange.start, "MMM yyyy")
      : `${format(selectedMonthRange.start, "MMM yyyy")} - ${format(
          selectedMonthRange.end,
          "MMM yyyy"
        )}`
    : "Pick a month range";

  const selector: QuickSelector[] =
    minDate && maxDate
      ? [
          {
            label: "This year",
            startMonth:
              new Date(maxDate.getFullYear(), 0) > minDate
                ? new Date(maxDate.getFullYear(), 0)
                : minDate,
            endMonth:
              new Date(maxDate.getFullYear(), 11) > maxDate
                ? maxDate
                : new Date(maxDate.getFullYear(), 11)
          },
          {
            label: "Last year",
            startMonth:
              new Date(maxDate.getFullYear() - 1, 0) > minDate
                ? new Date(maxDate.getFullYear() - 1, 0)
                : minDate,
            endMonth:
              new Date(maxDate.getFullYear() - 1, 11) > maxDate
                ? maxDate
                : new Date(maxDate.getFullYear() - 1, 11)
          },
          {
            label: "Last 6 months",
            startMonth:
              new Date(addMonths(maxDate, -6)) > minDate
                ? new Date(addMonths(maxDate, -6))
                : minDate,
            endMonth: maxDate
          },
          {
            label: "Last 12 months",
            startMonth:
              new Date(addMonths(maxDate, -12)) > minDate
                ? new Date(addMonths(maxDate, -12))
                : minDate,
            endMonth: maxDate
          }
        ]
      : QUICK_SELECTORS;

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !selectedMonthRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {buttonLabel}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Select a month range</DrawerTitle>
            <DrawerDescription>
              Select a range of months to filter the data.
            </DrawerDescription>
          </DrawerHeader>
          <div className={cn("min-w-[300px]  p-3", className)} {...props}>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <div className="w-full">
                <MonthRangeCal
                  onMonthRangeSelect={onMonthRangeSelect}
                  onStartMonthSelect={onStartMonthSelect}
                  callbacks={callbacks}
                  selectedMonthRange={selectedMonthRange}
                  onYearBackward={onYearBackward}
                  onYearForward={onYearForward}
                  variant={variant}
                  minDate={minDate}
                  maxDate={maxDate}
                  quickSelectors={selector}
                  showQuickSelectors={showQuickSelectors}
                ></MonthRangeCal>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button>Close</Button>
            </DrawerClose>
          </DrawerFooter>
          <DrawerClose />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !selectedMonthRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className={cn("min-w-[400px]  p-3", className)} {...props}>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <div className="w-full">
              <MonthRangeCal
                onMonthRangeSelect={onMonthRangeSelect}
                onStartMonthSelect={onStartMonthSelect}
                callbacks={callbacks}
                selectedMonthRange={selectedMonthRange}
                onYearBackward={onYearBackward}
                onYearForward={onYearForward}
                variant={variant}
                minDate={minDate}
                maxDate={maxDate}
                quickSelectors={selector}
                showQuickSelectors={showQuickSelectors}
              ></MonthRangeCal>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MonthRangeCal({
  selectedMonthRange,
  onMonthRangeSelect,
  onStartMonthSelect,
  callbacks,
  variant,
  minDate,
  maxDate,
  quickSelectors,
  showQuickSelectors = true,
  onYearBackward,
  onYearForward
}: MonthRangeCalProps) {
  const [startYear, setStartYear] = React.useState<number>(
    selectedMonthRange?.start.getFullYear() ?? new Date().getFullYear()
  );
  const [startMonth, setStartMonth] = React.useState<number>(
    selectedMonthRange?.start?.getMonth() ?? new Date().getMonth()
  );
  const [endYear, setEndYear] = React.useState<number>(
    selectedMonthRange?.end?.getFullYear() ?? new Date().getFullYear() + 1
  );
  const [endMonth, setEndMonth] = React.useState<number>(
    selectedMonthRange?.end?.getMonth() ?? new Date().getMonth()
  );
  const [rangePending, setRangePending] = React.useState<boolean>(false);
  const [endLocked, setEndLocked] = React.useState<boolean>(true);
  const [menuYear, setMenuYear] = React.useState<number>(startYear);

  if (minDate && maxDate && minDate > maxDate) minDate = maxDate;

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="min-w-[300px] space-y-4">
        <div className="relative flex items-center justify-evenly pt-1">
          <div className="text-sm font-medium">
            {callbacks?.yearLabel ? callbacks?.yearLabel(menuYear) : menuYear}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setMenuYear(menuYear - 1);
                if (onYearBackward) onYearBackward();
              }}
              className={cn(
                buttonVariants({ variant: variant?.chevrons ?? "outline" }),
                "absolute left-1 inline-flex size-7 items-center justify-center p-0"
              )}
            >
              <ChevronLeft className="size-4 opacity-50" />
            </button>
            <button
              onClick={() => {
                setMenuYear(menuYear + 1);
                if (onYearForward) onYearForward();
              }}
              className={cn(
                buttonVariants({ variant: variant?.chevrons ?? "outline" }),
                "absolute right-1 inline-flex size-7 items-center justify-center p-0"
              )}
            >
              <ChevronRight className="size-4 opacity-50" />
            </button>
          </div>
          <div className="text-sm font-medium">
            {callbacks?.yearLabel
              ? callbacks?.yearLabel(menuYear + 1)
              : menuYear + 1}
          </div>
        </div>
        <table className="w-full border-collapse space-y-1">
          <tbody>
            {MONTHS.map((monthRow, a) => {
              return (
                <tr key={"row-" + a} className="mt-2 flex w-full">
                  {monthRow.map((m, i) => {
                    return (
                      <td
                        key={m.number + "-" + m.yearOffset}
                        className={cn(
                          cn(
                            cn(
                              cn(
                                "relative h-10 w-1/4 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                                (menuYear + m.yearOffset > startYear ||
                                  (menuYear + m.yearOffset == startYear &&
                                    m.number > startMonth)) &&
                                  (menuYear + m.yearOffset < endYear ||
                                    (menuYear + m.yearOffset == endYear &&
                                      m.number < endMonth)) &&
                                  (rangePending || endLocked)
                                  ? "bg-accent text-accent-foreground"
                                  : ""
                              ),
                              menuYear + m.yearOffset == startYear &&
                                m.number == startMonth &&
                                (rangePending || endLocked)
                                ? "rounded-l-md bg-accent text-accent-foreground"
                                : ""
                            ),
                            menuYear + m.yearOffset == endYear &&
                              m.number == endMonth &&
                              (rangePending || endLocked) &&
                              menuYear + m.yearOffset >= startYear &&
                              m.number >= startMonth
                              ? "rounded-r-md bg-accent text-accent-foreground"
                              : ""
                          ),
                          i == 3 ? "mr-2" : i == 4 ? "ml-2" : ""
                        )}
                        onMouseEnter={() => {
                          if (rangePending && !endLocked) {
                            setEndYear(menuYear + m.yearOffset);
                            setEndMonth(m.number);
                          }
                        }}
                      >
                        <button
                          onClick={() => {
                            if (rangePending) {
                              if (
                                menuYear + m.yearOffset < startYear ||
                                (menuYear + m.yearOffset == startYear &&
                                  m.number < startMonth)
                              ) {
                                setRangePending(true);
                                setEndLocked(false);
                                setStartMonth(m.number);
                                setStartYear(menuYear + m.yearOffset);
                                setEndYear(menuYear + m.yearOffset);
                                setEndMonth(m.number);
                                if (onStartMonthSelect)
                                  onStartMonthSelect(
                                    new Date(menuYear + m.yearOffset, m.number)
                                  );
                              } else {
                                setRangePending(false);
                                setEndLocked(true);
                                // Event fire data selected

                                if (onMonthRangeSelect)
                                  onMonthRangeSelect({
                                    start: new Date(startYear, startMonth),
                                    end: new Date(
                                      menuYear + m.yearOffset,
                                      m.number
                                    )
                                  });
                              }
                            } else {
                              setRangePending(true);
                              setEndLocked(false);
                              setStartMonth(m.number);
                              setStartYear(menuYear + m.yearOffset);
                              setEndYear(menuYear + m.yearOffset);
                              setEndMonth(m.number);
                              if (onStartMonthSelect)
                                onStartMonthSelect(
                                  new Date(menuYear + m.yearOffset, m.number)
                                );
                            }
                          }}
                          disabled={
                            (maxDate
                              ? menuYear + m.yearOffset >
                                  maxDate?.getFullYear() ||
                                (menuYear + m.yearOffset ==
                                  maxDate?.getFullYear() &&
                                  m.number > maxDate.getMonth())
                              : false) ||
                            (minDate
                              ? menuYear + m.yearOffset <
                                  minDate?.getFullYear() ||
                                (menuYear + m.yearOffset ==
                                  minDate?.getFullYear() &&
                                  m.number < minDate.getMonth())
                              : false)
                          }
                          className={cn(
                            buttonVariants({
                              variant:
                                (startMonth == m.number &&
                                  menuYear + m.yearOffset == startYear) ||
                                (endMonth == m.number &&
                                  menuYear + m.yearOffset == endYear &&
                                  !rangePending)
                                  ? (variant?.calendar?.selected ?? "default")
                                  : (variant?.calendar?.main ?? "ghost")
                            }),
                            "size-full p-0 font-normal aria-selected:opacity-100"
                          )}
                        >
                          {callbacks?.monthLabel
                            ? callbacks.monthLabel(m)
                            : m.name}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showQuickSelectors ? (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 md:grid-cols-1 md:grid-rows-4">
          {quickSelectors?.map((s) => {
            return (
              <Button
                onClick={() => {
                  setStartYear(s.startMonth.getFullYear());
                  setStartMonth(s.startMonth.getMonth());
                  setEndYear(s.endMonth.getFullYear());
                  setEndMonth(s.endMonth.getMonth());
                  setRangePending(false);
                  setEndLocked(true);
                  if (onMonthRangeSelect)
                    onMonthRangeSelect({
                      start: s.startMonth,
                      end: s.endMonth
                    });
                  if (s.onClick) s.onClick(s);
                }}
                key={s.label}
                variant={s.variant ?? "outline"}
              >
                {s.label}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

MonthRangePicker.displayName = "MonthRangePicker";

export { MonthRangePicker };
