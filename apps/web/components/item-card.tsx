import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { cn } from "@repo/ui/lib/utils";
import { format } from "light-date";
import { Clock, ExternalLink, Music2 } from "lucide-react";
import Image from "next/image";

const ItemCard = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    layout?: "grid" | "list";
  }
>(({ className, layout = "list", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      layout === "list" ? "flex items-center space-x-4 py-4" : "",
      className,
    )}
    {...props}
  />
));
ItemCard.displayName = "ItemCard";

const ItemCardRank = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "w-6 text-right text-sm font-medium text-muted-foreground",
      className,
    )}
    {...props}
  />
));
ItemCardRank.displayName = "ItemCardRank";

const ItemCardImage = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
    src?: string;
    alt?: string;
    layout?: "grid" | "list";
  }
>(({ className, src, alt, layout = "list", ...props }, ref) => (
  <div ref={ref} {...props}>
    <Avatar className={cn("rounded-md size-16", className)}>
      <AvatarImage src={src!} asChild>
        <Image
          src={src!}
          alt={alt!}
          width={layout === "grid" ? 200 : 64}
          height={layout === "grid" ? 200 : 64}
          className={cn("aspect-square rounded-md object-cover")}
        />
      </AvatarImage>
      <AvatarFallback className="rounded-md">
        <Music2 />
      </AvatarFallback>
    </Avatar>
  </div>
));
ItemCardImage.displayName = "ItemCardImage";

const ItemCardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 space-y-1", className)} {...props} />
));
ItemCardContent.displayName = "ItemCardContent";

const ItemCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p"> & {
    layout?: "grid" | "list";
  }
>(({ className, layout = "list", ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      layout === "grid"
        ? "mt-1 line-clamp-1 break-all text-sm font-medium"
        : "line-clamp-2 break-all text-sm font-medium leading-none",
      className,
    )}
    {...props}
  />
));
ItemCardTitle.displayName = "ItemCardTitle";

const ItemCardSubtitle = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "line-clamp-2 break-all text-sm text-muted-foreground",
      className,
    )}
    {...props}
  />
));
ItemCardSubtitle.displayName = "ItemCardSubtitle";

const ItemCardAlbum = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "line-clamp-1 hidden break-all text-sm text-muted-foreground xl:block",
      className,
    )}
    {...props}
  />
));
ItemCardAlbum.displayName = "ItemCardAlbum";

const ItemCardDuration = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    duration: number;
  }
>(({ className, duration, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center space-x-2 text-sm text-muted-foreground",
      className,
    )}
    {...props}
  >
    <Clock className="size-4" />
    <span>
      {Math.floor(duration / 60000)}:
      {((duration % 60000) / 1000).toFixed(0).padStart(2, "0")}
    </span>
  </div>
));
ItemCardDuration.displayName = "ItemCardDuration";

const ItemCardTimestamp = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    date: Date;
  }
>(({ className, date, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-right text-sm font-medium text-muted-foreground",
      className,
    )}
    {...props}
  >
    {format(date, "{dd}/{MM}/{yyyy}, {HH}:{mm}")}
  </div>
));
ItemCardTimestamp.displayName = "ItemCardTimestamp";

const ItemCardLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
  }
>(({ asChild, className, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      className={cn("text-primary hover:text-primary/80", className)}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children ?? (
        <>
          <ExternalLink className="size-4" />
          <span className="sr-only">Open in Spotify</span>
        </>
      )}
    </Comp>
  );
});
ItemCardLink.displayName = "ItemCardLink";

export {
  ItemCard,
  ItemCardRank,
  ItemCardImage,
  ItemCardContent,
  ItemCardTitle,
  ItemCardSubtitle,
  ItemCardAlbum,
  ItemCardDuration,
  ItemCardTimestamp,
  ItemCardLink,
};
