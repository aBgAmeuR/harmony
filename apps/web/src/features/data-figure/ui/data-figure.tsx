import type { ReactNode } from "react";

import { cn } from "@harmony/ui/lib/utils";
import { useState } from "react";

import type { FigureState, FigureView } from "../model/types";

import { FigureViews } from "./figure-views";

type DataFigureProps = {
  // Caption above the figure.
  title: string;
  // Ways to draw the figure, the first one is shown first.
  views?: FigureView[];
  // The figure itself, drawn in the picked view.
  children: (state: FigureState) => ReactNode;
  className?: string;
};

// A chart or a list with a caption and a switch between its views.
export const DataFigure = ({ title, views = [], children, className }: DataFigureProps) => {
  const [view, setView] = useState(views[0]?.value ?? "");

  return (
    <figure data-slot="data-figure" className={cn("flex min-w-0 flex-col gap-1", className)}>
      <figcaption className="flex min-h-7 flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        {title}
        {views.length > 1 ? <FigureViews views={views} value={view} onChange={setView} /> : null}
      </figcaption>
      {children({ view })}
    </figure>
  );
};
