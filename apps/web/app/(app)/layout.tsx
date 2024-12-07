import React from "react";
import { auth } from "@repo/auth";
import { SidebarInset, SidebarProvider } from "@repo/ui/sidebar";
import { cookies } from "next/headers";

import { AppSidebar } from "~/components/navbar/app-sidebar";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStorage = await cookies();
  const sideBarState = cookieStorage.get("sidebar:state")?.value || "true";
  const session = await auth();

  return (
    <SidebarProvider defaultOpen={sideBarState === "true"}>
      <AppSidebar user={session?.user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
