import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterIcon } from '@hugeicons/core-free-icons';
import { Button } from '@harmony/ui/components/button';
import { query } from '@/lib/duck-query'
import { CatalogTable } from '@/components/catalog/catalog-table'
import { ViewModeToggle } from '@/components/toolbar/view-mode-toggle';

const topAlbumsQuery = query.albums.top.queryOptions({ size: 50 })

export const Route = createFileRoute('/app/$packageId/albums')({
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise
    return queryClient.ensureQueryData(topAlbumsQuery)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useQuery(topAlbumsQuery)

  return (
    <div>
      <div className="flex items-center justify-between gap-2 py-2 px-4">
        <h4 className="font-semibold tracking-tight">Albums</h4>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <HugeiconsIcon icon={FilterIcon} />
            Filters
          </Button>
          <ViewModeToggle size="sm" />
          <Button variant="secondary" size="sm">
            12 Jan 2024 - 15 Mar 2026
          </Button>
        </div>
      </div>
      <CatalogTable catalog={data} />
    </div>
  )
}
