import { ChartData, StatsData, TimeRange } from '@/types'
import { BarChart as MantineBarChart } from '@mantine/charts'
import { BarChartTooltip } from './bar-chart-tooltip'

const formatChartTime = (timeMs: number) => {
  const hours = Math.floor(timeMs / 3600000)
  return `${hours}h`
}

const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

type Props = {
  stats: StatsData[TimeRange]
  barChartInterval: number
}

export const BarChart = ({ stats, barChartInterval }: Props) => {
  return (
    <div className='p-1'>
      <MantineBarChart
        h={250}
        data={stats.monthly_distribution}
        dataKey="time"
        tickLine="x"
        valueFormatter={(value) => formatChartTime(value)}
        tooltipAnimationDuration={200}
        xAxisProps={{ interval: barChartInterval }}
        tooltipProps={{
          content: ({ label, payload }) => <BarChartTooltip label={label} payload={payload} average={average(stats.monthly_distribution.map((item: ChartData[0]) => item.total_ms_played))} data={stats.monthly_distribution} />,
        }}
        referenceLines={[
          { y: average(stats.monthly_distribution.map((item: ChartData[0]) => item.total_ms_played)), label: 'Average', color: '#dc2626' }
        ]}
        series={[{ name: 'total_ms_played', color: '#0db14d', label: 'Streams' }]}
      />
    </div>
  )
}
