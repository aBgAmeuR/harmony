import { db, DuckDBFetchError, DuckDBPackageNotFoundError } from "@harmony/duckdb";
import { Alert02Icon, Icon, Loading03Icon, RefreshIcon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { SidebarInset, SidebarProvider } from "@harmony/ui/components/sidebar";
import { createFileRoute, Link, Outlet, type ErrorComponentProps } from "@tanstack/react-router";

import { Icons } from "@/components/icons";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";

function getErrorContent(error: Error | null) {
  if (error instanceof DuckDBPackageNotFoundError) {
    return {
      title: "Package not found",
      description:
        "This package doesn't exist or may have been removed. Upload a new package to get started.",
      showUpload: true,
    };
  }

  if (error instanceof DuckDBFetchError) {
    return {
      title: "Couldn't load package",
      description:
        "We had trouble fetching your package data. Check your connection and try again.",
      showUpload: false,
    };
  }

  return {
    title: "Couldn't set up your database",
    description: error?.message ?? "Something went wrong while loading your package data.",
    showUpload: false,
  };
}

function HarmonyFooter() {
  return (
    <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-2 px-3 py-2">
      <Icons.logo className="size-7!" />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="scroll-m-20 truncate text-lg font-bold tracking-tight text-balance text-foreground">
          Harmony
        </span>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/$packageId")({
  ssr: false,
  loader: ({ params }) => db.init(params.packageId),
  staleTime: Infinity,
  component: RouteComponent,
  pendingComponent: PendingComponent,
  errorComponent: ErrorComponent,
});

function RouteComponent() {
  // const router = useRouter();

  // router.subscribe("onBeforeNavigate", ({ pathChanged }) => pathChanged && BProgress.start());
  // router.subscribe("onResolved", () => BProgress.done());

  return (
    // <ProgressProvider options={{ showSpinner: false }} color="#1ED760">
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* <Progress /> */}
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
    // </ProgressProvider>
  );
}

function PendingComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <Icon icon={Loading03Icon} className="size-4 animate-spin" />
        <span className="text-sm font-medium">Setup your database</span>
      </div>

      <HarmonyFooter />
    </div>
  );
}

function ErrorComponent({ error }: ErrorComponentProps) {
  const storedError = db.error();
  const resolvedError = error instanceof Error ? error : (storedError ?? new Error(String(error)));
  const { title, description, showUpload } = getErrorContent(resolvedError);

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

      <HarmonyFooter />
    </div>
  );
}
