import { cn } from "@harmony/ui/lib/utils";

export const DEFAULT_CHART_ASPECT_CLASS = "aspect-[2/1]";
export const DEFAULT_SPARKLINE_ASPECT_CLASS = "aspect-[6/1]";

export function chartContainerClassName(
  className?: string,
  aspectClass = DEFAULT_CHART_ASPECT_CLASS,
) {
  return cn("relative min-h-0 w-full overflow-hidden", aspectClass, className);
}
