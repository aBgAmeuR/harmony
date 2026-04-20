import type { PropsWithChildren } from 'react'

type CatalogPageHeaderProps = PropsWithChildren<{
  title: string
  description: string
}>

export function CatalogPageHeader({ title, description, children }: CatalogPageHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 p-4 pb-2">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-center gap-1">{children}</div>
    </div>
  )
}
