import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@harmony/ui/components/sidebar";
import * as React from "react";

import { CommandMenu } from "./command-menu";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { navConfig } from "./nav.config";
import { TeamSwitcher } from "./team-switcher";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <CommandMenu />
        <NavMain items={navConfig.main} />
        <NavMain items={navConfig.library} title="Library" />
        <NavMain items={navConfig.insights} title="Insights" />
        <NavMain items={navConfig.social} title="Social" />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={navConfig.secondary} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
