import { Image } from '@/components/ui/image'
import ScrollArea from '@/components/ui/scrollArea'
import { getHref } from '@/lib/utils'
import { Album, Artist, Track } from '@/types'
import { Text, Title } from '@mantine/core'
import Link from 'next/link'

type Props = {
  title: string
  image_rounded: 'rounded' | 'circle' | 'square'
  type: 'artists' | 'albums' | 'tracks'
  data: Artist[] | Album[] | Track[]
}

export const OverviewScrollSection = ({ data, title, type, image_rounded }: Props) => {
  return (
    <section>
      <div className='flex items-center justify-between mb-1'>
        <Title order={2}>{title}</Title>
        <Link href={`/ranking/${type}`} className='text-primary py-1 pl-2'><Text fw={500}>More</Text></Link>
      </div>
      <ScrollArea orientation="horizontal">
        <div className="flex">
          {data.slice(0, 12).map((item, index) => (
            <Link key={index} href={getHref(item.spotify_uri, type)} className='flex flex-col gap-2 p-3 w-[152px] rounded-md hover:bg-secondary'>
              <Image alt={item.name} url={item.image_url} size='md' variant={image_rounded} className='' />
              <div>
                {'artist' in item ? (<Title order={5} lineClamp={1}>{item.name}</Title>) : (
                  <Title order={5} lineClamp={1} className='text-center'>{item.name}</Title>
                )}
                {'artist' in item ? (<Text lineClamp={1}>{item.artist.name}</Text>) : null}
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </section>
  )
}
