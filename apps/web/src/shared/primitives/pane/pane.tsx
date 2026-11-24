import type { ComponentProps } from "react";

import { ScrollArea } from "@harmony/ui/components/scroll-area";
import { cn } from "@harmony/ui/lib/utils";

const Root = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="pane"
    className={cn("flex h-svh min-h-0 flex-col overflow-hidden md:py-1 md:pr-1", className)}
    {...props}
  />
);

const Surface = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="pane-surface"
    className={cn(
      "flex h-full min-h-0 flex-col overflow-hidden bg-background md:rounded-md md:border md:border-border",
      className,
    )}
    {...props}
  />
);

const Header = ({ className, ...props }: ComponentProps<"header">) => (
  <header
    data-slot="pane-header"
    className={cn("flex shrink-0 items-center gap-1 px-3 py-2", className)}
    {...props}
  />
);

const Title = ({ className, ...props }: ComponentProps<"h1">) => (
  <h1 data-slot="pane-title" className={cn("font-semibold tracking-tight", className)} {...props} />
);

const widths = {
  full: "",
  column: "mx-auto max-w-3xl px-3 pt-4 pb-12",
  wide: "mx-auto max-w-5xl px-3 pt-4 pb-12",
} as const;

type BodyProps = ComponentProps<"div"> & {
  width?: keyof typeof widths;
};

const Body = ({ width = "full", className, ...props }: BodyProps) => (
  <ScrollArea data-slot="pane-body" className="min-h-0 flex-1 overflow-hidden">
    <div className={cn("rise-in w-full", widths[width], className)} {...props} />
  </ScrollArea>
);

export const Pane = Object.assign(Root, { Surface, Header, Title, Body });
