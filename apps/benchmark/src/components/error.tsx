import { db, DuckDBFetchError, DuckDBPackageNotFoundError } from "@harmony/duckdb";
import { Alert02Icon, Icon, RefreshIcon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { ErrorComponentProps } from "@tanstack/react-router";

import { Icons } from "./icons";

export function Error({ error }: ErrorComponentProps) {
  const storedError = db.error();
  const resolvedError = error instanceof Error ? error : storedError;
  const { title, description } = getErrorContent(resolvedError);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <Icon icon={Alert02Icon} className="size-5" />
        </div>

        <div className="space-y-1">
          <h1 className="text-sm font-medium text-foreground">{title}</h1>
          <p className="text-sm text-balance text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <Icon icon={RefreshIcon} />
            Try again
          </Button>
        </div>
      </div>

      <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-2 px-3 py-2">
        <Icons.logo className="size-7!" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="scroll-m-20 truncate text-lg font-bold tracking-tight text-balance text-foreground">
            Harmony
          </span>
        </div>
      </div>
    </div>
  );
}

function getErrorContent(error: Error | null) {
  if (error instanceof DuckDBPackageNotFoundError) {
    return {
      title: "Package not found",
      description:
        "This package doesn't exist or may have been removed. Upload a new package to get started.",
    };
  }

  if (error instanceof DuckDBFetchError) {
    return {
      title: "Couldn't load package",
      description:
        "We had trouble fetching your package data. Check your connection and try again.",
    };
  }

  return {
    title: "Couldn't set up your database",
    description: error?.message ?? "Something went wrong while loading your package data.",
  };
}
