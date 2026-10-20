import type { ComponentProps } from "react";

import { ScrollArea } from "@harmony/ui/components/scroll-area";
import { cn } from "@harmony/ui/lib/utils";

const Root = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="pane"
    className={cn("flex h-svh min-h-0 flex-col overflow-hidden", className)}
    {...props}
  />
);

const Header = ({ className, ...props }: ComponentProps<"header">) => (
  <header
    data-slot="pane-header"
    className={cn("flex shrink-0 items-center gap-1 px-4 py-2", className)}
    {...props}
  />
);

const Title = ({ className, ...props }: ComponentProps<"h1">) => (
  <h1 data-slot="pane-title" className={cn("font-semibold tracking-tight", className)} {...props} />
);

const widths = {
  full: "",
  lg: "mx-auto max-w-7xl p-4 pt-0",
  md: "mx-auto max-w-5xl p-4 pt-0",
} as const;

type BodyProps = ComponentProps<"div"> & {
  width?: keyof typeof widths;
};

const Body = ({ width = "full", className, ...props }: BodyProps) => (
  <ScrollArea data-slot="pane-body" className="min-h-0 flex-1 overflow-hidden">
    <div className={cn("rise-in w-full", widths[width], className)} {...props} />
  </ScrollArea>
);

export const Pane = Object.assign(Root, { Header, Title, Body });
