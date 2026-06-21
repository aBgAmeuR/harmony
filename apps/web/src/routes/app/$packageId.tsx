import { BProgress } from "@bprogress/core";
import { Progress, ProgressProvider } from "@bprogress/react";
import { db } from "@harmony/duckdb";
import { Icon, Loading03Icon } from "@harmony/icons";
import { SidebarInset, SidebarProvider } from "@harmony/ui/components/sidebar";
import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";

import { Icons } from "@/components/icons";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";

export const Route = createFileRoute("/app/$packageId")({
  ssr: false,
  loader: ({ params }) => db.init(params.packageId),
  staleTime: Infinity,
  component: RouteComponent,
  pendingComponent: PendingComponent,
  errorComponent: ErrorComponent,
});

function RouteComponent() {
  const router = useRouter();

  router.subscribe("onBeforeNavigate", ({ pathChanged }) => pathChanged && BProgress.start());
  router.subscribe("onResolved", () => BProgress.done());

  return (
    <ProgressProvider options={{ showSpinner: false }} color="#1ED760">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Progress />
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </ProgressProvider>
  );
}

function PendingComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <Icon icon={Loading03Icon} className="size-4 animate-spin" />
        <span className="text-sm font-medium">Setup your database</span>
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

function ErrorComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <p className="text-lg text-destructive">Error loading database</p>

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
