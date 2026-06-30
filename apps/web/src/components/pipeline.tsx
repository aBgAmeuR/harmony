import type { PropsWithChildren } from "react";

import { Icon, Cancel01Icon, Loading03Icon, Tick02Icon } from "@harmony/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@harmony/ui/components/tooltip";
import { cn } from "@harmony/ui/lib/utils";

import { format } from "@/utils/format";

const PipelineItem = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return (
    <div className={cn("flex items-center px-3 py-2", className)}>
      {children}
    </div>
  );
};

const PipelineItemHeader = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return <div className={cn("flex items-center", className)}>{children}</div>;
};

const PipelineItemIcon = ({
  status,
}: {
  status: "pending" | "running" | "done" | "error";
}) => {
  switch (status) {
    case "pending":
      return (
        <div className="grid size-4 place-items-center">
          <div className="size-1.5 rounded-full bg-muted-foreground/35" />
        </div>
      );
    case "running":
      return (
        <Icon
          icon={Loading03Icon}
          strokeWidth={2}
          className="size-4 animate-spin"
        />
      );
    case "done":
      return (
        <Icon
          icon={Tick02Icon}
          strokeWidth={2}
          className="size-4 text-primary"
        />
      );
    case "error":
      return (
        <Icon
          icon={Cancel01Icon}
          strokeWidth={2}
          className="size-4 text-destructive"
        />
      );
    default:
      return null;
  }
};

const PipelineItemLabel = ({
  label,
  className,
}: {
  label: string;
  className?: string;
}) => {
  return (
    <span
      className={cn("mx-3 flex-1 min-w-0 text-sm text-foreground", className)}
    >
      {label}
    </span>
  );
};

const PipelineItemDuration = ({
  startAt,
  endAt,
  now,
}: {
  startAt?: string;
  endAt?: string;
  now?: number;
}) => {
  const startMs = startAt ? new Date(startAt).getTime() : 0;
  const endMs = endAt ? new Date(endAt).getTime() : now;
  const durationMs =
    endMs !== undefined && Number.isFinite(startMs)
      ? Math.max(0, endMs - startMs)
      : 0;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="min-w-[52px] text-right text-xs text-muted-foreground tabular-nums" />
        }
      >
        {format.duration(durationMs)}
      </TooltipTrigger>
      <TooltipContent>
        <span>{format.time(startAt)}</span>
        {endAt ? (
          <>
            <span>-</span>
            <span>{format.time(endAt)}</span>
          </>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
};

export {
  PipelineItem,
  PipelineItemHeader,
  PipelineItemIcon,
  PipelineItemLabel,
  PipelineItemDuration,
};
