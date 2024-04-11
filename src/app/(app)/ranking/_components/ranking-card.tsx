import { Card, Text } from '@mantine/core'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

type RankingCardProps = {
  title: string
  subtitle?: string
  image_url: string
  score: number
  ms_played: number
  total_played: number
}

const formatTime = (ms: number) => {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor(((ms % 3600000) % 60000) / 1000)

  return `${hours}h ${minutes}m ${seconds}s`
}

export const RankingCard = ({ title, subtitle, image_url, score, ms_played, total_played }: RankingCardProps) => {
  return (
    <Card className='w-full flex flex-row items-center justify-between rounded-xl cursor-pointer hover:bg-secondary group'>
      <div className='flex items-center gap-4'>
        <Image src={image_url} alt={title} width={50} height={50} className='rounded-sm' />
        <div className='flex flex-col'>
          <Text lineClamp={1} fw={600} size="md">{title}</Text>
          {subtitle ? <Text lineClamp={1} c="dimmed">{subtitle}</Text> : null}
        </div>
      </div>
      {/* <p>Score: {score}</p> */}
      <div className='flex items-center justify-between w-64 gap-1'>
        <div className="flex flex-col">
          <Text lineClamp={1}>Time Played: {formatTime(ms_played)}</Text>
          <Text lineClamp={1}>Times Played: {total_played}</Text>
        </div>
        <ChevronRight className='group-hover:translate-x-1 duration-100' />
      </div>
    </Card>

  )
}
