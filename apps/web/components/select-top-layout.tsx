"use client";

import { Label } from "@repo/ui/label";
import { Switch } from "@repo/ui/switch";
import { AlignJustify, Grid2x2 } from "lucide-react";

import { useTopTimeRange } from "~/lib/store";

export const SelectTopLayout = () => {
  const listLayout = useTopTimeRange((state) => state.list_layout);
  const setListLayout = useTopTimeRange((state) => state.setListLayout);

  return (
    <div>
      <div className="relative inline-grid h-9 grid-cols-[1fr_1fr] items-center text-sm font-medium">
        <Switch
          id="switch-12"
          checked={listLayout === "grid"}
          onCheckedChange={(checked) =>
            setListLayout(checked ? "grid" : "list")
          }
          className="peer absolute inset-0 h-[inherit] w-auto rounded-md *:rounded-md data-[state=checked]:bg-input/50 data-[state=unchecked]:bg-input/50 [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] data-[state=checked]:[&_span]:translate-x-full rtl:data-[state=checked]:[&_span]:-translate-x-full"
        />
        <span className="pointer-events-none relative ms-0.5 flex min-w-8 items-center justify-center text-center peer-data-[state=checked]:text-muted-foreground/70">
          <AlignJustify size={16} strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="pointer-events-none relative me-0.5 flex min-w-8 items-center justify-center text-center peer-data-[state=unchecked]:text-muted-foreground/70">
          <Grid2x2 size={16} strokeWidth={2} aria-hidden="true" />
        </span>
      </div>
      <Label htmlFor="switch-12" className="sr-only">
        Labeled switch
      </Label>
    </div>
  );
};
