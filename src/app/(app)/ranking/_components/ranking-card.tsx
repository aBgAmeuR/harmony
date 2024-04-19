import { Image } from '@/components/ui/image'
import { Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  const isMobile = useMediaQuery(`(max-width: 640px)`)

  return (
    <button className='w-full flex flex-row items-center justify-between rounded-xl cursor-pointer p-2 sm:p-4 bg-card text-left hover:bg-secondary group h-16 sm:h-20' onClick={onClick}>
      <div className='flex items-center gap-4'>
        <Image url={image_url} alt={title} size='sm' variant={image_variant} />
        <div className='flex flex-col'>
          <Text lineClamp={1} fw={600} size="md">{title}</Text>
          {subtitle ? <Text lineClamp={1} c="dimmed">{subtitle}</Text> : null}
        </div>
      </div>
      <div className='flex items-center justify-between w-28 sm:w-36 md:w-72 gap-4'>
        <div className="flex flex-col md:flex-row md:justify-between w-full">
          {isMobile ? (
            <>
              <Text className='whitespace-nowrap'>{formatTime(ms_played)}min</Text>
              <Text className='whitespace-nowrap'>x{total_played}</Text>
            </>
          ) : (
            <>
              <Text className='whitespace-nowrap'>{formatTime(ms_played)} minutes</Text>
              <Text className='hidden md:block'>•</Text>
              <Text className='whitespace-nowrap'>{total_played} streams</Text>
            </>
          )}
        </div>
        <ChevronRight className='group-hover:translate-x-1 duration-100' />
      </div>
    </button>
  )
}