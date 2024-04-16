import { StatsCard } from '@/components/stats-card'
import { useTimeRangeStore } from '@/lib/state'
import { getStats } from '@/lib/store'
import { Text, Title } from '@mantine/core'
import { AudioLines, Disc3, Headphones, ListMusic, Music, UsersRound } from 'lucide-react'
import React from 'react'
import ScrollArea from './ui/scrollArea'
import Link from 'next/link'

const formatTime = (ms: number) => {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

const formatDate = (date: string) => {
  const [year, month, day] = date.split('-')
  return `${month}/${day}/${year}`
}

type StatsCardData = Array<{
  icon: React.ReactNode
  title: { value: string, textBefore?: string, textAfter?: string }
  subtitle: string
}>

type Props = {
  version: 'grid' | 'scroll'
}

export const StatsCardsSection = ({ version }: Props) => {
  const { timeRange } = useTimeRangeStore()
  const stats = getStats(timeRange)
  if (!stats) return null

  const statsCard: StatsCardData = [
    {
      icon: <Music size={28} />,
      title: {
        value: stats.total_streams.toLocaleString('en-US'),
        textAfter: 'Streams'
      },
      subtitle: `That's about ${stats.average_daily_streams.toLocaleString('en-US')} streams per day`
    },
    {
      icon: <Headphones size={28} />,
      title: {
        value: formatTime(stats.total_ms_played),
        textAfter: 'Played'
      },
      subtitle: `That's about ${formatTime(stats.average_daily_ms_played)} per day`
    },
    {
      icon: <UsersRound size={28} />,
      title: {
        value: stats.total_artists.toLocaleString('en-US'),
        textAfter: 'Artists'
      },
      subtitle: `Well, you know a lot of artists`
    },
    {
      icon: <Disc3 size={28} />,
      title: {
        value: stats.total_albums.toLocaleString('en-US'),
        textAfter: 'Albums'
      },
      subtitle: `Your music library is growing`
    },
    {
      icon: <AudioLines size={28} />,
      title: {
        value: stats.total_tracks.toLocaleString('en-US'),
        textAfter: 'Tracks'
      },
      subtitle: `That's a lot of music`
    },
    {
      icon: <ListMusic size={28} />,
      title: {
        value: stats.day_with_most_streams.streams.toLocaleString('en-US'),
        textAfter: `Streams on ${formatDate(stats.day_with_most_streams.date)}`
      },
      subtitle: `You listened to ${formatTime(stats.day_with_most_streams.ms_played)} that day`
    }
  ]

  if (version === 'grid') return (
    <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max gap-4 w-full'>
      {statsCard.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </section>
  )

  return (
    <section>
      <div className='flex items-center justify-between mb-1'>
        <Title order={2}>Sheer numbers</Title>
        <Link href='/stats' className='text-primary py-1 pl-2'><Text fw={500}>More</Text></Link>
      </div>
      <ScrollArea orientation="horizontal">
        <div className="flex gap-3">
          {statsCard.slice(0, 5).map((card, index) => (
            <StatsCard key={index} {...card} className='h-[70px] w-[266px]' />
          ))}
        </div>
      </ScrollArea>
    </section>
  )
}
