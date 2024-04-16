import { ChartData, StatsData, TimeRange } from '@/types'
import { LineChart as MantineLineChart } from '@mantine/charts'
import { LineChartTooltip } from './line-chart-tooltip'

const formatChartTime = (timeMs: number) => {
  const hours = Math.floor(timeMs / 3600000)
  return `${hours}h`
}

const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

type Props = {
  stats: StatsData[TimeRange]
}

export const LineChart = ({ stats }: Props) => {
  return (
    <div className='p-1'>
      <MantineLineChart
        h={250}
        data={stats.hourly_distribution}
        dataKey="time"
        tickLine="x"
        valueFormatter={(value) => formatChartTime(value)}
        tooltipAnimationDuration={200}
        xAxisProps={{ interval: 1 }}
        tooltipProps={{
          content: ({ label, payload }) => <LineChartTooltip label={label} payload={payload} average={stats.average_daily_ms_played} />,
        }}
        referenceLines={[
          { y: average(stats.hourly_distribution.map((item: ChartData[0]) => item.total_ms_played)), label: 'Average', color: '#dc2626' }
        ]}
        series={[{ name: 'total_ms_played', color: '#0db14d', label: 'Time played' }]}
      />
    </div>
  )
}
