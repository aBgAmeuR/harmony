import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";

type EmptyProps = ComponentProps<"div"> & {
  variant?: "plain" | "framed";
};

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
