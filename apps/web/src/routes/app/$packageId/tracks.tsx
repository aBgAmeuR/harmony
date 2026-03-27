import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@harmony/ui/components/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@harmony/ui/components/sheet'
import { Button } from '@harmony/ui/components/button'

import { HugeiconsIcon } from '@hugeicons/react'
import { FilterIcon } from '@hugeicons/core-free-icons'

import { ViewModeToggle } from '@/components/toolbar/view-mode-toggle'
import { DateRangeFilter } from '@/components/toolbar/date-range-filter'
import { Layout, LayoutContent, LayoutHeader } from '@/components/layout/page-layout'
import { api } from '@/lib/api'
import { CatalogTable } from '@/components/catalog/catalog-table'

export const Route = createFileRoute('/app/$packageId/tracks')({
  loader: ({ context }) => {
    const { queryClient, pkg } = context
    void queryClient.prefetchQuery(api.package.tracks.top.queryOptions({ params: { id: pkg.id } }))
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { pkg } = Route.useRouteContext()

  const { data, isLoading, isError } = useQuery(
    api.package.tracks.top.queryOptions({ params: { id: pkg.id } })
  )

  return (
    <Layout>
      <LayoutHeader
        items={['Tracks']}
        metadata={{
          title: 'Tracks',
          description: 'Discover your most listened to tracks based on your listening history',
        }}
      >
        <DateRangeFilter />
        <ViewModeToggle />

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary">
              <HugeiconsIcon icon={FilterIcon} className="size-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                This is a mock filter panel. Interactions and API wiring will be added later.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 px-4 pb-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Artist</p>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  All artists
                  <span>v</span>
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Album</p>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  All albums
                  <span>v</span>
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Platform</p>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  All platforms
                  <span>v</span>
                </Button>
              </div>
            </div>

            <SheetFooter>
              <Button variant="outline">Reset</Button>
              <Button>Apply filters</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </LayoutHeader>
      <LayoutContent>
        {isError ? (
          <Card size="sm">
            <CardContent className="text-sm text-destructive">Unable to load tracks.</CardContent>
          </Card>
        ) : (
          <Card className="p-0">
            <CatalogTable catalog={data?.tracks} empty="No tracks yet." loading={isLoading} />
          </Card>
        )}
      </LayoutContent>
    </Layout>
  )
}
