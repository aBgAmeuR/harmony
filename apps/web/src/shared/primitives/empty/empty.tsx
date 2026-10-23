import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";

type EmptyProps = ComponentProps<"div"> & {
  // framed: in its own box, where the content would have been one.
  variant?: "plain" | "framed";
};

// Says why there is nothing to show, with an optional way out as a child.
export const Empty = ({ variant = "plain", className, ...props }: EmptyProps) => (
  <div
    data-slot="empty"
    data-variant={variant}
    className={cn(
      "flex flex-col items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground",
      variant === "framed" && "rounded-lg border border-border bg-card",
      className,
    )}
    {...props}
  />
);
