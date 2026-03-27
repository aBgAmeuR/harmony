import * as React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@harmony/ui/components/sidebar'

import { NavMain } from './nav-main'
import { NavUploadCta } from './nav-upload-cta'
import { TeamSwitcher } from './team-switcher'
import { CommandMenu } from './command-menu'
import { navConfig } from './nav.config'
import { NavSecondary } from './nav-secondary';

const data = {
  teams: [
    {
      name: 'Harmony',
    },
    {
      name: 'Harmony Docs',
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <CommandMenu />
        <NavMain items={navConfig.main}  />
        <NavMain items={navConfig.library} title="Library" />
        <NavMain items={navConfig.insights} title="Insights" />
        <NavMain items={navConfig.social} title="Social" />
        <NavSecondary items={navConfig.secondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUploadCta />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
