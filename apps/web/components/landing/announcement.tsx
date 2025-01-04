import { cn } from "@repo/ui/lib/utils";
import { Separator } from "@repo/ui/separator";
import { ArrowRightIcon, LayoutDashboard } from "lucide-react";
import Link from "next/link";

type AnnouncementProps = {
  className?: string;
};

export function Announcement({ className }: AnnouncementProps) {
  return (
    <Link
      href="/overview"
      className={cn(
        "inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium",
        className,
      )}
    >
      <LayoutDashboard className="size-4" />{" "}
      <Separator
        className="mx-2 h-3 bg-muted-foreground"
        orientation="vertical"
      />{" "}
      <span>Introducing Overview page</span>
      <ArrowRightIcon className="ml-1 size-4" />
    </Link>
  );
}
