"use client";

import { useEffect } from "react";
import { Button } from "@repo/ui/button";
import { AlertCircle } from "lucide-react";

import { Icons } from "~/components/icons";
import { ThemeToggle } from "~/components/theme-toggle";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col justify-between p-4">
      <div className="grow flex items-center justify-center">
        <div className="w-full max-w-md space-y-4 text-center">
          <AlertCircle className="mx-auto size-12" />
          <h1 className="text-2xl font-bold">An unexpected error occurred</h1>
          <p className="text-lg">
            Something went wrong. Please try again or contact support if the
            issue persists.
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            Error Code: <span>{error.digest}</span>
          </p>
          <Button onClick={() => reset()}>Try again</Button>
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
