import type { ComponentProps } from "react";

import { Icon, MusicNote03Icon } from "@harmony/icons";
import { cn } from "@harmony/ui/lib/utils";

import { Blur } from "./blur";

const sizes = {
  xs: "size-5",
  sm: "size-6",
  md: "size-8",
  lg: "size-12",
  xl: "size-16",
  "2xl": "size-20",
} as const;

type CoverProps = Omit<ComponentProps<"div">, "children"> & {
  src: string | undefined | null;
  alt: string;
  size?: keyof typeof sizes;
  blur?: boolean;
};

export const Cover = ({ src, alt, size = "md", blur = false, className, ...props }: CoverProps) => (
  <div
    data-slot="cover"
    data-size={size}
    className={cn("relative shrink-0", sizes[size], className)}
    {...props}
  >
    {src ? (
      <>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="relative z-2 size-full rounded-sm object-cover"
        />
        {blur && <Blur src={src} />}
      </>
    ) : (
      <div className="flex size-full items-center justify-center rounded-sm bg-muted">
        <Icon icon={MusicNote03Icon} className="size-3" aria-hidden="true" />
      </div>
    )}
  </div>
);
