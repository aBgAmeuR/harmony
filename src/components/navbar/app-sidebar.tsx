"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

import { NavHeader } from "./nav-header";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { data } from "./sidebar-config";

import { NavMain } from "@/components/navbar/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  if (!session || !session.user?.name || !session.user?.image) return null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader {...data.header} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.stats} label="Stats" />
        {/* <NavMain items={data.package} label="Package" /> */}
        {/* <NavMain items={data.advanced} label="Advanced" /> */}
        <NavMain items={data.settings} label="Settings" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session.user.name,
            avatar: session.user.image
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
