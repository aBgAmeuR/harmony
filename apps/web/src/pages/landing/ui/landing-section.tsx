import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";

import { useStaggerReveal } from "./use-stagger-reveal";

const Root = ({ className, ...props }: ComponentProps<"section">) => {
  const { ref, isShown } = useStaggerReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      className={cn("t-stagger flex flex-col gap-7", isShown && "is-shown", className)}
      {...props}
    />
  );
};

const Title = ({ className, ...props }: ComponentProps<"h2">) => (
  <h2
    className={cn(
      "t-stagger-line t-stagger-line--1 text-2xl font-bold tracking-tight text-foreground",
      className,
    )}
    {...props}
  />
);

const Em = ({ className, ...props }: ComponentProps<"span">) => (
  <span className={cn("text-foreground", className)} {...props} />
);

const ExternalLink = ({ className, ...props }: ComponentProps<"a">) => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      "rounded-sm text-foreground underline decoration-foreground/30 underline-offset-3 transition-colors hover:decoration-foreground",
      className,
    )}
    {...props}
  />
);

export const LandingSection = Object.assign(Root, {
  Title,
  Em,
  ExternalLink,
});
