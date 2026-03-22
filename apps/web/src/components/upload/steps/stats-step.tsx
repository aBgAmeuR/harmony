import { useQuery } from '@tanstack/react-query'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { Button } from '@harmony/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@harmony/ui/components/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@harmony/ui/components/chart'
import { Bar, BarChart } from 'recharts'
import { Link } from '@tanstack/react-router';

interface StatsStepProps {
  packageName: string
  selectedFiles: Array<string>
  uploadId: string | null
  uploadCompleted: boolean
  onBack: () => void
  canBack?: boolean
}

type UploadStatsPayload = {
  LISTENING_BY_MONTH: Array<{ month: string; minutes: number }>
  totalTracks: number
  totalArtists: number
  totalListeningMinutes: number
}

const STATS_CHART_CONFIG: ChartConfig = {
  minutes: {
    label: 'Minutes',
    color: 'var(--primary)',
  },
}

function formatListeningTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

export function StatsStep({ uploadId, uploadCompleted, onBack, canBack = true }: StatsStepProps) {
  const statsQuery = useQuery({
    queryKey: ['upload-stats', uploadId],
    enabled: Boolean(uploadId) && uploadCompleted,
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3333'}/api/v1/uploads/${uploadId}/stats`
      )
      if (!res.ok) {
        throw new Error('Failed to fetch upload stats')
      }
      return (await res.json()) as UploadStatsPayload
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const stats = statsQuery.data ?? null
  const listeningByMonth = stats?.LISTENING_BY_MONTH ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Package stats ready</CardTitle>
        <CardDescription>
          Your package has been uploaded. You can now view usage and file insights.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {statsQuery.isLoading && (
          <p className="text-sm text-muted-foreground">Loading upload stats...</p>
        )}
        {statsQuery.isError && (
          <p className="text-sm text-destructive">Unable to load upload stats for this package.</p>
        )}
        {!uploadCompleted && (
          <p className="text-sm text-muted-foreground">
            Stats will be available once upload is completed.
          </p>
        )}
        {!statsQuery.isLoading && !statsQuery.isError && uploadCompleted && !stats && (
          <p className="text-sm text-muted-foreground">
            No stats are available yet for this upload.
          </p>
        )}

        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 max-sm:divide-y sm:divide-x">
            <div className="flex flex-col px-3 py-2">
              <span className="text-xs text-muted-foreground">Total tracks</span>
              <span className="text-xl font-semibold text-foreground">
                {(stats?.totalTracks ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col px-3 py-2">
              <span className="text-xs text-muted-foreground">Artists</span>
              <span className="text-xl font-semibold text-foreground">
                {(stats?.totalArtists ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col px-3 py-2">
              <span className="text-xs text-muted-foreground">Listening time</span>
              <span className="text-xl font-semibold text-foreground">
                {formatListeningTime(stats?.totalListeningMinutes ?? 0)}
              </span>
            </div>
          </div>

          <div className="border-t p-3">
            <ChartContainer config={STATS_CHART_CONFIG} className="h-[100px] w-full">
              <BarChart
                accessibilityLayer
                data={listeningByMonth}
                barCategoryGap={1}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <Bar dataKey="minutes" fill="var(--color-minutes)" radius={0} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      nameKey="minutes"
                      labelFormatter={(value) => value.toString()}
                    />
                  }
                  cursor={false}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 py-1">
          <span className="h-px max-w-16 flex-1 bg-border" aria-hidden />
          <p className="shrink-0 text-center text-xs text-muted-foreground">
            Full breakdown in dashboard
          </p>
          <span className="h-px max-w-16 flex-1 bg-border" aria-hidden />
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={!canBack}>
          Back
        </Button>
        <Button asChild size="sm">
          <Link to="/app/$packageId/package" params={{ packageId: uploadId ?? '' }}>
            View package stats
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
