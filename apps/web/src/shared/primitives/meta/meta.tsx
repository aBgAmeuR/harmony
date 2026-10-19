import { cn } from "@harmony/ui/lib/utils";
import { Children, Fragment, type ComponentProps } from "react";

// Inline details split by "·". Empty children are skipped.
export const Meta = ({ className, children, ...props }: ComponentProps<"span">) => (
  <span
    data-slot="meta"
    className={cn("inline-flex min-w-0 flex-wrap items-center gap-x-1", className)}
    {...props}
  >
    {Children.toArray(children).map((child, index) => (
      <Fragment key={index}>
        {index > 0 ? <span aria-hidden>·</span> : null}
        {child}
      </Fragment>
    ))}
  </span>
);
