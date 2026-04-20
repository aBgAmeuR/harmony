import type { PropsWithChildren } from 'react'

type CatalogScrollAreaProps = PropsWithChildren<{}>

export function CatalogScrollArea({ children }: CatalogScrollAreaProps) {
  return <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
}
