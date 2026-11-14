import { Icon, MusicNote03Icon } from "@harmony/icons";
import { cn } from "@harmony/ui/lib/utils";
import { useState, type ComponentProps } from "react";

const sizes = {
  xs: "size-5",
  sm: "size-6",
  md: "size-8",
  lg: "size-12",
  xl: "size-16",
  "2xl": "size-20",
  fill: "aspect-square w-full",
} as const;

const initialsSizes = {
  xs: "text-xs",
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-lg",
  "2xl": "text-lg",
  fill: "text-2xl",
} as const;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

type PictureProps = { src: string; placeholder: string | null | undefined; alt: string };

const Picture = ({ src, placeholder, alt }: PictureProps) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <div className="absolute inset-0 z-1 overflow-hidden rounded-sm bg-muted">
        {placeholder && placeholder !== src ? (
          <img src={placeholder} alt="" aria-hidden className="size-full object-cover" />
        ) : null}
      </div>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        ref={(img) => {
          if (img?.complete && img.naturalWidth > 0) setLoaded(true);
        }}
        onLoad={() => setLoaded(true)}
        className={cn(
          "relative z-2 size-full rounded-sm object-cover transition-opacity duration-150",
          !loaded && "opacity-0",
        )}
      />
    </>
  );
};

type ArtProps = Omit<ComponentProps<"div">, "children"> & {
  src: string | null | undefined;
  placeholder?: string | null;
  alt: string;
  size?: keyof typeof sizes;
  fallback?: "icon" | "initials";
  variant?: "flat" | "glow";
};

export const Art = ({
  src,
  placeholder,
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
        <Picture key={src} src={src} placeholder={placeholder} alt={alt} />
        {variant === "glow" ? (
          <div
            aria-hidden
            className="absolute bottom-0.75 left-0 size-full origin-bottom scale-90 opacity-20 blur-lg saturate-200"
          >
            <img src={placeholder ?? src} alt="" className="size-full" />
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
