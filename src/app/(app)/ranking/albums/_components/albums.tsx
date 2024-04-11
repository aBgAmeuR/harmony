'use client';

import { RankingCard } from '@/app/(app)/ranking/_components/ranking-card';
import { useTimeRangeStore } from '@/lib/state';
import { getAlbums } from '@/lib/store';
import { Title } from '@mantine/core';

const Albums = () => {
  const { timeRange } = useTimeRangeStore()
  const albums = getAlbums(timeRange)

  return (
    <div className="px-4 mx-auto w-full max-w-4xl flex flex-col gap-2 my-8">
      {albums.map((track, index) => (
        <div className='flex items-center w-full'>
          <Title order={1} className='w-24 text-center'>{`#${index + 1}`}</Title>
          <RankingCard
            key={index}
            title={track.name}
            image_url={track.image_url}
            score={track.score}
            ms_played={track.ms_played}
            total_played={track.total_played}
          />
        </div>
      ))}
    </div>
  )
}

export default Albums;
