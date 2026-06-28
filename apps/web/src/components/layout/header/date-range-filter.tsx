import { Icon, ArrowLeft01Icon, ArrowRight01Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { ButtonGroup } from "@harmony/ui/components/button-group";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@harmony/ui/components/dialog";
import { MonthPicker } from "@harmony/ui/components/month-picker";
import { Skeleton } from "@harmony/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@harmony/ui/components/tabs";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";

import { query } from "@/lib/query";
import {
  DateRangeMode,
  useDateRangeStore,
  useInstantRangeQuery,
} from "@/lib/stores/date-range-store";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const isDateInRange = (date: Date, startDate?: Date, endDate?: Date) => {
  const timestamp = date.getTime();
  return timestamp >= (startDate?.getTime() || 0) && timestamp <= (endDate?.getTime() || 0);
};

export const DateRangeFilter = () => {
  const mode = useDateRangeStore((s) => s.mode);
  const setMode = useDateRangeStore((s) => s.setMode);
  const step = useDateRangeStore((s) => s.step);
  const setCursor = useDateRangeStore((s) => s.setCursor);
  const { from, to } = useInstantRangeQuery();

  const { data: monthlyListens, isLoading } = useQuery(
    query.interactions.monthlyListens.queryOptions(),
  );

  const maxCount = Math.max(...(monthlyListens?.map((item) => item.value) ?? []));

  return (
    <ButtonGroup>
      {mode !== "custom" && (
        <Button size="icon" variant="secondary" onClick={() => step(-1)}>
          <Icon icon={ArrowLeft01Icon} />
        </Button>
      )}

      <Dialog>
        <DialogTrigger render={<Button variant="secondary" />}>
          {mode === "month" && `${MONTHS[from.getMonth()]} ${from.getFullYear()}`}
          {mode === "year" && `${from.getFullYear()}`}
          {mode === "custom" &&
            `${new Date(from).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${new Date(to).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
        </DialogTrigger>
        <DialogContent className="p-0" showCloseButton={false}>
          <Tabs value={mode} onValueChange={(value) => setMode(value as DateRangeMode)}>
            <div className="border-b bg-muted/50 px-3.5 py-1.5">
              <TabsList className="w-full bg-transparent p-0.5">
                <TabsTrigger value="month" className="dark:data-active:bg-background">
                  Month
                </TabsTrigger>
                <TabsTrigger value="year" className="dark:data-active:bg-background">
                  Year
                </TabsTrigger>
                <TabsTrigger value="custom" className="dark:data-active:bg-background">
                  Custom
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="border-b px-4 py-2">
              {isLoading ? (
                <div className="flex h-16 w-full items-end">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <div className="flex h-16 w-full items-end" aria-hidden="true">
                  {monthlyListens?.map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-1 justify-center"
                      style={{ height: `${(item.value / maxCount) * 100}%` }}
                    >
                      <span
                        className={cn(
                          "size-full bg-primary/20",
                          isDateInRange(new Date(`${item.label}-01`), from, to) && "bg-primary/50",
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <TabsContent value="month" className="px-4 py-2">
              <MonthPicker
                onMonthSelect={(date) => setCursor(date)}
                selectedMonth={from}
                className="w-full p-0"
              />
            </TabsContent>
            <TabsContent value="year" className="px-4 py-2">
              <pre>{JSON.stringify({ from, to }, null, 2)}</pre>
            </TabsContent>
            <TabsContent value="custom" className="px-4 py-2">
              <pre>{JSON.stringify({ from, to }, null, 2)}</pre>
            </TabsContent>
          </Tabs>

          <DialogFooter className="m-0">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {mode !== "custom" && (
        <Button size="icon" variant="secondary" onClick={() => step(1)}>
          <Icon icon={ArrowRight01Icon} />
        </Button>
      )}
    </ButtonGroup>
  );
};
