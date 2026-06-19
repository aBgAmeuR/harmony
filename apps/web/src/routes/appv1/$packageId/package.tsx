import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Alert02Icon,
  Cancel01Icon,
  ChartHistogramIcon,
  Clock01Icon,
  DatabaseIcon,
  Delete02Icon,
  Files01Icon,
  Loading03Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Badge } from '@harmony/ui/components/badge'
import { Button } from '@harmony/ui/components/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@harmony/ui/components/card'
import { useState } from 'react'
import { api } from '@/lib/api'
import { Pipeline } from '@/components/pipeline'

export const Route = createFileRoute('/appv1/$packageId/package')({
  loader: ({ context }) => {
    const { queryClient, pkg } = context
    void queryClient.prefetchQuery(
      api.package.package.stats.queryOptions({ params: { id: pkg.id } })
    )
  },
  component: RouteComponent,
})

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(2)} MB`
}

function formatDuration(value: number | null): string {
  if (value === null || value < 0) return '-'
  if (value < 1000) return `${value} ms`
  return `${(value / 1000).toFixed(2)} s`
}

function prettifyStepKey(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

type PackageHeaderProps = {
  pkg: { fileName: string; status: string; id: string }
  subtitle: string
  isDeleting: boolean
  onDelete: () => void
}

function PackageHeaderSection({ pkg, subtitle, isDeleting, onDelete }: PackageHeaderProps) {
  return (
    <section className="space-y-2">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="truncate text-lg font-semibold tracking-tight">
            {pkg.fileName}
          </CardTitle>
          <CardDescription className="text-xs">{subtitle}</CardDescription>
          <CardAction className="flex flex-wrap items-center gap-2">
            <Button variant="destructive" size="sm" onClick={onDelete} disabled={isDeleting}>
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </CardAction>
        </CardHeader>
        <CardFooter className="space-x-1 text-xs text-muted-foreground">
          <span>Package ID</span>
          <span>•</span>
          <span className="font-mono text-foreground/80">{pkg.id}</span>
        </CardFooter>
      </Card>
    </section>
  )
}

function RouteComponent() {
  const { pkg } = Route.useRouteContext()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuery(
    api.package.package.stats.queryOptions({ params: { id: pkg.id } })
  )
  const [isDeleting, setIsDeleting] = useState(false)

  const details = data

  async function onDeletePackage() {
    const confirmed = window.confirm('Delete this package and all imported interactions?')
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3333'}/api/v1/package/${pkg.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Unable to delete package')
      }

      await navigate({ to: '/' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-3 pt-12">
      <section className="space-y-2">
        <h2 className="mb-3 text-xs font-semibold text-muted-foreground">Overview</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <Card size="sm" className="gap-0!">
            <CardHeader>
              <CardAction>
                <HugeiconsIcon icon={Clock01Icon} className="size-4 text-muted-foreground" />
              </CardAction>
              <CardTitle className="text-muted-foreground">Total duration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {formatDuration(details?.totalDurationMs ?? null)}
              </p>
              <p className="text-xs text-muted-foreground">End-to-end processing time</p>
            </CardContent>
          </Card>
          <Card size="sm" className="gap-0!">
            <CardHeader>
              <CardAction>
                <HugeiconsIcon icon={Tick02Icon} className="size-4 text-muted-foreground" />
              </CardAction>
              <CardTitle className="text-muted-foreground">Interactions kept</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {details?.summary.normalizeKeptCount.toLocaleString() ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground">After normalization</p>
            </CardContent>
          </Card>
          <Card size="sm" className="gap-0!">
            <CardHeader>
              <CardAction>
                <HugeiconsIcon icon={Alert02Icon} className="size-4 text-muted-foreground" />
              </CardAction>
              <CardTitle className="text-muted-foreground">Skipped tracks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {details?.summary.skippedTracksCount.toLocaleString() ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground">During enrichment</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="mb-3 text-xs font-semibold text-muted-foreground">Pipeline</h2>
        <Card className="gap-0 divide-y divide-border p-0">
          {isLoading ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">Loading upload details...</div>
          ) : null}
          {isError ? (
            <div className="px-3 py-3 text-sm text-destructive">Unable to load upload details.</div>
          ) : null}
          {!isLoading && !isError
            ? details?.steps?.map((step) => {
                return (
                  <div key={step.key} className="flex items-center gap-3 px-3 py-2.5">
                    {step.status === 'done' ? (
                      <HugeiconsIcon icon={Tick02Icon} className="size-4 shrink-0 text-primary" />
                    ) : step.status === 'error' ? (
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        className="size-4 shrink-0 text-destructive"
                      />
                    ) : (
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        className="size-4 shrink-0 animate-spin text-primary"
                      />
                    )}
                    <span className="min-w-0 flex-1 text-sm text-foreground">
                      {prettifyStepKey(step.key)}
                    </span>
                    {step.key === 'parse_interactions' && details?.summary ? (
                      <Badge variant="secondary">{details.summary.parseValidatedCount}</Badge>
                    ) : null}
                    {step.key === 'normalize_interactions' && details?.summary ? (
                      <div className="flex items-center gap-1">
                        <Badge variant="active">{details.summary.normalizeKeptCount}</Badge>
                        <Badge variant="destructive">
                          {details.summary.normalizeRejectedCount}
                        </Badge>
                      </div>
                    ) : null}
                    {step.key === 'enrich_tracks' && details?.summary ? (
                      <Badge variant="secondary">
                        {details.summary.skippedTracksCount} /{' '}
                        {(details.summary.skippedTracksCount ?? 0) +
                          (details.summary.processedTracksCount ?? 0)}
                      </Badge>
                    ) : null}
                    {step.key === 'persist_interactions' && details?.summary ? (
                      <Badge variant="secondary">
                        {details.summary.interactionsPersistAttempted}
                      </Badge>
                    ) : null}
                    <span className="min-w-[52px] shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {formatDuration(step.durationMs)}
                    </span>
                  </div>
                )
              })
            : null}
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="mb-3 text-xs font-semibold text-muted-foreground">Pipeline</h2>
        <Pipeline />
      </section>

      {details?.summary ? (
        <section className="space-y-2">
          <h2 className="mb-3 text-xs font-semibold text-muted-foreground">Upload summary</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <Card size="sm" className="gap-0!">
              <CardHeader>
                <CardAction>
                  <HugeiconsIcon icon={Files01Icon} className="size-4 text-muted-foreground" />
                </CardAction>
                <CardTitle className="text-muted-foreground">Files</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {details.summary.filesTakenCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  kept / {details.summary.filesSelectedCount.toLocaleString()} rejected
                </p>
              </CardContent>
            </Card>

            <Card size="sm" className="gap-0!">
              <CardHeader>
                <CardAction>
                  <HugeiconsIcon
                    icon={ChartHistogramIcon}
                    className="size-4 text-muted-foreground"
                  />
                </CardAction>
                <CardTitle className="text-muted-foreground">Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {details.summary.normalizeKeptCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  kept / {details.summary.normalizeRejectedCount.toLocaleString()} rejected
                </p>
              </CardContent>
            </Card>

            <Card size="sm" className="gap-0!">
              <CardHeader>
                <CardAction>
                  <HugeiconsIcon icon={DatabaseIcon} className="size-4 text-muted-foreground" />
                </CardAction>
                <CardTitle className="text-muted-foreground">Persisted attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {details.summary.interactionsPersistAttempted.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  skipped {details.summary.skippedInteractionsCount.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}

      {details?.failure ? (
        <section className="space-y-2">
          <h2 className="mb-3 text-xs font-semibold text-destructive">Failure</h2>
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {details.failure.message}
          </div>
        </section>
      ) : null}

      <PackageHeaderSection
        pkg={pkg}
        subtitle={`${new Date(pkg.createdAt).toLocaleDateString()} • ${formatBytes(pkg.fileSize)}`}
        isDeleting={isDeleting}
        onDelete={onDeletePackage}
      />
    </div>
  )
}
