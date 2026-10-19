import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";
import { createContext, useContext } from "react";

import { Art } from "../art";

type Size = "sm" | "lg" | "xl";

const SizeContext = createContext<Size>("sm");

const artSizes = { sm: "md", lg: "xl", xl: "2xl" } as const;

type MediaProps = ComponentProps<"div"> & {
  // sm: a list row. lg: a featured item. xl: the head of a page.
  size?: Size;
};

const Root = ({ size = "sm", className, ...props }: MediaProps) => (
  <SizeContext.Provider value={size}>
    <div
      data-slot="media"
      data-size={size}
      className={cn("flex min-w-0 items-center gap-3 data-[size=xl]:gap-4", className)}
      {...props}
    />
  </SizeContext.Provider>
);

const MediaArt = (props: Omit<ComponentProps<typeof Art>, "size">) => {
  const size = useContext(SizeContext);
  return <Art size={artSizes[size]} {...props} />;
};

const Body = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="media-body"
    className={cn("flex min-h-9 min-w-0 flex-1 flex-col justify-center", className)}
    {...props}
  />
);

const titles = {
  sm: "truncate text-sm font-medium",
  lg: "truncate text-base font-semibold tracking-tight",
  xl: "truncate text-2xl font-bold tracking-tight",
} as const;

const Title = ({ className, ...props }: ComponentProps<"p">) => {
  const size = useContext(SizeContext);
  // The head of a page names the page.
  const Tag = size === "xl" ? "h1" : "p";
  return <Tag data-slot="media-title" className={cn(titles[size], className)} {...props} />;
};

const Sub = ({ className, ...props }: ComponentProps<"div">) => {
  const size = useContext(SizeContext);
  return (
    <div
      data-slot="media-sub"
      className={cn(
        "min-w-0 truncate text-muted-foreground",
        size === "xl" ? "text-sm" : "text-xs",
        className,
      )}
      {...props}
    />
  );
};

const End = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="media-end"
    className={cn("flex shrink-0 items-center gap-2", className)}
    {...props}
  />
);

export const Media = Object.assign(Root, { Art: MediaArt, Body, Title, Sub, End });
