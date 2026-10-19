import type { ComponentProps } from "react";

import { Icon, Cancel01Icon, Loading03Icon, Tick02Icon } from "@harmony/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";
import { cn } from "@harmony/ui/lib/utils";

import { format } from "@/utils/format";

type Status = "pending" | "running" | "done" | "error";

const Root = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="steps"
    className={cn(
      "flex flex-col divide-y divide-border/50 overflow-hidden rounded-lg border bg-card",
      className,
    )}
    {...props}
  />
);

const StatusIcon = ({ status }: { status: Status }) => {
  switch (status) {
    case "pending":
      return (
        <div className="grid size-4 place-items-center">
          <div className="size-1.5 rounded-full bg-muted-foreground/35" />
        </div>
      );
    case "running":
      return <Icon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />;
    case "done":
      return <Icon icon={Tick02Icon} strokeWidth={2} className="size-4 text-primary" />;
    case "error":
      return <Icon icon={Cancel01Icon} strokeWidth={2} className="size-4 text-destructive" />;
  }
};

type ItemProps = ComponentProps<"div"> & {
  status: Status;
};

// A step row, led by its status icon. Extra details, such as badges, go in as children.
const Item = ({ status, className, children, ...props }: ItemProps) => (
  <div
    data-slot="steps-item"
    data-status={status}
    className={cn(
      "group/step flex items-center px-3 py-2",
      status === "done" && "bg-muted/10",
      status === "running" && "bg-primary/5",
      status === "pending" && "opacity-50",
      className,
    )}
    {...props}
  >
    <StatusIcon status={status} />
    {children}
  </div>
);

const Label = ({ className, ...props }: ComponentProps<"span">) => (
  <span
    data-slot="steps-label"
    className={cn(
      "mx-3 min-w-0 flex-1 text-sm text-foreground group-data-[status=pending]/step:text-muted-foreground group-data-[status=running]/step:font-medium",
      className,
    )}
    {...props}
  />
);

type TimeProps = {
  start?: string;
  end?: string;
  // Clock of a running step, which has no end yet.
  now?: number;
};

const Time = ({ start, end, now }: TimeProps) => {
  const startMs = start ? new Date(start).getTime() : 0;
  const endMs = end ? new Date(end).getTime() : now;
  const ms = endMs !== undefined && Number.isFinite(startMs) ? Math.max(0, endMs - startMs) : 0;

  return (
    <Tooltip>
      <TooltipTrigger
        render={<span className="min-w-13 text-right text-xs text-muted-foreground tabular-nums" />}
      >
        {format.duration(ms)}
      </TooltipTrigger>
      <TooltipContent>
        <span>{format.time(start)}</span>
        {end ? (
          <>
            <span>-</span>
            <span>{format.time(end)}</span>
          </>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
};

export const Steps = Object.assign(Root, { Item, Label, Time });
