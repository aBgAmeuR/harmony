import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { cn } from "@repo/ui/lib/utils";
import { Music2 } from "lucide-react";

type MusicItemCardImageProps = {
  src?: string;
  alt?: string;
  href?: string;
  layout: "list" | "grid";
};

export const MusicItemCardImage = ({
  src,
  alt,
  href,
  layout,
}: MusicItemCardImageProps) => (
  <Avatar className={cn("aspect-square rounded-md")}>
    <AvatarImage src={src!} asChild>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="aspect-square rounded-md object-cover cursor-pointer"
        >
          <img
            src={src!}
            alt={alt!}
            width={layout === "grid" ? 200 : 64}
            height={layout === "grid" ? 200 : 64}
            className={"aspect-square rounded-md object-cover size-full"}
          />
        </a>
      ) : (
        <img
          src={src!}
          alt={alt!}
          width={layout === "grid" ? 200 : 64}
          height={layout === "grid" ? 200 : 64}
          className={"aspect-square rounded-md object-cover"}
        />
      )}
    </AvatarImage>
    <AvatarFallback className="rounded-md">
      <Music2 />
    </AvatarFallback>
  </Avatar>
);
