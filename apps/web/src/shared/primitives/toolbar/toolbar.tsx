import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";

const Root = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="toolbar"
    className={cn("flex flex-wrap items-center gap-2", className)}
    {...props}
  />
);

const End = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="toolbar-end"
    className={cn("ml-auto flex items-center gap-2", className)}
    {...props}
  />
);

export const Toolbar = Object.assign(Root, { End });
