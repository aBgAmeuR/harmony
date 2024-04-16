import { useTimeRangeStore } from '@/lib/state'
import { getStats } from '@/lib/store'
import { Text, Title } from '@mantine/core'
import { BarChart } from '@/components/charts/bar-chart'
import Link from 'next/link'

type Props = {
  moreBtn?: boolean
}

export const ChartActivityMonth = ({ moreBtn }: Props) => {
  const { timeRange } = useTimeRangeStore()
  const barChartInterval = timeRange === 'short_term' ? 0 : timeRange === 'medium_term' ? 1 : 4
  const stats = getStats(timeRange)
  if (!stats) return null

  return (
    <section className='flex flex-col gap-4 mt-8'>
      <div className='flex items-center justify-between mb-1'>
        <Title order={2}>Activity by month</Title>
        {moreBtn ? <Link href='/stats' className='text-primary py-1 pl-2'><Text fw={500}>More</Text></Link> : null}
      </div>
      <BarChart stats={stats} barChartInterval={barChartInterval} />
    </section>
  )
}
