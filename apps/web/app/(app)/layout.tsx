import { auth } from "@repo/auth";
import { SidebarInset, SidebarProvider } from "@repo/ui/sidebar";
import { cookies } from "next/headers";

import { AppSidebar } from "~/components/navbar/app-sidebar";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStorage = cookies();
  const sideBarState = cookieStorage.get("sidebar:state")?.value || "false";
  const session = await auth();

  return (
    <SidebarProvider defaultOpen={sideBarState === "true"}>
      <AppSidebar user={session?.user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
