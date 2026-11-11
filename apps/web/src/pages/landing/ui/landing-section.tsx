import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";

import { useStaggerReveal } from "./use-stagger-reveal";

export const COLUMN = "mx-auto w-full max-w-lg";

// App widgets are laid out for a wider column: past phone width they are drawn at 75%, so
// they keep their app layout in it. Zoom, unlike a scale transform, also shrinks the room
// they take. Tailwind has no zoom utility. Chart tooltips are placed in viewport pixels, so
// they undo the zoom to land on the pointer.
export const SHRINK = "sm:[zoom:0.75] sm:[&_[data-ts-chart-tooltip-portal]]:[zoom:calc(4/3)]";

const Root = ({ className, ...props }: ComponentProps<"section">) => {
  const { ref, isShown } = useStaggerReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      className={cn("t-stagger flex flex-col", COLUMN, isShown && "is-shown", className)}
      {...props}
    />
  );
};

const Title = ({ className, ...props }: ComponentProps<"h2">) => (
  <h2
    className={cn(
      "t-stagger-line t-stagger-line--1 text-sm font-medium text-foreground",
      className,
    )}
    {...props}
  />
);

const Text = ({ className, ...props }: ComponentProps<"p">) => (
  <p
    className={cn(
      "t-stagger-line t-stagger-line--2 mt-1 max-w-lg text-sm text-pretty text-muted-foreground",
      className,
    )}
    {...props}
  />
);

const Body = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cn("t-stagger-line t-stagger-line--3 mt-4", className)} {...props} />
);

const Em = ({ className, ...props }: ComponentProps<"span">) => (
  <span className={cn("font-medium text-foreground", className)} {...props} />
);

export const LINK = "rounded-sm text-primary underline-offset-2 hover:underline";

const ExternalLink = ({ className, ...props }: ComponentProps<"a">) => (
  <a target="_blank" rel="noopener noreferrer" className={cn(LINK, className)} {...props} />
);

export const LandingSection = Object.assign(Root, {
  Title,
  Text,
  Body,
  Em,
  ExternalLink,
});
