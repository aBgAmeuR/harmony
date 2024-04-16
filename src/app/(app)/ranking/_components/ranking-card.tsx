import { Card, Text } from '@mantine/core'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Image } from '@/components/ui/image'

type RankingCardProps = {
  title: string
  subtitle?: string
  image_url: string
  ms_played: number
  total_played: number
  href?: string
  image_variant?: 'rounded' | 'circle' | 'square'
}

const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  return minutes.toLocaleString('en-US')
}

export const RankingCard = ({ title, subtitle, image_url, ms_played, total_played, href, image_variant = 'rounded' }: RankingCardProps) => {
  const router = useRouter()
  const onClick = () => { if (href) router.push(href) }

  return (
    <Card className='w-full flex flex-row items-center justify-between rounded-xl cursor-pointer hover:bg-secondary group h-20' onClick={onClick}>
      <div className='flex items-center gap-4'>
        <Image url={image_url} alt={title} size='sm' variant={image_variant} />
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