import { Card, CardContent, CardHeader, CardTitle } from '@harmony/ui/components/card'
import { FormattedMetric } from '../../format/formatted-metric'
import { CatalogDetailsSection } from './catalog-details-section'
import type { CatalogDetails } from '../catalog'

type CatalogDetailsMetricsProps = {
  streams: CatalogDetails['streams']
  playtime: CatalogDetails['playtime']
}

export const CatalogDetailsMetrics = ({ streams, playtime }: CatalogDetailsMetricsProps) => {
  return (
    <CatalogDetailsSection className="grid grid-cols-3 gap-2">
      <Card size="sm" className="gap-1!">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Streams</CardTitle>
        </CardHeader>
        <CardContent>
          <FormattedMetric value={streams} />
        </CardContent>
      </Card>
      <Card size="sm" className="gap-1!">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Time</CardTitle>
        </CardHeader>
        <CardContent>
          <FormattedMetric value={playtime} unit="min" />
        </CardContent>
      </Card>
      <Card size="sm" className="gap-1!">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Avg.</CardTitle>
        </CardHeader>
        <CardContent>
          <FormattedMetric value={streams > 0 ? playtime / streams : 0} unit="min" />
        </CardContent>
      </Card>
    </CatalogDetailsSection>
  )
}
