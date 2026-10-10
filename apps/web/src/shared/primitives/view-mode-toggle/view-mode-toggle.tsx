import { Icon, LayoutGridIcon, Menu01Icon } from "@harmony/icons";
import { buttonVariants } from "@harmony/ui/components/button";
import { cn } from "@harmony/ui/lib/utils";
import React from "react";

type ViewModeToggleProps = {
  size?: "sm" | "md";
};

export const ViewModeToggle = ({ size = "md" }: ViewModeToggleProps) => {
  const [listLayout, setListLayout] = React.useState<"grid" | "list">("list");

  return (
    <div
      role="group"
      aria-label="Track list layout"
      className={cn(
        buttonVariants({ variant: "outline", size: size === "sm" ? "sm" : "default" }),
        "relative h-8 min-w-16 shrink-0 items-stretch gap-0 p-0.5 shadow-none ring-0 ring-offset-0 focus-within:border-border focus-within:ring-0 focus-visible:border-border focus-visible:ring-0 active:translate-y-0 dark:focus-within:border-input dark:focus-visible:border-input",
        size === "sm" && "h-7 min-w-7",
        size === "md" && "h-8 min-w-8",
      )}
    >
      <div
        className={cn(
          "relative flex size-full flex-1",
          size === "sm" && "min-w-14",
          size === "md" && "min-w-16",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 z-0 w-1/2 rounded-sm bg-primary transition-[inset-inline-start] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            listLayout === "grid" ? "inset-s-1/2" : "inset-s-0",
          )}
        />
        <button
          type="button"
          aria-pressed={listLayout !== "grid"}
          aria-label="List view"
          onClick={() => setListLayout("list")}
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center rounded-sm",
            listLayout !== "grid" ? "text-primary-foreground" : "text-muted-foreground/70",
            size === "sm" && "min-w-7",
            size === "md" && "min-w-8",
          )}
        >
          <Icon icon={Menu01Icon} strokeWidth={2} className="size-4" />
        </button>
        <button
          type="button"
          aria-pressed={listLayout === "grid"}
          aria-label="Grid view"
          onClick={() => setListLayout("grid")}
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center rounded-sm",
            listLayout === "grid" ? "text-primary-foreground" : "text-muted-foreground/70",
            size === "sm" && "min-w-7",
            size === "md" && "min-w-8",
          )}
        >
          <Icon icon={LayoutGridIcon} strokeWidth={2} className="size-4" />
        </button>
      </div>
    </div>
  );
};
