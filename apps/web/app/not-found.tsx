import { Button } from "@repo/ui/button";
import { CircleHelp } from "lucide-react";
import Link from "next/link";

import { Icons } from "~/components/icons";
import { ThemeToggle } from "~/components/theme-toggle";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col justify-between p-4">
      <div className="grow flex items-center justify-center">
        <div className="w-full max-w-md space-y-4 text-center">
          <CircleHelp className="mx-auto size-12" />
          <h1 className="text-2xl font-bold">404 Not Found</h1>
          <p className="text-lg">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            Error Code: <span>Not Found</span>
          </p>
          <Button asChild>
            <Link href="/">Take me Home</Link>
          </Button>
        </div>
      </div>
      <footer className="mt-8 flex items-center justify-center gap-2">
        <Icons.logo className="size-8" />
        <h1 className="text-xl font-bold">Harmony</h1>
        <ThemeToggle />
      </footer>
    </div>
  );
}
