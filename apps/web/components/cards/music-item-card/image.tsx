import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Music2 } from "lucide-react";
import Image from "next/image";

type MusicItemCardImageProps = {
  src?: string;
  alt?: string;
};

export const MusicItemCardImage = ({ src, alt }: MusicItemCardImageProps) => (
  <Avatar className={"rounded-md size-16"}>
    <AvatarImage src={src!} asChild>
      <Image
        src={src!}
        alt={alt!}
        width={64}
        height={64}
        className={"aspect-square rounded-md object-cover"}
      />
    </AvatarImage>
    <AvatarFallback className="rounded-md">
      <Music2 />
    </AvatarFallback>
  </Avatar>
);
