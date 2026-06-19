import * as React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarRail,
} from '@harmony/ui/components/sidebar'

import { NavMain } from './nav-main'
import { TeamSwitcher } from './team-switcher'
import { CommandMenu } from './command-menu'
import { navConfig } from './nav.config'
import { NavSecondary } from './nav-secondary'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <CommandMenu />
        </SidebarGroup>
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
  )
}
