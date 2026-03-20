import { SidebarInset, SidebarProvider } from '@harmony/ui/components/sidebar'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppSidebar } from '@/components/layout/sidebar/app-sidebar'

export const Route = createFileRoute('/app')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
