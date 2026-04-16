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

export function LayoutHeader({ metadata, children, className }: LayoutHeaderProps) {
  return (
    <header className={cn('flex flex-col my-1', className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col">
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
