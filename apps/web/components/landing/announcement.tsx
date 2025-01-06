import { cn } from "@repo/ui/lib/utils";
import { Separator } from "@repo/ui/separator";
import { ArrowRightIcon, LayoutDashboard, TriangleAlert } from "lucide-react";
import Link from "next/link";

type AnnouncementProps = {
  className?: string;
};

export function Announcement({ className }: AnnouncementProps) {
  const isMaintenance = process.env.APP_MAINTENANCE === "true";

  if (isMaintenance) {
    return (
      <div
        className={cn(
          "inline-flex gap-2 rounded-lg bg-muted px-3 py-1 text-sm font-medium",
          className,
        )}
      >
        <TriangleAlert
          className="mt-0.5 shrink-0 opacity-60 text-red-400 dark:text-red-600"
          size={16}
          strokeWidth={2}
          aria-hidden="true"
        />
        <span>Maintenance in progress. Please check back later.</span>
      </div>
    );
  }

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
