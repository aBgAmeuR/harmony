import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";

type SectionProps = ComponentProps<"section"> & {
  // sm: a quiet label above a box, md: a titled block.
  size?: "sm" | "md";
};

const Root = ({ size = "md", className, ...props }: SectionProps) => (
  <section
    data-slot="section"
    data-size={size}
    className={cn("group/section flex min-w-0 flex-col gap-2 data-[size=sm]:gap-1.5", className)}
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
      "text-sm font-semibold group-data-[size=sm]/section:text-xs group-data-[size=sm]/section:font-normal group-data-[size=sm]/section:text-muted-foreground",
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

export const Section = Object.assign(Root, { Head, Title, Action });
