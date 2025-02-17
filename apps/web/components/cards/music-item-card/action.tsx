import { ChevronRight } from "lucide-react";
import Link from "next/link";

type MusicItemCardActionProps = {
  href?: string;
};

export const MusicItemCardAction = ({ href }: MusicItemCardActionProps) => (
  <Link href={href || "#"} passHref>
    <button className="flex items-center hover:translate-x-0.5 duration-100 cursor-pointer">
      <ChevronRight />
    </button>
  </Link>
);
