import { useQueries } from '@tanstack/react-query'
import { Button } from '@harmony/ui/components/button'
import { ArrowDown01Icon, FilterIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Bar,
  BarChart,
  BarValueYAxis,
  BarXAxis,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  XAxis,
} from '@harmony/ui/charts'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@harmony/ui/components/card'
import { ToggleGroup, ToggleGroupItem } from '@harmony/ui/components/toggle-group'
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { cn } from '@harmony/ui/lib/utils'
import { type ListeningHabitMetric, query } from '@/lib/duck-query'
import { ViewModeToggle } from '@/components/toolbar/view-mode-toggle'
import { FormattedMetric } from '@/components/format/formatted-metric'
import { CatalogImage } from '@/components/catalog/catalog-image'
import { ListeningHeatmapChart } from '@/components/listening-habits/listening-heatmap-chart'
import { getListeningYears } from '@/lib/listening-habits/build-listening-heatmap'

const AVG_DAILY_METRIC_INDEX = 4
const PEAK_HOUR_METRIC_INDEX = 5

function parseMonthTrendLabel(label: string): Date {
  return new Date(`1 ${label}`)
}

const dateRange = {}

const totalPlaytimeQuery = query.listeningHabits.totalPlaytime.queryOptions(dateRange)
const streamsQuery = query.listeningHabits.streams.queryOptions(dateRange)
const uniqueTracksQuery = query.listeningHabits.uniqueTracks.queryOptions(dateRange)
const uniqueArtistsQuery = query.listeningHabits.uniqueArtists.queryOptions(dateRange)
const avgDailyPlaytimeQuery = query.listeningHabits.avgDailyPlaytime.queryOptions(dateRange)
const peakHourQuery = query.listeningHabits.peakHour.queryOptions(dateRange)
const shuffleRateQuery = query.listeningHabits.shuffleRate.queryOptions(dateRange)
const offlineRateQuery = query.listeningHabits.offlineRate.queryOptions(dateRange)

const listeningHabitsQueries = [
  totalPlaytimeQuery,
  streamsQuery,
  uniqueTracksQuery,
  uniqueArtistsQuery,
  avgDailyPlaytimeQuery,
  peakHourQuery,
  shuffleRateQuery,
  offlineRateQuery,
] as const

type MetricDefinition = {
  label: string
  unit?: string
  tooltipLabel: string
  tooltipUnit?: string
  formatValue?: (value: number) => string
}

const metricDefinitions: Array<MetricDefinition> = [
  {
    label: 'Total playtime',
    unit: 'min',
    tooltipLabel: 'Playtime',
    tooltipUnit: 'min',
  },
  {
    label: 'Streams',
    tooltipLabel: 'Streams',
  },
  {
    label: 'Unique tracks',
    tooltipLabel: 'Unique tracks',
  },
  {
    label: 'Unique artists',
    tooltipLabel: 'Unique artists',
  },
  {
    label: 'Avg. daily listening',
    unit: 'min',
    tooltipLabel: 'Playtime',
    tooltipUnit: 'min',
  },
  {
    label: 'Peak hour',
    tooltipLabel: 'Playtime',
    tooltipUnit: 'min',
    formatValue: (hour) => `${String(hour).padStart(2, '0')}:00`,
  },
  {
    label: 'Shuffle rate',
    unit: '%',
    tooltipLabel: 'Shuffle rate',
    tooltipUnit: '%',
  },
  {
    label: 'Offline rate',
    unit: '%',
    tooltipLabel: 'Offline rate',
    tooltipUnit: '%',
  },
]

