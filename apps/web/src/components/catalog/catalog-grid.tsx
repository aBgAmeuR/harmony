import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@harmony/ui/components/empty'
import { GridViewIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useNavigate } from '@tanstack/react-router'
import { FormattedMetric } from '../format/formatted-metric'
import { CatalogImage } from './catalog-image'
import type { Catalog } from './catalog'

const getRankClassName = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40'
    case 2:
      return 'bg-slate-400/20 text-slate-200 ring-1 ring-slate-300/35'
    case 3:
      return 'bg-orange-700/25 text-orange-200 ring-1 ring-orange-400/35'
    default:
      return 'bg-muted/60 text-muted-foreground ring-1 ring-muted/80'
  }
}

type CatalogGridProps = {
  catalog: Array<Catalog> | undefined
  empty?: string
  loading?: boolean
}

export const CatalogGrid = ({
  catalog,
  empty = 'No items yet.',
  loading = false,
}: CatalogGridProps) => {
  const navigate = useNavigate()

  if (!loading && (!catalog || catalog.length <= 0)) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={GridViewIcon} />
          </EmptyMedia>
          <EmptyTitle>{empty}</EmptyTitle>
          <EmptyDescription>Try adjusting your date range or filters.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 px-4 py-2">
      {catalog?.map((item, index) => (
        <article
          key={item.id}
          onClick={() => navigate({ to: '.', search: { details: item.id }, resetScroll: false })}
          className="flex flex-col gap-2 p-2 rounded-lg hover:bg-card transition-colors duration-100 cursor-pointer"
        >
          <div className="relative aspect-square">
            <CatalogImage image={item.image} alt={item.name} className="size-full [&_svg]:size-5" />
            <div className="absolute top-1.5 right-1.5 flex items-center justify-center">
              <span
                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-md text-xs font-medium ${getRankClassName(index + 1)}`}
              >
                {index + 1}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
            <div className="mt-1.5 flex items-center justify-between gap-1">
              <FormattedMetric value={item.streams} size="sm" />
              <FormattedMetric value={item.playtime} unit="min" size="sm" />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
