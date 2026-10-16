import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";

type BlurProps = Omit<ComponentProps<"div">, "children"> & {
  src: string;
};

export const Blur = ({ src, className, ...props }: BlurProps) => (
  <div
    data-slot="cover-blur"
    className={cn(
      "absolute bottom-0.75 left-0 size-full origin-bottom scale-90 opacity-20 blur-lg saturate-200",
      className,
    )}
    aria-hidden
    {...props}
  >
    <img src={src} alt="" className="size-full" />
  </div>
);
