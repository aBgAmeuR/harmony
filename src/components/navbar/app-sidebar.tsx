"use client";

import * as React from "react";

import { NavFooter } from "./nav-footer";
import { NavHeader } from "./nav-header";
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader {...data.header} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.stats} label="Stats" />
        <NavMain items={data.package} label="Package" />
        <NavMain items={data.advanced} label="Advanced" />
        <NavMain items={data.settings} label="Settings" />
      </SidebarContent>
      <SidebarFooter>
        <NavFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
