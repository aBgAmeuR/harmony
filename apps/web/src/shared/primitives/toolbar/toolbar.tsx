import type { ComponentProps } from "react";

import { ArrowRightIcon, Icon } from "@harmony/icons";
import { cn } from "@harmony/ui/lib/utils";

const Root = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="toolbar"
    className={cn("flex flex-wrap items-center gap-2", className)}
    {...props}
  />
);

// Pushed to the end of the row.
const End = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="toolbar-end"
    className={cn("ml-auto flex items-center gap-2", className)}
    {...props}
  />
);

const Sep = ({ className }: { className?: string }) => (
  <Icon
    icon={ArrowRightIcon}
    aria-hidden
    className={cn("size-4 pt-0.5 text-muted-foreground", className)}
  />
);

export const Toolbar = Object.assign(Root, { End, Sep });
