import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";

type SectionProps = ComponentProps<"section"> & {
  // sm: a quiet label above a box, md: a titled block, lg: a chapter of a page, set apart by a
  // hairline above it.
  size?: "sm" | "md" | "lg";
};

const Root = ({ size = "md", className, ...props }: SectionProps) => (
  <section
    data-slot="section"
    data-size={size}
    className={cn(
      "group/section flex min-w-0 flex-col gap-1 data-[size=lg]:gap-3 data-[size=lg]:border-t data-[size=lg]:border-border data-[size=lg]:pt-8 data-[size=sm]:gap-1.5",
      className,
    )}
    {...props}
  />
);

const Head = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="section-head"
    className={cn("flex min-h-7 items-center gap-2", className)}
    {...props}
  />
);

const Title = ({ className, ...props }: ComponentProps<"h2">) => (
  <h2
    data-slot="section-title"
    className={cn(
      "text-sm font-semibold group-data-[size=lg]/section:text-base group-data-[size=lg]/section:tracking-tight group-data-[size=sm]/section:text-xs group-data-[size=sm]/section:font-normal group-data-[size=sm]/section:text-muted-foreground",
      className,
    )}
    {...props}
  />
);

// One or two sentences under the title that say what the block shows. `strong` stands out.
const Text = ({ className, ...props }: ComponentProps<"p">) => (
  <p
    data-slot="section-text"
    className={cn(
      "text-sm text-pretty text-muted-foreground tabular-nums [&_strong]:font-medium [&_strong]:text-foreground",
      className,
    )}
    {...props}
  />
);

const Action = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="section-action"
    className={cn("ml-auto flex items-center gap-2 text-sm text-muted-foreground", className)}
    {...props}
  />
);

export const Section = Object.assign(Root, { Head, Title, Text, Action });
