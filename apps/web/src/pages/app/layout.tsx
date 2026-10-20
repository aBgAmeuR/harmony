import { SidebarInset, SidebarProvider } from "@harmony/ui/components/sidebar";
import { Outlet, useLocation } from "@tanstack/react-router";

import { AppNav } from "@/widgets/app-nav";

export const AppLayout = () => {
  const path = useLocation({ select: (l) => l.pathname });

  return (
    <SidebarProvider>
      <AppNav />
      <SidebarInset>
        <Outlet key={path} />
      </SidebarInset>
    </SidebarProvider>
  );
};
