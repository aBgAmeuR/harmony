import type { ComponentProps } from "react";

import { Icon, MusicNote03Icon } from "@harmony/icons";
import { cn } from "@harmony/ui/lib/utils";

const sizes = {
  xs: "size-5",
  sm: "size-6",
  md: "size-8",
  lg: "size-12",
  xl: "size-16",
  "2xl": "size-20",
} as const;

const initialsSizes = {
  xs: "text-xs",
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-lg",
  "2xl": "text-lg",
} as const;

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

type ArtProps = Omit<ComponentProps<"div">, "children"> & {
  src: string | null | undefined;
  alt: string;
  size?: keyof typeof sizes;
  // Shown without an image: a note icon, or the initials of `alt`.
  fallback?: "icon" | "initials";
  // glow: a blurred copy of the image behind it, for page heads.
  variant?: "flat" | "glow";
};

// A cover or a portrait.
export const Art = ({
  src,
  alt,
  size = "md",
  fallback = "icon",
  variant = "flat",
  className,
  ...props
}: ArtProps) => (
  <div
    data-slot="art"
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
        {variant === "glow" ? (
          <div
            aria-hidden
            className="absolute bottom-0.75 left-0 size-full origin-bottom scale-90 opacity-20 blur-lg saturate-200"
          >
            <img src={src} alt="" className="size-full" />
          </div>
        ) : null}
      </>
    ) : (
      <div className="flex size-full items-center justify-center rounded-sm bg-muted text-muted-foreground">
        {fallback === "initials" ? (
          <span className={cn("font-medium", initialsSizes[size])}>{initials(alt)}</span>
        ) : (
          <Icon icon={MusicNote03Icon} className="size-3" aria-hidden="true" />
        )}
      </div>
    )}
  </div>
);
