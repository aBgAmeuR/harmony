import * as React from 'react'

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@harmony/ui/components/sidebar'
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'

export function NavSecondary({
  items,
  ...props
}: {
  items: Array<{
    title: string
    url: string
    icon: React.ReactNode
    isExternal?: boolean
  }>
} & React.ComponentPropsWithoutRef<typeof SidebarMenu>) {
  return (
    <SidebarMenu {...props}>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild size="sm" className="group/external-link">
            {item.isExternal ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.icon}
                <span>{item.title}</span>
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  className="ms-auto hidden group-hover/external-link:block"
                />
              </a>
            ) : (
              <Link from="/app/$packageId" to={item.url.startsWith('/') ? `.${item.url}` : item.url} preload="intent">
                {item.icon}
                <span>{item.title}</span>
              </Link>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
