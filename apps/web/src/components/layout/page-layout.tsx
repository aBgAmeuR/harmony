import { Link, useRouteContext } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@harmony/ui/components/breadcrumb'
import { Separator } from '@harmony/ui/components/separator'
import { SidebarTrigger } from '@harmony/ui/components/sidebar'
import { cn } from '@harmony/ui/lib/utils'
import type { ReactNode } from 'react'

type LayoutProps = {
  children: ReactNode
  className?: string
}

type LayoutHeaderMetadata = {
  title: string
  description?: string
}

type LayoutHeaderProps = {
  items: Array<string>
  metadata: LayoutHeaderMetadata
  children?: ReactNode
  className?: string
}

type LayoutContentProps = {
  children: ReactNode
  className?: string
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={cn('mx-auto flex w-full max-w-screen-2xl flex-col gap-3 p-3', className)}>
      {children}
    </div>
  )
}

export function LayoutHeader({ items, metadata, children, className }: LayoutHeaderProps) {
  const { pkg } = useRouteContext({ from: '/app/$packageId' })

  return (
    <header className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/app/$packageId" params={{ packageId: pkg.id }}>
                  Package
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {items.map((item) => (
              <BreadcrumbItem key={item} className="inline-flex items-center gap-2">
                <BreadcrumbSeparator />
                <BreadcrumbPage>{item}</BreadcrumbPage>
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{metadata.title}</h1>
          {metadata.description ? (
            <p className="text-sm text-muted-foreground">{metadata.description}</p>
          ) : null}
        </div>
        {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
      </div>
    </header>
  )
}

export function LayoutContent({ children, className }: LayoutContentProps) {
  return <main className={cn('min-w-0', className)}>{children}</main>
}
