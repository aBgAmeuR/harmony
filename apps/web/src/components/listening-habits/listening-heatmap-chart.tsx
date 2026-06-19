import { useMemo } from 'react'
import {
  HeatmapCells,
  HeatmapChart,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapLegend,
  type HeatmapLevelStyles,
  HeatmapTooltip,
  HeatmapXAxis,
  HeatmapYAxis,
} from '@harmony/ui/charts'
import type { ListeningHabitMetric } from '@/lib/duck-query'
import { buildYearHeatmapColumns, toDateKey } from '@/lib/listening-habits/build-listening-heatmap'

const heatmapLevelStyles = [
  { color: 'var(--color-muted)', fillMode: 'solid', pattern: 'none' },
  { color: '#0e4429', fillMode: 'solid', pattern: 'none' },
  { color: '#006d32', fillMode: 'solid', pattern: 'none' },
  { color: '#26a641', fillMode: 'solid', pattern: 'none' },
  { color: '#39d353', fillMode: 'solid', pattern: 'none' },
] as const satisfies HeatmapLevelStyles

const heatmapTooltipDateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

type ListeningHeatmapChartProps = {
  data?: ListeningHabitMetric
  year: number
}

export function ListeningHeatmapChart({ data, year }: ListeningHeatmapChartProps) {
  const minutesByDate = data?.heatmapMinutesByDate ?? {}

  const yearHeatmapData = useMemo(
    () => buildYearHeatmapColumns(year, minutesByDate),
    [minutesByDate, year],
  )

  return (
    <HeatmapInteractionProvider>
      <HeatmapInteractionBoundary className="pb-2">
        <HeatmapChart
          key={year}
          data={yearHeatmapData}
          gap={2}
          levelStyles={heatmapLevelStyles}
          enterTransition={{ type: 'tween', ease: [0.85, 0, 0.15, 1] }}
          enterStaggerScale={1}
          margin={{ top: 24, right: 0, bottom: 8, left: 32 }}
        >
          <HeatmapCells cornerRadius={2} fadedOpacity={0.3} />
          <HeatmapXAxis />
          <HeatmapYAxis />
          <HeatmapTooltip
            formatLabel={(_level, date) => {
              const minutes = minutesByDate[toDateKey(date)] ?? 0
              return `${minutes.toLocaleString('en-US')} min on ${heatmapTooltipDateFmt.format(date)}`
            }}
          />
        </HeatmapChart>
        <HeatmapLegend cornerRadius={2} gap={2} levelStyles={heatmapLevelStyles} />
      </HeatmapInteractionBoundary>
    </HeatmapInteractionProvider>
  )
}
