import { Icon, MusicNote03Icon } from "@harmony/icons";
import { cn } from "@harmony/ui/lib/utils";

const SIZE_CLASS_MAP = {
  sm: "size-6",
  md: "size-8",
  lg: "size-12",
  xl: "size-16",
  "2xl": "size-20",
};

type CatalogImageProps = {
  image: string | undefined | null;
  alt: string;
  className?: string;
  size?: keyof typeof SIZE_CLASS_MAP;
  blur?: boolean;
};

export const CatalogImage = ({
  image,
  alt,
  className,
  size = "md",
  blur = false,
}: CatalogImageProps) => {
  const sizeClass = SIZE_CLASS_MAP[size];

  if (!image) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-sm bg-muted",
          sizeClass,
          className,
        )}
      >
        <Icon icon={MusicNote03Icon} className="size-3" />
      </div>
    );
  }

  if (blur) {
    return (
      <div className={cn("relative shrink-0 object-cover", sizeClass, className)}>
        <img src={image} alt={alt} loading="lazy" decoding="async" className="z-10 rounded-sm" />
        <div className="absolute bottom-[3px] left-0 size-full origin-bottom scale-90 opacity-20 blur-lg saturate-200">
          <img src={image} alt={alt} className="size-full" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn("shrink-0 rounded-sm object-cover", sizeClass, className)}
    />
  );
};
