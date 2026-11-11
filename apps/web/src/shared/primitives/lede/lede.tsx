import type { ComponentProps } from "react";

import { Skeleton } from "@harmony/ui/components/skeleton";
import { cn } from "@harmony/ui/lib/utils";

const Root = ({ className, ...props }: ComponentProps<"header">) => (
  <header data-slot="lede" className={cn("flex min-w-0 flex-col gap-1", className)} {...props} />
);

const Kicker = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="lede-kicker"
    className={cn("flex min-h-7 items-center gap-2 text-xs text-muted-foreground", className)}
    {...props}
  />
);

const Title = ({ className, ...props }: ComponentProps<"p">) => (
  <p
    data-slot="lede-title"
    className={cn("text-xl font-semibold tracking-tight text-pretty tabular-nums", className)}
    {...props}
  />
);

const Text = ({ className, ...props }: ComponentProps<"p">) => (
  <p
    data-slot="lede-text"
    className={cn("text-sm text-pretty text-muted-foreground tabular-nums", className)}
    {...props}
  />
);

const Em = ({ className, ...props }: ComponentProps<"span">) => (
  <span data-slot="lede-em" className={cn("font-medium text-foreground", className)} {...props} />
);

const Pending = () => (
  <>
    <Skeleton className="h-7 w-2/3" />
    <Skeleton className="h-5 w-1/2" />
  </>
);

export const Lede = Object.assign(Root, { Kicker, Title, Text, Em, Pending });
