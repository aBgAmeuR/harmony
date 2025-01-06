"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@repo/ui/sidebar";
import { Skeleton } from "@repo/ui/skeleton";
import { ChevronsUpDown } from "lucide-react";
import { User } from "next-auth";

import { NavMain } from "~/components/navbar/nav-main";

import { NavHeader } from "./nav-header";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { data } from "./sidebar-config";
import { SidebarOptInForm } from "./sidebar-opt-in-form";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: User;
  disable?: boolean;
};

export function AppSidebar({
  user,
  disable = false,
  ...props
}: AppSidebarProps) {
  const hasPackage = user?.hasPackage || false;
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader {...data.header} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.stats} label="Stats" disable={disable} />
        {hasPackage || disable ? (
          <NavMain items={data.package} label="Package" disable={disable} />
        ) : null}
        {/* {hasPackage ? <NavMain items={data.advanced} label="Advanced" disable={disable} /> : null} */}
        <NavMain items={data.settings} label="Settings" disable={disable} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user?.id ? (
          <>
            {user.name === "Demo" ? <SidebarOptInForm /> : null}
            <NavUser user={user} />
          </>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Skeleton className="size-8 min-w-8 min-h-8 rounded-lg" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <Skeleton className="h-[17.5] w-1/2" />
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
