import { Outlet, createFileRoute, notFound } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@harmony/ui/components/sidebar'
import { getPackageById } from '@/features/packages/server/get-package-by-id'
import { AppSidebar } from '@/components/layout/sidebar/app-sidebar'

export const Route = createFileRoute('/app/$packageId')({
  beforeLoad: async ({ params }) => {
    const result = await getPackageById({ data: { packageId: params.packageId } })
    if (!result.found) throw notFound()

    return {
      pkg: result.pkg,
    }
  },
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
