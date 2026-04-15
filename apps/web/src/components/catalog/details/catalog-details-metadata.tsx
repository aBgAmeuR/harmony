import { Badge } from '@harmony/ui/components/badge'

import { CatalogDetailsSection } from './catalog-details-section'
import type { CatalogDetails } from '../catalog'

type CatalogDetailsMetadataProps = {
  metadata: CatalogDetails['metadata']
}

export const CatalogDetailsMetadata = ({ metadata }: CatalogDetailsMetadataProps) => {
  return (
    <CatalogDetailsSection title="Metadata">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <span className="text-muted-foreground">First listened</span>
          <span className="max-w-[58%] text-end font-medium">
            {metadata.firstListenedAt
              ? new Date(metadata.firstListenedAt).toLocaleDateString('en-US', {
                  dateStyle: 'medium',
                })
              : '-'}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Last listened</span>
          <span className="max-w-[58%] text-end font-medium">
            {metadata.lastListenedAt
              ? new Date(metadata.lastListenedAt).toLocaleDateString('en-US', {
                  dateStyle: 'medium',
                })
              : '-'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Forward skip</span>
          <div className="flex min-w-0 items-baseline justify-end gap-2">
            <Badge variant="destructive">
              {formatPercent(metadata.forwardSkipRate)}
            </Badge>
            <span className="font-medium tabular-nums tracking-tight">
              {metadata.forwardSkips.toLocaleString('en-US')}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Replays</span>
          <div className="flex min-w-0 items-baseline justify-end gap-2">
            <Badge variant="active">
              {formatPercent(metadata.replayRate)}
            </Badge>
            <span className="font-medium tabular-nums tracking-tight">
              {metadata.replays.toLocaleString('en-US')}
            </span>
          </div>
        </div>
      </div>
    </CatalogDetailsSection>
  )
}

function formatPercent(fraction: number): string {
  return `${(fraction * 100).toLocaleString('en-US', { maximumFractionDigits: 1 })}%`
}
