import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@harmony/ui/components/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { FilterIcon } from '@hugeicons/core-free-icons'
import { CatalogTable } from '@/components/catalog/catalog-table'
import { query } from '@/lib/duck-query'
import { ViewModeToggle } from '@/components/toolbar/view-mode-toggle'

const topTracksQuery = query.tracks.top.queryOptions({ size: 50 })

export const Route = createFileRoute('/app/$packageId/tracks')({
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise
    return queryClient.ensureQueryData(topTracksQuery)
  },
  component: App,
})

function App() {
  const { data } = useQuery(topTracksQuery)

  return (
    <div>
      <div className="flex items-center justify-between gap-2 py-2 px-4">
        <h4 className="font-semibold tracking-tight">Tracks</h4>
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
