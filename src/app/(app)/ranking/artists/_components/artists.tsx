'use client';

import { useTimeRangeStore } from '@/lib/state';
import { getArtists } from '@/lib/store';
import { RankingCard } from '@/app/(app)/ranking/_components/ranking-card';
import { Title } from '@mantine/core';
import { ErrorList } from '@/app/(app)/ranking/_components/error-list';

const Artists = () => {
  const { timeRange } = useTimeRangeStore()
  const artists = getArtists(timeRange)

  return (
    <div className="px-4 mx-auto w-full max-w-4xl flex flex-col gap-2 my-8">
      {artists ? artists.map((track, index) => (
        <div className='flex items-center w-full' key={index}>
          <Title order={1} className='w-24 text-center'>{`#${index + 1}`}</Title>
          <RankingCard
            title={track.name}
            image_url={track.image_url}
            score={track.score}
            ms_played={track.ms_played}
            total_played={track.total_played}
          />
        </div>
      )) : <ErrorList />}
    </div>
  )
}

export default Artists;
