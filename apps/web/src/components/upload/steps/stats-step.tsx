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

interface StatsStepProps {
  packageName: string
  selectedFiles: Array<string>
  onBack: () => void
  canBack?: boolean
}

const LISTENING_BY_MONTH: Array<{ month: string; minutes: number }> = [
  { month: 'Jan', minutes: 1620 },
  { month: 'Feb', minutes: 1740 },
  { month: 'Mar', minutes: 1935 },
  { month: 'Apr', minutes: 1480 },
  { month: 'May', minutes: 2050 },
  { month: 'Jun', minutes: 1870 },
  { month: 'Jul', minutes: 2210 },
  { month: 'Aug', minutes: 2360 },
  { month: 'Sep', minutes: 1985 },
  { month: 'Oct', minutes: 2120 },
  { month: 'Nov', minutes: 1890 },
  { month: 'Dec', minutes: 2440 },
]

const STATS_CHART_CONFIG: ChartConfig = {
  minutes: {
    label: 'Listening time',
    color: 'var(--primary)',
  },
}

function formatListeningTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

export function StatsStep({ onBack, canBack = true }: StatsStepProps) {
  const totalTracks = 1482
  const totalArtists = 364
  const totalListeningMinutes = LISTENING_BY_MONTH.reduce((sum, item) => sum + item.minutes, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Package stats ready</CardTitle>
        <CardDescription>
          Your package has been uploaded. You can now view usage and file insights.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 max-sm:divide-y sm:divide-x">
            <div className="flex flex-col px-3 py-2">
              <span className="text-xs text-muted-foreground">Total tracks</span>
              <span className="text-xl font-semibold text-foreground">
                {totalTracks.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col px-3 py-2">
              <span className="text-xs text-muted-foreground">Artists</span>
              <span className="text-xl font-semibold text-foreground">
                {totalArtists.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col px-3 py-2">
              <span className="text-xs text-muted-foreground">Listening time</span>
              <span className="text-xl font-semibold text-foreground">
                {formatListeningTime(totalListeningMinutes)}
              </span>
            </div>
          </div>

          <div className="border-t p-3">
            <ChartContainer config={STATS_CHART_CONFIG} className="h-[100px] w-full">
              <BarChart accessibilityLayer data={LISTENING_BY_MONTH} barCategoryGap={1} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Bar dataKey="minutes" fill="var(--color-minutes)" radius={0} />
                <ChartTooltip
                  content={<ChartTooltipContent hideIndicator />}
                  cursor={false}
                  defaultIndex={1}
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
          <a href="#">
            View package stats
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
