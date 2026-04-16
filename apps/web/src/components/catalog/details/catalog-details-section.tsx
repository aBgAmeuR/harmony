import { cn } from '@harmony/ui/lib/utils'
import type { PropsWithChildren } from 'react'

type CatalogDetailsSectionProps = PropsWithChildren<{
  title?: string
  className?: string
}>

export const CatalogDetailsSection = ({
  title,
  children,
  className,
}: CatalogDetailsSectionProps) => {
  return (
    <div className={cn('flex flex-col gap-2 border-t border-border px-4 pt-4 mb-4', className)}>
      {title && <p className="text-sm font-medium">{title}</p>}
      {children}
    </div>
  )
}
