import { Alert02Icon, Icon, RefreshIcon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Link, type ErrorComponentProps } from "@tanstack/react-router";

import { openErrorFn, openErrorKind, type OpenErrorKind } from "@/data/packages/open";

import { AppFooter } from "./footer";

const contents = {
  missing: {
    title: "Package not found",
    description:
      "This package doesn't exist or may have been removed. Upload a new package to get started.",
    showUpload: true,
  },
  fetch: {
    title: "Couldn't load package",
    description: "We had trouble fetching your package data. Check your connection and try again.",
    showUpload: false,
  },
  other: {
    title: "Couldn't set up your database",
    description: "Something went wrong while loading your package data.",
    showUpload: false,
  },
} satisfies Record<OpenErrorKind, { title: string; description: string; showUpload: boolean }>;

export const AppError = ({ error }: ErrorComponentProps) => {
  const resolved = openErrorFn(error);
  const kind = openErrorKind(resolved);
  const { title, showUpload } = contents[kind];
  const description =
    kind === "other" && resolved.message ? resolved.message : contents[kind].description;

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
          {showUpload ? (
            <Button nativeButton={false} render={<Link to="/upload" />}>
              Upload package
            </Button>
          ) : null}
        </div>
      </div>

      <AppFooter />
    </div>
  );
};
