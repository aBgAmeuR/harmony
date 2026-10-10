import type { ComponentProps } from "react";

import { ArrowRightIcon, Icon } from "@harmony/icons";
import { cn } from "@harmony/ui/lib/utils";

export const Header = ({ className, ...props }: ComponentProps<"header">) => (
  <header
    data-slot="pane-header"
    className={cn("flex shrink-0 items-center gap-1 px-4 py-2", className)}
    {...props}
  />
);

export const Title = ({ className, ...props }: ComponentProps<"h4">) => (
  <h4 data-slot="pane-title" className={cn("font-semibold tracking-tight", className)} {...props} />
);

export const Sep = ({ className }: { className?: string }) => (
  <Icon icon={ArrowRightIcon} className={cn("size-4 pt-0.5 text-muted-foreground", className)} />
);

export const Actions = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="pane-actions"
    className={cn("ml-auto flex items-center gap-1", className)}
    {...props}
  />
);
