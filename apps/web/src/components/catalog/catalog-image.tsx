import { Icon, MusicNote03Icon } from "@harmony/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@harmony/ui/components/avatar";
import { cn } from "@harmony/ui/lib/utils";

type CatalogImageProps = {
  image: string | undefined | null;
  alt: string;
  className?: string;
};
export const CatalogImage = ({ image, alt, className }: CatalogImageProps) => {
  return (
    <Avatar className={cn("size-8 rounded-md after:border-0", className)}>
      <AvatarImage src={image ?? undefined} alt={alt} className="rounded-sm" />
      <AvatarFallback className="rounded-md text-[10px]">
        <Icon icon={MusicNote03Icon} strokeWidth={1} className="size-3" />
      </AvatarFallback>
    </Avatar>
  );
};
