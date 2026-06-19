import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@harmony/ui/components/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { FilterIcon } from '@hugeicons/core-free-icons'
import { useInstantRangeQuery, useUserPreferencesStore } from '@/lib/store'
import { api } from '@/lib/api'
import { CatalogGrid } from '@/components/catalog/catalog-grid'
import { CatalogTable } from '@/components/catalog/catalog-table'
import { ViewModeMenu } from '@/components/toolbar/view-mode-menu'
import {
  CatalogDateRangeTabs,
  CatalogPageHeader,
  CatalogPageShellList,
  CatalogPageShellRoot,
  CatalogScrollArea,
  catalogSearchSchema,
} from '@/components/catalog/layout'

export const Route = createFileRoute('/appv1/$packageId/albums')({
  validateSearch: catalogSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { pkg } = Route.useRouteContext()
  const { details } = Route.useSearch()
  const instantQuery = useInstantRangeQuery()
  const viewMode = useUserPreferencesStore((s) => s.viewMode)

  const { data, isLoading } = useQuery(
    api.package.albums.top.queryOptions({ params: { id: pkg.id }, query: instantQuery })
  )

  return (
    <CatalogPageShellRoot hasDetails={!!details}>
      <CatalogPageShellList>
        <CatalogPageHeader
          title="Albums"
          description="A ranked view of the albums you've spent the most time with"
        >
          <ViewModeMenu />
          <Button variant="secondary">
            <HugeiconsIcon icon={FilterIcon} className="size-4" />
            Filters
          </Button>
        </CatalogPageHeader>

        <CatalogDateRangeTabs />

        <CatalogScrollArea>
          {viewMode === 'grid' ? (
            <CatalogGrid catalog={data?.albums} empty="No albums yet." loading={isLoading} />
          ) : (
            <CatalogTable catalog={data?.albums} empty="No albums yet." loading={isLoading} />
          )}
        </CatalogScrollArea>
      </CatalogPageShellList>
    </CatalogPageShellRoot>
  )
}
