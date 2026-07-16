import { Icon, MusicNote03Icon } from "@harmony/icons";
import { cn } from "@harmony/ui/lib/utils";

type CatalogImageProps = {
  image: string | undefined | null;
  alt: string;
  className?: string;
};

export const CatalogImage = ({ image, alt, className }: CatalogImageProps) => {
  if (!image) {
    return (
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md bg-muted",
          className,
        )}
      >
        <Icon icon={MusicNote03Icon} className="size-3" />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={alt}
      width={32}
      height={32}
      loading="lazy"
      decoding="async"
      className={cn("size-8 shrink-0 rounded-md object-cover", className)}
    />
  );
};
