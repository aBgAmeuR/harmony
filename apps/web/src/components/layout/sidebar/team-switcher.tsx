'use client'

import * as React from 'react'

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@harmony/ui/components/sidebar'
import { Icons } from '@/components/icons'

export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="h-10 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Icons.logo className="size-8!" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate scroll-m-20 text-xl font-bold tracking-tight text-balance text-foreground">
              Harmony
            </span>
          </div>
          {/* <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={1.5} className="ml-auto" /> */}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
