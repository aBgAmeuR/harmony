'use client'

import { useTimeRangeStore } from '@/lib/state'
import { getStats } from '@/lib/store'
import { LineChart, BarChart } from '@mantine/charts'
import { ColorSwatch, Paper, Text, Title } from '@mantine/core'
import { ArrowUpWideNarrow, AudioLines, Disc3, FastForward, Headphones, History, ListMusic, Music, UsersRound } from 'lucide-react'
import { ErrorList } from '../../ranking/_components/error-list'
import { ChartData } from '@/types'

const months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const formatTime = (ms: number) => {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

const formatDate = (date: string) => {
  const [year, month, day] = date.split('-')
  return `${month}/${day}/${year}`
}

const formatChartTime = (timeMs: number) => {
  const hours = Math.floor(timeMs / 3600000)
  return `${hours}h`
}

const formatMonthAndYear = (date: string) => {
  const [month, year] = date.split('/')
  return `${months[parseInt(month) - 1]} 20${year}`
}

const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

const getMostStreamsTimeDay = (data: ChartData) => {

  const mostStreams = data.reduce((prev, current) => (prev.total_ms_played > current.total_ms_played) ? prev : current)
  const time = mostStreams.time
  const when = mostStreams.total_ms_played

  return { time, when }
}



const Stats = () => {
  const { timeRange } = useTimeRangeStore()
  const barChartInterval = timeRange === 'short_term' ? 0 : timeRange === 'medium_term' ? 1 : 4
  const stats = getStats(timeRange)
  if (!stats) return <ErrorList />

  return (
    <section className="px-4 py-8 mx-auto w-full max-w-4xl">
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max gap-4 w-full'>
        <div className='p-3 rounded-lg shadow-md bg-secondary flex gap-3 w-full items-center'>
          <Music size={28} />
          <div className='flex flex-col w-full'>
            <Text fw={700} size="md"><span className='text-green'>{stats.total_streams.toLocaleString('en-US')}</span> Streams</Text>
            <Text size="sm" c="dimmed">That&apos;s about <span>{stats.average_daily_streams.toLocaleString('en-US')}</span> streams per day</Text>
          </div>
        </div>
        <div className='p-3 rounded-lg shadow-md bg-secondary flex gap-3 w-full items-center'>
          <Headphones size={28} />
          <div className='flex flex-col w-full'>
            <Text fw={700} size="md"><span className='text-green'>{formatTime(stats.total_ms_played)}</span> Played</Text>
            <Text size="sm" c="dimmed">That&apos;s about <span>{formatTime(stats.average_daily_ms_played)}</span> per day</Text>
          </div>
        </div>
        <div className='p-3 rounded-lg shadow-md bg-secondary flex gap-3 w-full items-center'>
          <UsersRound size={28} />
          <div className='flex flex-col w-full'>
            <Text fw={700} size="md"><span className='text-green'>{stats.total_artists.toLocaleString('en-US')}</span> Artists</Text>
            <Text size="sm" c="dimmed">Well, you know a lot of artists</Text>
          </div>
        </div>
        <div className='p-3 rounded-lg shadow-md bg-secondary flex gap-3 w-full items-center'>
          <Disc3 size={28} />
          <div className='flex flex-col w-full'>
            <Text fw={700} size="md"><span className='text-green'>{stats.total_albums.toLocaleString('en-US')}</span> Albums</Text>
            <Text size="sm" c="dimmed">Your music library is growing</Text>
          </div>
        </div>
        <div className='p-3 rounded-lg shadow-md bg-secondary flex gap-3 w-full items-center'>
          <AudioLines size={28} />
          <div className='flex flex-col w-full'>
            <Text fw={700} size="md"><span className='text-green'>{stats.total_tracks.toLocaleString('en-US')}</span> Tracks</Text>
            <Text size="sm" c="dimmed">That&apos;s a lot of music</Text>
          </div>
        </div>
        <div className='p-3 rounded-lg shadow-md bg-secondary flex gap-3 w-full items-center'>
          <ListMusic size={28} />
          <div className='flex flex-col w-full'>
            <Text fw={700} size="md"><span className='text-green'>{stats.day_with_most_streams.streams.toLocaleString('en-US')}</span> Streams on {formatDate(stats.day_with_most_streams.date)}</Text>
            <Text size="sm" c="dimmed">You listened to <span>{formatTime(stats.day_with_most_streams.ms_played)}</span> that day.</Text>
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-4 mt-8'>
        <Title order={2}>Your Spotify hours</Title>
        <div className='grid sm:grid-cols-[1fr_250px] gap-3'>
          <div className='p-1 w-full'>
            <LineChart
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
          <div className='flex flex-col gap-2 h-full'>
            <div className='p-3 rounded-lg shadow-md bg-secondary flex gap-3 w-full items-center'>
              <FastForward size={28} />
              <div className='flex flex-col w-full'>
                <Text fw={700} size="md"><span className='text-green'>{stats.average_daily_streams}</span> Streams per day</Text>
                <Text size="sm" c="dimmed">You listen to a lot of music</Text>
              </div>
            </div>
            <div className='p-3 rounded-lg shadow-md bg-secondary flex gap-3 w-full items-center'>
              <History size={28} />
              <div className='flex flex-col w-full'>
                <Text fw={700} size="md"><span className='text-green'>{formatTime(stats.average_daily_ms_played)}</span> Played per day</Text>
                <Text size="sm" c="dimmed">You really love music</Text>
              </div>
            </div>
            <div className='p-3 rounded-lg shadow-md bg-secondary flex gap-3 w-full items-center'>
              <ArrowUpWideNarrow size={28} />
              <div className='flex flex-col w-full'>
                <Text fw={700} size="md">You listen most at <span className='text-green'>{getMostStreamsTimeDay(stats.hourly_distribution).time}</span></Text>
                <Text size="sm" c="dimmed">With {formatTime(getMostStreamsTimeDay(stats.hourly_distribution).when)} played that hour</Text>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div className='flex flex-col gap-4 mt-8'>
        <Title order={2}>Activity by month</Title>
        <div className='p-1'>
          <BarChart
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
      </div>
    </section>
  )
}

export default Stats



interface LineChartTooltipProps {
  label: string;
  payload: Record<string, any>[] | undefined;
  average?: number;
}

function LineChartTooltip({ label, payload, average }: LineChartTooltipProps) {
  if (!payload) return null;

  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md" className='bg-secondary'>
      <Text fw={600} mb={5}>
        At {label}
      </Text>
      <div>
        {payload.map((item: any) => (
          <div key={item.name} className='flex items-center justify-between gap-4'>
            <div>
              <ColorSwatch
                color={item.color}
                size={12}
                withShadow={false}
                className='inline-block mr-2'
              />
              <Text fz="sm" className='inline-block'>
                Time
              </Text>
            </div>
            <Text fw={600} fz="sm">
              {formatTime(item.value)}
            </Text>
          </div>
        ))}
        {average ? (
          <div className='flex items-center justify-between gap-4'>
            <div>
              <ColorSwatch
                color="#dc2626"
                size={12}
                withShadow={false}
                className='inline-block mr-2'
              />
              <Text fz="sm" className='inline-block'>
                Average
              </Text>
            </div>
            <Text fw={600} fz="sm">
              {formatTime(average)}
            </Text>
          </div>
        ) : null}
      </div>
    </Paper>
  );
}

