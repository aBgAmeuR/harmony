import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { skipToken, useQuery } from '@tanstack/react-query'

import { Button } from '@harmony/ui/components/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { FilterIcon, SlidersHorizontalIcon } from '@hugeicons/core-free-icons'
import { useInstantRangeQuery } from '@/lib/store'
import { api } from '@/lib/api'
import { CatalogTable } from '@/components/catalog/catalog-table'
import { CatalogDetailsPanel } from '@/components/catalog/details/catalog-details-panel'
import {
  CatalogDateRangeTabs,
  CatalogPageHeader,
  CatalogPageShellDetails,
  CatalogPageShellList,
  CatalogPageShellRoot,
  CatalogScrollArea,
  catalogSearchSchema,
} from '@/components/catalog/layout'

export const Route = createFileRoute('/appv1/$packageId/tracks')({
  validateSearch: catalogSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { pkg } = Route.useRouteContext()
  const { details } = Route.useSearch()
  const instantQuery = useInstantRangeQuery()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery(
    api.package.tracks.top.queryOptions({ params: { id: pkg.id }, query: instantQuery })
  )

  const trackDetailsQuery =
    details === undefined
      ? api.package.tracks.get.queryOptions(skipToken)
      : api.package.tracks.get.queryOptions({
          params: { id: pkg.id, trackId: details },
          query: { ...instantQuery, trackId: details },
        })

  const { data: trackDetails, isLoading: isTrackDetailsLoading } = useQuery(trackDetailsQuery)

  return (
    <CatalogPageShellRoot hasDetails={!!details}>
      <CatalogPageShellList>
        <CatalogPageHeader
          title="Tracks"
          description="See which songs you keep coming back to"
        >
          <Button variant="outline">
            <HugeiconsIcon icon={SlidersHorizontalIcon} className="size-4" />
            Display
          </Button>
          <Button variant="secondary">
            <HugeiconsIcon icon={FilterIcon} className="size-4" />
            Filters
          </Button>
        </CatalogPageHeader>

        <CatalogDateRangeTabs />

        <CatalogScrollArea>
          <CatalogTable catalog={data?.tracks} empty="No tracks yet." loading={isLoading} />
        </CatalogScrollArea>
      </CatalogPageShellList>

      <CatalogPageShellDetails open={!!(trackDetails || isTrackDetailsLoading)}>
        <CatalogDetailsPanel
          close={() => navigate({ to: '.', search: { details: undefined }, resetScroll: false })}
          details={trackDetails?.details}
          isLoading={isTrackDetailsLoading}
        />
      </CatalogPageShellDetails>
    </CatalogPageShellRoot>
  )
}
