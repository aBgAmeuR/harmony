import { Button } from '@harmony/ui/components/button'
import { Cancel01Icon, Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { CatalogDetailsTrend } from './catalog-details-trend'
import { CatalogDetailsDistribution } from './catalog-details-distribution'
import { CatalogDetailsMetadata } from './catalog-details-metadata'
import { CatalogDetailsMetrics } from './catalog-details-metrics'
import { CatalogDetailsHero } from './catalog-details-hero'
import type { CatalogDetails } from '../catalog'

type CatalogDetailsPanelProps = {
  details?: CatalogDetails
  isLoading?: boolean
  close: () => void
}

export const CatalogDetailsPanel = ({ close, details, isLoading }: CatalogDetailsPanelProps) => {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 p-4">
        <h2 className="text-lg font-semibold">Track Details</h2>
        <Button variant="secondary" size="icon-xs" onClick={close}>
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
        </Button>
      </div>

      {isLoading && (
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      )}

      {!isLoading && details && (
        <>
          <CatalogDetailsHero
            image={details.image}
            name={details.name}
            description={details.description}
          />
          <CatalogDetailsMetrics streams={details.streams} playtime={details.playtime} />
          <CatalogDetailsTrend trend={details.trend} />
          <CatalogDetailsDistribution distribution={details.distribution} />
          <CatalogDetailsMetadata metadata={details.metadata} />
        </>
      )}

      {!isLoading && !details && (
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <span>No details found.</span>
          </div>
        </div>
      )}
    </div>
  )
}
