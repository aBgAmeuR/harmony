import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@harmony/ui/components/tooltip";
import { cn } from "@harmony/ui/lib/utils";
import { Icon, Cancel01Icon, Loading03Icon, Tick02Icon } from "@harmony/icons";
import type { PropsWithChildren } from "react";
import { format } from "@/utils/format";

const PipelineItem = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return <div className={cn("px-3", className)}>{children}</div>;
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
  status: "pending" | "loading" | "done" | "error";
}) => {
  switch (status) {
    case "pending":
      return (
        <div className="grid size-4 place-items-center">
          <div className="size-1.5 rounded-full bg-muted-foreground/35" />
        </div>
      );
    case "loading":
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
      className={cn("min-w-0 flex-1 text-sm text-foreground ml-3", className)}
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
  startAt: string;
  endAt?: string;
  now?: number;
}) => {
  const startMs = new Date(startAt).getTime();
  const endMs = endAt ? new Date(endAt).getTime() : now;
  const durationMs =
    endMs !== undefined && Number.isFinite(startMs)
      ? Math.max(0, endMs - startMs)
      : 0;

  return (
    <Tooltip>
      <TooltipTrigger>
        <span className="min-w-[52px] text-right text-xs tabular-nums text-muted-foreground">
          {format.duration(durationMs)}
        </span>
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

const PipelineItemContent = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return (
    <div className={cn("ms-7 text-xs text-muted-foreground", className)}>
      {children}
    </div>
  );
};

export {
  PipelineItem,
  PipelineItemHeader,
  PipelineItemIcon,
  PipelineItemLabel,
  PipelineItemDuration,
  PipelineItemContent,
};