export const Route = createFileRoute('/app/$packageId/listening-habits')({
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise
    await Promise.all(
      listeningHabitsQueries.map((queryOptions) => queryClient.ensureQueryData(queryOptions))
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedMetric, setSelectedMetric] = useState<number>(0)
  const [
    { data: totalPlaytime },
    { data: streams },
    { data: uniqueTracks },
    { data: uniqueArtists },
    { data: avgDailyPlaytime },
    { data: peakHour },
    { data: shuffleRate },
    { data: offlineRate },
  ] = useQueries({
    queries: [...listeningHabitsQueries],
  })

  const metricData = [
    totalPlaytime,
    streams,
    uniqueTracks,
    uniqueArtists,
    avgDailyPlaytime,
    peakHour,
    shuffleRate,
    offlineRate,
  ] as const

  const selected = metricDefinitions[selectedMetric] ?? metricDefinitions[0]
  const chartData = metricData[selectedMetric]?.trend ?? []
  const isTimeSeriesMetric =
    selectedMetric !== AVG_DAILY_METRIC_INDEX && selectedMetric !== PEAK_HOUR_METRIC_INDEX
  const lineChartData = useMemo(
    () =>
      isTimeSeriesMetric
        ? chartData.map((point) => ({
            ...point,
            date: parseMonthTrendLabel(point.label),
          }))
        : [],
    [chartData, isTimeSeriesMetric]
  )

  const heatmapMinutesByDate = avgDailyPlaytime?.heatmapMinutesByDate ?? {}
  const heatmapYears = useMemo(
    () => getListeningYears(heatmapMinutesByDate),
    [heatmapMinutesByDate]
  )
  const [heatmapYear, setHeatmapYear] = useState<number | null>(null)

  useEffect(() => {
    if (heatmapYears.length === 0) {
      return
    }

    if (heatmapYear === null || !heatmapYears.includes(heatmapYear)) {
      setHeatmapYear(heatmapYears[0])
    }
  }, [heatmapYear, heatmapYears])

  const activeHeatmapYear = heatmapYear ?? heatmapYears[0]

  return (
    <div>
      <div className="flex items-center justify-between gap-2 py-2 px-4">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold tracking-tight">Listening Habits</h4>
          <span className="text-muted-foreground pb-0.5">/</span>
          {/* <h4 className="font-semibold tracking-tight text-muted-foreground">All Artists</h4> */}
          <Button variant="ghost" size="sm" className="px-1! -ms-1!">
            <CatalogImage
              image={'https://api.deezer.com/artist/10002824/image'}
              alt="Playboi Carti"
              className="size-5"
            />
            <h4 className="font-semibold tracking-tight text-muted-foreground">Playboi Carti</h4>
            <HugeiconsIcon icon={ArrowDown01Icon} className="text-muted-foreground" />
          </Button>
        </div>
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
      <div className="flex flex-col gap-3 px-4">
        <Card size="sm" className="p-0!">
          <CardContent className="p-0! grid grid-cols-4 divide-x divide-y">
            {metricDefinitions.map((metric, index) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                unit={metric.unit}
                data={metricData[index]}
                formatValue={metric.formatValue}
                onClick={() => setSelectedMetric(index)}
                selected={selectedMetric === index}
              />
            ))}
          </CardContent>
        </Card>
        <Card size="sm" className="pb-0!">
          <CardHeader>
            <CardTitle>{selected.label}</CardTitle>
            {selectedMetric === AVG_DAILY_METRIC_INDEX &&
            heatmapYears.length > 0 &&
            activeHeatmapYear != null ? (
              <CardAction>
                <ToggleGroup
                  type="single"
                  aria-label="Year"
                  value={String(activeHeatmapYear)}
                  onValueChange={(value) => {
                    if (value) {
                      setHeatmapYear(Number(value))
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  {heatmapYears.map((year) => (
                    <ToggleGroupItem key={year} value={String(year)}>
                      {year}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent>
            {selectedMetric === AVG_DAILY_METRIC_INDEX && activeHeatmapYear != null ? (
              <ListeningHeatmapChart data={avgDailyPlaytime} year={activeHeatmapYear} />
            ) : selectedMetric === AVG_DAILY_METRIC_INDEX ? null : selectedMetric ===
              PEAK_HOUR_METRIC_INDEX ? (
              <BarChart
                key={selectedMetric}
                aspectRatio="6 / 1"
                data={chartData}
                xDataKey="label"
                margin={{ top: 8, right: 8, bottom: 40, left: 48 }}
              >
                <Grid horizontal />
                <Bar dataKey="value" />
                <BarValueYAxis />
                <BarXAxis maxLabels={24} showAllLabels />
                <ChartTooltip
                  rows={(point) => [
                    {
                      color: 'var(--chart-line-primary)',
                      label: selected.tooltipLabel,
                      value: selected.tooltipUnit
                        ? `${point.value} ${selected.tooltipUnit}`
                        : String(point.value),
                    },
                  ]}
                />
              </BarChart>
            ) : (
              <LineChart
                key={selectedMetric}
                aspectRatio="6 / 1"
                data={lineChartData}
                xDataKey="date"
                margin={{ top: 8, right: 8, bottom: 40, left: 48 }}
              >
                <Grid horizontal />
                <Line dataKey="value" />
                <BarValueYAxis
                  formatTick={selected.tooltipUnit === '%' ? (value) => `${value}%` : undefined}
                />
                <XAxis tickMode="data" />
                <ChartTooltip
                  rows={(point) => [
                    {
                      color: 'var(--chart-line-primary)',
                      label: selected.tooltipLabel,
                      value: selected.tooltipUnit
                        ? `${point.value} ${selected.tooltipUnit}`
                        : String(point.value),
                    },
                  ]}
                />
              </LineChart>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

type MetricCardProps = PropsWithChildren<{
  label: string
  unit?: string
  data?: ListeningHabitMetric
  formatValue?: (value: number) => string
  onClick?: () => void
  selected?: boolean
}>

const MetricCard = ({
  label,
  unit,
  data,
  formatValue,
  onClick,
  selected,
  children,
}: MetricCardProps) => {
  const trend = data?.trend ?? []
  const value = data?.value ?? 0

  return (
    <div onClick={onClick} className={cn(selected && 'bg-muted')}>
      <div className="pt-3 ps-3 cursor-pointer">
        <h3 className="font-medium text-muted-foreground">{label}</h3>
        <span className="text-xl">
          {formatValue ? (
            <span className="text-md font-semibold">{formatValue(value)}</span>
          ) : (
            <FormattedMetric value={value} unit={unit} />
          )}
        </span>
      </div>
      {children}
      {!children && (
        <BarChart
          aspectRatio="6 / 1"
          data={trend}
          xDataKey="label"
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          animationDuration={0}
          barGap={0.1}
        >
          <Bar dataKey="value" lineCap="butt" />
        </BarChart>
      )}
    </div>
  )
}
