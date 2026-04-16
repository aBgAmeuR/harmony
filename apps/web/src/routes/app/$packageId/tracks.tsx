import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { Tabs, TabsList, TabsTrigger } from '@harmony/ui/components/tabs'
import { Button } from '@harmony/ui/components/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { FilterIcon, SlidersHorizontalIcon } from '@hugeicons/core-free-icons'
import { z } from 'zod'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@harmony/ui/components/resizable'
import { useDefaultLayout } from 'react-resizable-panels'
import type { DateRangeMode } from '@/lib/store'
import { useDateRangeStore, useInstantRangeQuery } from '@/lib/store'
import { api } from '@/lib/api'
import { CatalogTable } from '@/components/catalog/catalog-table'
import { DateRangeFilter } from '@/components/toolbar/date-range-filter'
import { CatalogDetailsPanel } from '@/components/catalog/details/catalog-details-panel'
import { cookieStorage } from '@/lib/resizable-panels'

const trackSearchSchema = z.object({
  track: z.number().optional(),
})

export const Route = createFileRoute('/app/$packageId/tracks')({
  validateSearch: trackSearchSchema,
  loader: ({ context }) => {
    const { queryClient, pkg } = context
    void queryClient.prefetchQuery(api.package.tracks.top.queryOptions({ params: { id: pkg.id } }))
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { pkg } = Route.useRouteContext()
  const { track } = Route.useSearch()
  const mode = useDateRangeStore((s) => s.mode)
  const setMode = useDateRangeStore((s) => s.setMode)
  const instantQuery = useInstantRangeQuery()
  const navigate = useNavigate()

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: 'tracks-layout',
    panelIds: track ? ['tracks-panel', 'track-details-panel'] : ['tracks-panel'],
    storage: cookieStorage,
  })

  const { data, isLoading } = useQuery(
    api.package.tracks.top.queryOptions({ params: { id: pkg.id }, query: instantQuery })
  )

  const { data: trackDetails, isLoading: isTrackDetailsLoading } = useQuery(
    api.package.tracks.get.queryOptions(
      { params: { id: pkg.id, trackId: track! }, query: instantQuery },
      { enabled: !!track }
    )
  )

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="min-h-0 w-full h-svh!"
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
    >
      <ResizablePanel id="tracks-panel" className="flex min-h-0 min-w-0 flex-col overflow-hidden!">
        <div className="flex shrink-0 items-center justify-between gap-2 p-4 pb-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tracks</h1>
            <p className="text-sm text-muted-foreground">
              Discover your most listened to tracks based on your listening history
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline">
              <HugeiconsIcon icon={SlidersHorizontalIcon} className="size-4" />
              Display
            </Button>
            <Button variant="secondary">
              <HugeiconsIcon icon={FilterIcon} className="size-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="shrink-0 border-b border-border px-4">
          <div className="flex gap-3 pt-4 items-center justify-between">
            <Tabs value={mode} onValueChange={(value) => setMode(value as DateRangeMode)}>
              <TabsList variant="line" className="gap-4">
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Years</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex shrink-0 justify-end pb-1">
              <DateRangeFilter />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2">
          <CatalogTable catalog={data?.tracks} empty="No tracks yet." loading={isLoading} />
        </div>
      </ResizablePanel>
      {(trackDetails || isTrackDetailsLoading) && (
        <>
          <ResizableHandle />
          <ResizablePanel id="track-details-panel" defaultSize={300} minSize={300} maxSize={500}>
            <CatalogDetailsPanel
              close={() => navigate({ to: '.', search: { track: undefined }, resetScroll: false })}
              details={trackDetails?.details}
              isLoading={isTrackDetailsLoading}
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}
