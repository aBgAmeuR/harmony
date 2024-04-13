'use client'

import ScrollArea from '@/components/ui/scrollArea'
import { SpotifyBtn } from '@/components/ui/spotify-btn'
import { useTimeRangeStore } from '@/lib/state'
import { Image, Text, Title } from '@mantine/core'
import { ErrorList } from '../ranking/_components/error-list'
import { getHref } from '@/lib/utils'
import Link from 'next/link'
import { getAlbums, getArtists, getTracks, getUserInfo } from '@/lib/store'

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
      <section className="px-4 py-8 mx-auto w-full max-w-4xl flex flex-col gap-4">
        <div>
          <Title order={2} className='mb-1'>Sheer numbers</Title>
        </div>
        <div>
          <div className='flex items-center justify-between mb-1'>
            <Title order={2}>Top tracks</Title>
            <Link href='/ranking/tracks' className='text-primary'><Text fw={500}>More</Text></Link>
          </div>
          <ScrollArea orientation="horizontal">
            <div className="flex">
              {tracks.slice(0, 12).map((track, index) => (
                <Link key={index} href={getHref(track.spotify_uri, 'tracks')} className='flex flex-col gap-2 p-3 rounded-md hover:bg-secondary'>
                  <div className='size-32 flex justify-center items-center overflow-hidden rounded-sm'>
                    <Image src={track.image_url} alt={track.name} width={128} height={128} className='w-full min-h-full' />
                  </div>
                  <div>
                    <Title order={5} lineClamp={1}>{track.name}</Title>
                    <Text lineClamp={1}>{track.name}</Text>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div>
          <div className='flex items-center justify-between mb-1'>
            <Title order={2}>Top artists</Title>
            <Link href='/ranking/artists' className='text-primary'><Text fw={500}>More</Text></Link>
          </div>
          <ScrollArea orientation="horizontal">
            <div className="flex">
              {artists.slice(0, 12).map((artist, index) => (
                <Link key={index} href={getHref(artist.spotify_uri, 'artists')} className='flex flex-col gap-2 p-3 rounded-md hover:bg-secondary'>
                  <div className='size-32 flex justify-center items-center overflow-hidden rounded-full'>
                    <Image src={artist.image_url} alt={artist.name} width={128} height={128} className='w-full min-h-full' />
                  </div>
                  <div>
                    <Title order={5} lineClamp={1} className='text-center'>{artist.name}</Title>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div>
          <div className='flex items-center justify-between mb-1'>
            <Title order={2}>Top albums</Title>
            <Link href='/ranking/albums' className='text-primary'><Text fw={500}>More</Text></Link>
          </div>
          <ScrollArea orientation="horizontal">
            <div className="flex">
              {albums.slice(0, 12).map((album, index) => (
                <Link key={index} href={getHref(album.spotify_uri, 'albums')} className='flex flex-col gap-2 p-3 rounded-md hover:bg-secondary'>
                  <div className='size-32 flex justify-center items-center overflow-hidden rounded-sm'>
                    <Image src={album.image_url} alt={album.name} width={128} height={128} className='w-full min-h-full' />
                  </div>
                  <div>
                    <Title order={5} lineClamp={1}>{album.name}</Title>
                    <Text lineClamp={1}>{album.name}</Text>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </section>
    </>
  )
}


export default UserOverview