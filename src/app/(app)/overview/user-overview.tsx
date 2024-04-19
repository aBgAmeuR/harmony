'use client'

import ScrollArea from '@/components/ui/scrollArea'
import { SpotifyBtn } from '@/components/ui/spotify-btn'
import { useTimeRangeStore } from '@/lib/state'
import { Image, Text, Title } from '@mantine/core'
import { ErrorList } from '../ranking/_components/error-list'
import { getHref } from '@/lib/utils'
import Link from 'next/link'
import { getAlbums, getArtists, getTracks, getUserInfo } from '@/lib/store'
import { ChartActivityMonth } from '@/components/chart-activity-month'
import { OverviewScrollSection } from './_components/overview-scroll-section'
import { StatsCardsSection } from '@/components/stats-cards-section'

const UserOverview = () => {
  const { timeRange } = useTimeRangeStore()
  const user = getUserInfo()
  const tracks = getTracks(timeRange)
  const artists = getArtists(timeRange)
  const albums = getAlbums(timeRange)
  if (!user || !tracks || !artists || !albums) return <ErrorList />

  return (
    <>
      <section className="bg-secondary">
        <div className="px-4 py-8 mx-auto w-full max-w-4xl flex gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className='size-40 flex justify-center items-center overflow-hidden rounded-full'>
              <Image src={user.image_url} alt={user.username} width={160} height={160} className='w-full min-h-full' />
            </div>
            <Title order={1}>{user.username}</Title>
          </div>
          <SpotifyBtn href={user.href} />
        </div>
      </section>
      <section className="px-4 pt-4 pb-32 md:py-8 mx-auto w-full max-w-4xl flex flex-col gap-4">
        <StatsCardsSection version='scroll' />
        <OverviewScrollSection title='Top tracks' type='tracks' data={tracks} image_rounded='rounded' />
        <OverviewScrollSection title='Top artists' type='artists' data={artists} image_rounded='circle' />
        <OverviewScrollSection title='Top albums' type='albums' data={albums} image_rounded='rounded' />
        <ChartActivityMonth moreBtn />
      </section>
    </>
  )
}


export default UserOverview