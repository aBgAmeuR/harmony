import { SidebarInset, SidebarProvider } from "@harmony/ui/components/sidebar";
import { Outlet } from "@tanstack/react-router";

import { AppNav } from "@/widgets/app-nav";

export const AppLayout = () => (
  <SidebarProvider>
    <AppNav />
    <SidebarInset>
      <Outlet />
    </SidebarInset>
  </SidebarProvider>
);
