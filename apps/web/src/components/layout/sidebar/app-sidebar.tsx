'use client'

import * as React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@harmony/ui/components/sidebar'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Analytics01Icon, CropIcon, MapsIcon, PackageIcon, PieChartIcon    
} from '@hugeicons/core-free-icons'
import { NavMain } from './nav-main'
import { NavProjects } from './nav-projects'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { CommandMenu } from './command-menu'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Harmony',
    },
    {
      name: 'Harmony Docs',
    },
  ],
  navMain: [
    {
      title: 'Overview',
      url: '#',
      icon: <HugeiconsIcon icon={Analytics01Icon} strokeWidth={2} />,
      isActive: true,
    },
    {
      title: 'My Package',
      url: '#',
      icon: <HugeiconsIcon icon={PackageIcon} strokeWidth={2} />,
    },
  ],
  projects: [
    {
      name: 'Artists',
      url: '#',
      icon: <HugeiconsIcon icon={CropIcon} strokeWidth={2} />,
    },
    {
      name: 'Tracks',
      url: '#',
      icon: <HugeiconsIcon icon={PieChartIcon} strokeWidth={2} />,
    },
    {
      name: 'Albums',
      url: '#',
      icon: <HugeiconsIcon icon={MapsIcon} strokeWidth={2} />,
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
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
