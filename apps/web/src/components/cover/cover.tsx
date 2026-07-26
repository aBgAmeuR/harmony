import { Icon, MusicNote03Icon } from "@harmony/icons";
import { cn } from "@harmony/ui/lib/utils";

import { BlurImage } from "./blur-image";

const sizeClass = {
  xs: "size-5",
  sm: "size-6",
  md: "size-8",
  lg: "size-12",
  xl: "size-16",
  "2xl": "size-20",
} as const;

type CoverProps = {
  src: string | undefined | null;
  alt: string;
  className?: string;
  size?: keyof typeof sizeClass;
  blur?: boolean;
};

export function Cover({ src, alt, className, size = "md", blur = false }: CoverProps) {
  return (
    <div className={cn("relative shrink-0", sizeClass[size], className)}>
      {src ? (
        <>
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="relative z-10 size-full rounded-sm object-cover"
          />
          {blur && <BlurImage src={src} />}
        </>
      ) : (
        <div className="flex size-full items-center justify-center rounded-sm bg-muted">
          <Icon icon={MusicNote03Icon} className="size-3" />
        </div>
      )}
    </div>
  );
}
