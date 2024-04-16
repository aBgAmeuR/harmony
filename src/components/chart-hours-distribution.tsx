import { Title } from '@mantine/core'
import React from 'react'
import { LineChart } from './charts/line-chart'
import { StatsCard } from './stats-card'
import { ArrowUpWideNarrow, FastForward, History } from 'lucide-react'
import { getStats } from '@/lib/store'
import { useTimeRangeStore } from '@/lib/state'
import { ChartData } from '@/types'

const formatTime = (ms: number) => {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

const getMostStreamsTimeDay = (data: ChartData) => {
  const mostStreams = data.reduce((prev, current) => (prev.total_ms_played > current.total_ms_played) ? prev : current)
  const time = mostStreams.time
  const when = mostStreams.total_ms_played

  return { time, when }
}

export const ChartHoursDistribution = () => {
  const { timeRange } = useTimeRangeStore()
  const stats = getStats(timeRange)
  if (!stats) return null

  return (
    <section className='flex flex-col gap-4 mt-8'>
      <Title order={2}>Your Spotify hours</Title>
      <div className='grid sm:grid-cols-[1fr_250px] gap-3'>
        <LineChart stats={stats} />
        <div className='flex flex-col gap-2 h-full'>
          <StatsCard
            icon={<FastForward size={28} />}
            title={{ value: stats.average_daily_streams.toLocaleString('en-US'), textAfter: 'Streams per day' }}
            subtitle={`You listen to a lot of music`}
          />
          <StatsCard
            icon={<History size={28} />}
            title={{ value: formatTime(stats.average_daily_ms_played), textAfter: 'Played per day' }}
            subtitle={`You really love music`}
          />
          <StatsCard
            icon={<ArrowUpWideNarrow size={28} />}
            title={{ value: getMostStreamsTimeDay(stats.hourly_distribution).time, textBefore: 'You listen most at' }}
            subtitle={`With ${formatTime(getMostStreamsTimeDay(stats.hourly_distribution).when)} played that hour`}
          />
        </div>
      </div>
    </section>
  )
}
