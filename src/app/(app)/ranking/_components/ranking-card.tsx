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
  rounded?: boolean
}

const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  return minutes.toLocaleString('en-US')
}

export const RankingCard = ({ title, subtitle, image_url, score, ms_played, total_played, href, rounded = false }: RankingCardProps) => {
  const router = useRouter()
  const handleClick = () => {
    if (href) router.push(href)
  }

  return (
    <Card className='w-full flex flex-row items-center justify-between rounded-xl cursor-pointer hover:bg-secondary group h-20' onClick={handleClick}>
      <div className='flex items-center gap-4'>
        <div className={'size-12 flex justify-center items-center overflow-hidden ' + (rounded ? 'rounded-full' : 'rounded-sm')}>
          <Image src={image_url} alt={title} sizes='64px' width={64} height={64} className='h-full min-h-full' quality={80} />
        </div>
        <div className='flex flex-col'>
          <Text lineClamp={1} fw={600} size="md">{title}</Text>
          {subtitle ? <Text lineClamp={1} c="dimmed">{subtitle}</Text> : null}
        </div>
      </div>
      <div className='flex items-center justify-between w-72 gap-4'>
        <div className="flex flex-row justify-between w-full">
          <Text lineClamp={1}>{formatTime(ms_played)} minutes</Text>
          <Text>•</Text>
          <Text lineClamp={1}>{total_played} streams</Text>
        </div>
        <ChevronRight className='group-hover:translate-x-1 duration-100' />
      </div>
    </Card>

  )
}
