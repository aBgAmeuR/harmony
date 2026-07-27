import type { ComponentProps } from "react";

import { ScrollArea as ScrollAreaPrimitive } from "@harmony/ui/components/scroll-area";
import { cn } from "@harmony/ui/lib/utils";

type PaneScrollAreaProps = ComponentProps<typeof ScrollAreaPrimitive>;

export function PaneScrollArea({ className, ...props }: PaneScrollAreaProps) {
  return (
    <ScrollAreaPrimitive className={cn("min-h-0 flex-1 overflow-hidden", className)} {...props} />
  );
}
