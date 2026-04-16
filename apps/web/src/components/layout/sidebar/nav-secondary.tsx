import * as React from 'react'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@harmony/ui/components/sidebar'
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export function NavSecondary({
  items,
  ...props
}: {
  items: Array<{
    title: string
    url: string
    icon: React.ReactNode
  }>
} & React.ComponentPropsWithoutRef<typeof SidebarMenu>) {
  return (
    <SidebarMenu {...props}>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild size="sm" className="group/external-link">
            <a href={item.url}>
              {item.icon}
              <span>{item.title}</span>
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                className="ms-auto hidden group-hover/external-link:block"
              />
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
