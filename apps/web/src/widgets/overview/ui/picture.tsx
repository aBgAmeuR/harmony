import { Avatar, AvatarFallback, AvatarImage } from "@harmony/ui/components/avatar";
import { cn } from "@harmony/ui/lib/utils";

import { initials } from "../format";

const sizes = {
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
  xl: "size-16 text-lg",
} as const;

type PictureProps = {
  src: string | null;
  name: string;
  // Artists are round, tracks and albums square.
  size?: keyof typeof sizes;
  className?: string;
};

// Cover or portrait, with the initials of the name until (or instead of) an image.
export const Picture = ({ src, name, size = "md", className }: PictureProps) => {
  return (
    <Avatar className={cn(sizes[size], "rounded-md after:hidden", className)}>
      {src ? <AvatarImage src={src} alt={name} className={"rounded-md"} /> : null}
      <AvatarFallback className={cn(sizes[size], "rounded-md")}>{initials(name)}</AvatarFallback>
    </Avatar>
  );
};
