import type { ComponentProps } from "react";

import { ScrollArea } from "@harmony/ui/components/scroll-area";
import { cn } from "@harmony/ui/lib/utils";

export const Scroll = ({ className, ...props }: ComponentProps<typeof ScrollArea>) => (
  <ScrollArea
    data-slot="pane-scroll"
    className={cn("min-h-0 flex-1 overflow-hidden", className)}
    {...props}
  />
);