interface BarChartTooltipProps {
  label: string;
  payload: Record<string, any>[] | undefined;
  average?: number;
  data: ChartData;
}

function BarChartTooltip({ label, payload, average, data }: BarChartTooltipProps) {
  if (!payload) return null;

  const getStreamsValueFromMonth = (month: string) => {
    const monthData = data.find((item) => item.time === month)
    return monthData ? monthData.total_streams : 0
  }

  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md" className='bg-secondary'>
      <Text fw={600} mb={5}>
        {formatMonthAndYear(label || '')}
      </Text>
      <div>
        {payload.map((item: any) => (
          <div key={item.name} className='flex items-center justify-between gap-4'>
            <div>
              <ColorSwatch
                color={item.color}
                size={12}
                withShadow={false}
                className='inline-block mr-2'
              />
              <Text fz="sm" className='inline-block'>
                Time
              </Text>
            </div>
            <Text fw={600} fz="sm">
              {formatTime(item.value)}
            </Text>
          </div>
        ))}
        <div className='flex items-center justify-between gap-4'>
          <div>
            <ColorSwatch
              color="#0db14d"
              size={12}
              withShadow={false}
              className='inline-block mr-2'
            />
            <Text fz="sm" className='inline-block'>
              Streams
            </Text>
          </div>
          <Text fw={600} fz="sm">
            {getStreamsValueFromMonth(label)}
          </Text>
        </div>
        {average ? (
          <div className='flex items-center justify-between gap-4'>
            <div>
              <ColorSwatch
                color="#dc2626"
                size={12}
                withShadow={false}
                className='inline-block mr-2'
              />
              <Text fz="sm" className='inline-block'>
                Average
              </Text>
            </div>
            <Text fw={600} fz="sm">
              {formatTime(average)}
            </Text>
          </div>
        ) : null}
      </div>
    </Paper>
  );
}