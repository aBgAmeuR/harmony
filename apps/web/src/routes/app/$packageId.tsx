import { Outlet, createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { SidebarInset, SidebarProvider } from '@harmony/ui/components/sidebar'
import { ProgressProvider } from '@bprogress/react'
import { useDbStore } from '@/stores/db-store'
import { Icons } from '@/components/icons'
import { AppSidebar } from '@/components/layout/sidebar/app-sidebar'

export const Route = createFileRoute('/app/$packageId')({
  ssr: false,
  loader: () => useDbStore.getState().initialize(),
  staleTime: Infinity,
  pendingComponent: PendingComponent,
  errorComponent: ErrorComponent,
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProgressProvider options={{ showSpinner: false }} color="#1ED760">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </ProgressProvider>
  )
}

function PendingComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center relative">
      <div className="flex flex-col items-center justify-center gap-2">
        <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
        <span className="text-sm font-medium">Setup your database</span>
      </div>

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2">
        <Icons.logo className="size-7!" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate scroll-m-20 text-lg font-bold tracking-tight text-balance text-foreground">
            Harmony
          </span>
        </div>
      </div>
    </div>
  )
}

function ErrorComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center relative">
      <p className="text-lg text-destructive">Error loading database</p>

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2">
        <Icons.logo className="size-7!" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate scroll-m-20 text-lg font-bold tracking-tight text-balance text-foreground">
            Harmony
          </span>
        </div>
      </div>
    </div>
  )
}
