import { Card, Text } from '@mantine/core'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

type RankingCardProps = {
  title: string
  subtitle?: string
  image_url: string
  score: number
  ms_played: number
  total_played: number
  href?: string
}

const formatTime = (ms: number) => {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor(((ms % 3600000) % 60000) / 1000)

  return `${hours}h ${minutes}m ${seconds}s`
}

export const RankingCard = ({ title, subtitle, image_url, score, ms_played, total_played, href }: RankingCardProps) => {
  const router = useRouter()
  const handleClick = () => {
    if (href) router.push(href)
  }

  return (
    <Card className='w-full flex flex-row items-center justify-between rounded-xl cursor-pointer hover:bg-secondary group' onClick={handleClick}>
      <div className='flex items-center gap-4'>
        <div className='size-12 flex justify-center items-center object-cover overflow-hidden rounded-sm'>
          <Image src={image_url} alt={title} width={48} height={48} />
        </div>
        <div className='flex flex-col'>
          <Text lineClamp={1} fw={600} size="md">{title}</Text>
          {subtitle ? <Text lineClamp={1} c="dimmed">{subtitle}</Text> : null}
        </div>
      </div>
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
